create or replace function public.pe_dev_clear_test_distance(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is not null and actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can clear test distance';
  end if;

  if active_session.id is null and not actor.is_leader then
    raise exception 'Only the leader can clear test distance';
  end if;

  delete from public.pe_dev_test_distances
  where room_id = target_room_id;

  return jsonb_build_object('changed', true);
end;
$$;

create or replace function public.pe_get_room_debug_snapshot(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  dev_control public.pe_dev_test_distances;
  room_record public.pe_rooms;
  players_payload jsonb;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can read debug snapshot';
  end if;

  select *
  into room_record
  from public.pe_rooms
  where id = target_room_id;

  active_session := public.pe_current_game_session(target_room_id);

  select *
  into dev_control
  from public.pe_dev_test_distances
  where room_id = target_room_id
    and (active_session.id is null or game_session_id = active_session.id)
  order by updated_at desc
  limit 1;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', players.id,
      'nickname', players.nickname,
      'status', players.status,
      'isLeader', players.is_leader,
      'isSeeker', active_session.id is not null and players.id = active_session.seeker_player_id,
      'signalAgeSeconds', case
        when locations.updated_at is null then null
        else greatest(0, floor(extract(epoch from (now() - locations.updated_at)))::integer)
      end,
      'signalStatus', public.pe_location_signal_status(locations.updated_at),
      'accuracyMeters', case
        when locations.accuracy_m is null then null
        else round(locations.accuracy_m::numeric)
      end,
      'hasHideSpot', hide_spots.player_id is not null,
      'hideAgeSeconds', case
        when hide_spots.locked_at is null then null
        else greatest(0, floor(extract(epoch from (now() - hide_spots.locked_at)))::integer)
      end,
      'hideDriftMeters', case
        when hide_spots.player_id is null or locations.player_id is null then null
        else round(public.pe_distance_meters(hide_spots.lat, hide_spots.lng, locations.lat, locations.lng)::numeric)
      end,
      'hideViolationAgeSeconds', case
        when hide_spots.violation_started_at is null then null
        else greatest(0, floor(extract(epoch from (now() - hide_spots.violation_started_at)))::integer)
      end
    )
    order by players.joined_at
  ), '[]'::jsonb)
  into players_payload
  from public.pe_players players
  left join public.pe_player_locations locations on locations.player_id = players.id
  left join public.pe_player_hide_spots hide_spots on hide_spots.player_id = players.id
  where players.room_id = target_room_id;

  return jsonb_build_object(
    'roomId', target_room_id,
    'roomCode', room_record.code,
    'roomPhase', room_record.phase,
    'closedReason', room_record.closed_reason,
    'serverTime', now(),
    'activePlayerId', actor.id,
    'gameSession', case
      when active_session.id is null then null
      else jsonb_build_object(
        'id', active_session.id,
        'status', active_session.status,
        'seekerPlayerId', active_session.seeker_player_id,
        'startedAgeSeconds', greatest(0, floor(extract(epoch from (now() - active_session.started_at)))::integer),
        'seekAgeSeconds', case
          when active_session.seek_started_at is null then null
          else greatest(0, floor(extract(epoch from (now() - active_session.seek_started_at)))::integer)
        end,
        'hideDurationSeconds', active_session.hide_duration_seconds,
        'seekDurationSeconds', active_session.seek_duration_seconds
      )
    end,
    'devDistance', case
      when dev_control.room_id is null then null
      else jsonb_build_object(
        'active', dev_control.updated_at >= now() - interval '10 minutes',
        'distanceMeters', round(dev_control.distance_meters::numeric),
        'hiderPlayerId', dev_control.hider_player_id,
        'seekerPlayerId', dev_control.seeker_player_id,
        'ageSeconds', greatest(0, floor(extract(epoch from (now() - dev_control.updated_at)))::integer)
      )
    end,
    'players', players_payload
  );
end;
$$;

create or replace function public.pe_mark_hidden(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  latest_location public.pe_player_locations;
  remaining_hiders integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'hiding' then
    raise exception 'No hiding phase is active';
  end if;

  if actor.id = active_session.seeker_player_id then
    raise exception 'Seeker cannot mark hidden';
  end if;

  select *
  into latest_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id
    and updated_at >= now() - interval '15 seconds';

  if latest_location.player_id is null then
    raise exception 'Aguardando GPS para salvar seu esconderijo';
  end if;

  insert into public.pe_player_hide_spots (
    player_id,
    room_id,
    game_session_id,
    lat,
    lng,
    accuracy_m,
    locked_at
  )
  values (
    actor.id,
    target_room_id,
    active_session.id,
    latest_location.lat,
    latest_location.lng,
    latest_location.accuracy_m,
    now()
  )
  on conflict (player_id) do update
    set room_id = excluded.room_id,
        game_session_id = excluded.game_session_id,
        lat = excluded.lat,
        lng = excluded.lng,
        accuracy_m = excluded.accuracy_m,
        locked_at = now(),
        violation_started_at = null,
        last_violation_at = null;

  update public.pe_players
  set status = 'Escondido'
  where id = actor.id
    and room_id = target_room_id;

  select count(*)
  into remaining_hiders
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Escondido';

  if remaining_hiders = 0 then
    perform public.pe_release_seeker(target_room_id, actor.id, player_session_token, true);
  end if;
end;
$$;

create or replace function public.pe_tick_game_session(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  active_hider_count integer;
  enforcement_result jsonb;
  hider_count integer;
  remaining_count integer;
  removed_count integer := 0;
  result_payload jsonb;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status = 'finished' then
    return jsonb_build_object('changed', false, 'reason', 'no_active_round');
  end if;

  enforcement_result := public.pe_enforce_location_rules(target_room_id);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status = 'finished' then
    return jsonb_build_object(
      'changed', true,
      'reason', 'gps_enforcement_finished_round',
      'enforcement', enforcement_result
    );
  end if;

  if active_session.status = 'hiding' then
    if now() < active_session.started_at + make_interval(secs => active_session.hide_duration_seconds) then
      return jsonb_build_object('changed', false, 'reason', 'hide_timer_running', 'enforcement', enforcement_result);
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

    select count(*) into remaining_count from public.pe_players where room_id = target_room_id;

    if remaining_count = 0 then
      delete from public.pe_rooms where id = target_room_id;
      return jsonb_build_object('changed', true, 'reason', 'room_empty', 'removedPlayers', removed_count, 'enforcement', enforcement_result);
    end if;

    if remaining_count < 2 then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = now(),
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

      return jsonb_build_object('changed', true, 'reason', 'not_enough_players', 'removedPlayers', removed_count, 'enforcement', enforcement_result);
    end if;

    select count(*)
    into hider_count
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id;

    if hider_count = 0 then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = now(),
          winner = 'seeker'
      where id = active_session.id;

      update public.pe_rooms
      set phase = 'lobby',
          result = null,
          closed_reason = 'not_enough_players',
          expires_at = public.pe_solo_expires_at(remaining_count)
      where id = target_room_id;

      return jsonb_build_object('changed', true, 'reason', 'no_hiders', 'removedPlayers', removed_count, 'enforcement', enforcement_result);
    end if;

    perform public.pe_release_seeker_internal(target_room_id, active_session.id, active_session.seeker_player_id);

    return jsonb_build_object('changed', true, 'reason', 'hide_timer_finished', 'removedPlayers', removed_count, 'enforcement', enforcement_result);
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
            finished_at = now(),
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

        return jsonb_build_object('changed', true, 'reason', 'not_enough_players', 'enforcement', enforcement_result);
      end if;

      result_payload := public.pe_build_round_result(target_room_id, active_session.id, 'seeker');

      update public.pe_game_sessions
      set status = 'finished',
          finished_at = now(),
          winner = 'seeker',
          highlight_player_id = (result_payload->>'highlightPlayerId')::uuid
      where id = active_session.id;

      update public.pe_rooms
      set phase = 'finished',
          result = result_payload
      where id = target_room_id;

      return jsonb_build_object('changed', true, 'reason', 'all_hiders_captured', 'enforcement', enforcement_result);
    end if;

    if active_session.seek_started_at is null
      or now() < active_session.seek_started_at + make_interval(secs => active_session.seek_duration_seconds) then
      return jsonb_build_object('changed', false, 'reason', 'seek_timer_running', 'enforcement', enforcement_result);
    end if;

    result_payload := public.pe_build_round_result(target_room_id, active_session.id, 'hiders');

    update public.pe_game_sessions
    set status = 'finished',
        finished_at = now(),
        winner = 'hiders',
        highlight_player_id = (result_payload->>'highlightPlayerId')::uuid
    where id = active_session.id;

    update public.pe_rooms
    set phase = 'finished',
        result = result_payload
    where id = target_room_id;

    return jsonb_build_object('changed', true, 'reason', 'seek_timer_finished', 'enforcement', enforcement_result);
  end if;

  return jsonb_build_object('changed', false, 'reason', 'unknown_state', 'enforcement', enforcement_result);
end;
$$;

grant execute on function public.pe_dev_clear_test_distance(uuid, uuid, text) to anon;
grant execute on function public.pe_get_room_debug_snapshot(uuid, uuid, text) to anon;
grant execute on function public.pe_mark_hidden(uuid, uuid, text) to anon;
grant execute on function public.pe_tick_game_session(uuid, uuid, text) to anon;

notify pgrst, 'reload schema';
