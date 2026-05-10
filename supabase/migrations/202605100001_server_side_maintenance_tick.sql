create index if not exists pe_rooms_expires_at_idx
on public.pe_rooms(expires_at)
where expires_at is not null;

create index if not exists pe_game_sessions_status_started_idx
on public.pe_game_sessions(status, started_at);

create index if not exists pe_game_sessions_status_seek_started_idx
on public.pe_game_sessions(status, seek_started_at);

create or replace function public.pe_maintenance_tick_room(target_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_hider_count integer := 0;
  active_session public.pe_game_sessions;
  changed boolean := false;
  enforcement_result jsonb := jsonb_build_object('eliminatedCount', 0);
  final_snapshot jsonb;
  hider_count integer := 0;
  reason text := 'no_due_change';
  remaining_count integer := 0;
  removed_count integer := 0;
  room_record public.pe_rooms;
begin
  active_session := public.pe_current_game_session(target_room_id);

  select *
  into room_record
  from public.pe_rooms
  where id = target_room_id;

  if active_session.id is null or active_session.status = 'finished' then
    return jsonb_build_object(
      'changed', false,
      'finalSnapshot', case
        when active_session.id is not null and room_record.phase = 'finished' and room_record.result is not null
          then public.pe_final_round_snapshot(target_room_id, active_session.id)
        else null
      end,
      'reason', 'no_active_round',
      'roomId', target_room_id
    );
  end if;

  enforcement_result := public.pe_enforce_location_rules(target_room_id);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null then
    return jsonb_build_object(
      'changed', true,
      'enforcement', enforcement_result,
      'reason', 'gps_enforcement_removed_round',
      'roomId', target_room_id
    );
  end if;

  if active_session.status = 'finished' then
    return jsonb_build_object(
      'changed', true,
      'enforcement', enforcement_result,
      'finalSnapshot', public.pe_final_round_snapshot(target_room_id, active_session.id),
      'reason', 'gps_enforcement_finished_round',
      'roomId', target_room_id
    );
  end if;

  if active_session.status = 'hiding' then
    if now() < active_session.started_at + make_interval(secs => active_session.hide_duration_seconds) then
      return jsonb_build_object(
        'changed', ((enforcement_result->>'eliminatedCount')::integer > 0),
        'enforcement', enforcement_result,
        'reason', 'hide_timer_running',
        'roomId', target_room_id
      );
    end if;

    insert into public.pe_player_exit_notices (player_id, room_id, reason)
    select id, room_id, 'not_hidden_in_time'
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id
      and status = 'Escondendo'
    on conflict (player_id) do update
      set reason = excluded.reason,
          created_at = now();

    delete from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id
      and status = 'Escondendo';

    get diagnostics removed_count = row_count;

    select count(*)
    into remaining_count
    from public.pe_players
    where room_id = target_room_id;

    if remaining_count = 0 then
      delete from public.pe_rooms where id = target_room_id;

      return jsonb_build_object(
        'changed', true,
        'enforcement', enforcement_result,
        'reason', 'room_empty',
        'removedPlayers', removed_count,
        'roomId', target_room_id
      );
    end if;

    if remaining_count < 2 then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = coalesce(finished_at, now()),
          winner = 'seeker'
      where id = active_session.id;

      update public.pe_players
      set status = case when is_leader then 'Entrou' else 'Aguardando' end
      where room_id = target_room_id;

      update public.pe_rooms
      set phase = 'lobby',
          result = null,
          closed_reason = 'not_enough_players',
          expires_at = public.pe_solo_expires_at(remaining_count)
      where id = target_room_id;

      return jsonb_build_object(
        'changed', true,
        'enforcement', enforcement_result,
        'reason', 'not_enough_players',
        'removedPlayers', removed_count,
        'roomId', target_room_id
      );
    end if;

    select count(*)
    into hider_count
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id;

    if hider_count = 0 then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = coalesce(finished_at, now()),
          winner = 'seeker'
      where id = active_session.id;

      update public.pe_rooms
      set phase = 'lobby',
          result = null,
          closed_reason = 'not_enough_players',
          expires_at = public.pe_solo_expires_at(remaining_count)
      where id = target_room_id;

      return jsonb_build_object(
        'changed', true,
        'enforcement', enforcement_result,
        'reason', 'no_hiders',
        'removedPlayers', removed_count,
        'roomId', target_room_id
      );
    end if;

    perform public.pe_release_seeker_internal(target_room_id, active_session.id, active_session.seeker_player_id);

    return jsonb_build_object(
      'changed', true,
      'enforcement', enforcement_result,
      'reason', 'hide_timer_finished',
      'removedPlayers', removed_count,
      'roomId', target_room_id
    );
  end if;

  if active_session.status = 'seeking' then
    select count(*)
    into remaining_count
    from public.pe_players
    where room_id = target_room_id;

    select count(*)
    into hider_count
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id;

    select count(*)
    into active_hider_count
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id
      and status <> 'Capturado';

    if active_hider_count = 0 then
      if remaining_count < 2 or hider_count = 0 then
        update public.pe_game_sessions
        set status = 'finished',
            finished_at = coalesce(finished_at, now()),
            winner = 'seeker'
        where id = active_session.id;

        update public.pe_players
        set status = case when is_leader then 'Entrou' else 'Aguardando' end
        where room_id = target_room_id;

        update public.pe_rooms
        set phase = 'lobby',
            result = null,
            closed_reason = 'not_enough_players',
            expires_at = public.pe_solo_expires_at(remaining_count)
        where id = target_room_id;

        return jsonb_build_object(
          'changed', true,
          'enforcement', enforcement_result,
          'reason', 'not_enough_players',
          'roomId', target_room_id
        );
      end if;

      final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'seeker');

      return jsonb_build_object(
        'changed', true,
        'enforcement', enforcement_result,
        'finalSnapshot', final_snapshot,
        'reason', 'all_hiders_captured',
        'roomId', target_room_id
      );
    end if;

    if active_session.seek_started_at is null
      or now() < active_session.seek_started_at + make_interval(secs => active_session.seek_duration_seconds) then
      return jsonb_build_object(
        'changed', ((enforcement_result->>'eliminatedCount')::integer > 0),
        'enforcement', enforcement_result,
        'reason', 'seek_timer_running',
        'roomId', target_room_id
      );
    end if;

    final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'hiders');

    return jsonb_build_object(
      'changed', true,
      'enforcement', enforcement_result,
      'finalSnapshot', final_snapshot,
      'reason', 'seek_timer_finished',
      'roomId', target_room_id
    );
  end if;

  return jsonb_build_object(
    'changed', changed,
    'enforcement', enforcement_result,
    'reason', reason,
    'roomId', target_room_id
  );
end;
$$;

create or replace function public.pe_run_maintenance_tick(
  target_room_id uuid default null,
  max_rooms integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleanup_after jsonb;
  cleanup_before jsonb;
  processed_count integer := 0;
  room_record record;
  tick_results jsonb := '[]'::jsonb;
  tick_result jsonb;
begin
  cleanup_before := public.pe_cleanup_expired_state();

  for room_record in
    select rooms.id
    from public.pe_rooms rooms
    where (
      target_room_id is not null
      and rooms.id = target_room_id
    ) or (
      target_room_id is null
      and exists (
        select 1
        from public.pe_game_sessions sessions
        where sessions.room_id = rooms.id
          and sessions.status in ('hiding', 'seeking')
      )
    ) or (
      target_room_id is null
      and rooms.expires_at is not null
      and rooms.expires_at <= now()
    )
    order by rooms.id
    limit least(greatest(coalesce(max_rooms, 50), 1), 250)
    for update of rooms skip locked
  loop
    tick_result := public.pe_maintenance_tick_room(room_record.id);
    tick_results := tick_results || jsonb_build_array(tick_result);
    processed_count := processed_count + 1;
  end loop;

  cleanup_after := public.pe_cleanup_expired_state();

  return jsonb_build_object(
    'cleanupAfter', cleanup_after,
    'cleanupBefore', cleanup_before,
    'processedRooms', processed_count,
    'results', tick_results,
    'serverTime', now()
  );
end;
$$;

comment on function public.pe_run_maintenance_tick(uuid, integer) is
  'Server-side maintenance entrypoint. Intended for Supabase Cron/manual SQL, not client gameplay. Runs due game ticks, GPS enforcement, and expired-state cleanup.';

revoke all on function public.pe_maintenance_tick_room(uuid) from public;
revoke all on function public.pe_maintenance_tick_room(uuid) from anon;
revoke all on function public.pe_run_maintenance_tick(uuid, integer) from public;
revoke all on function public.pe_run_maintenance_tick(uuid, integer) from anon;
revoke all on function public.pe_cleanup_expired_state() from public;
revoke all on function public.pe_cleanup_expired_state() from anon;

notify pgrst, 'reload schema';
