create or replace function public.pe_round_players_snapshot(target_room_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'avatarId', players.avatar_id,
        'id', players.id,
        'isLeader', players.is_leader,
        'nickname', players.nickname,
        'status', players.status
      )
      order by players.joined_at
    ),
    '[]'::jsonb
  )
  from public.pe_players players
  where players.room_id = target_room_id;
$$;

create or replace function public.pe_build_round_result(
  target_room_id uuid,
  target_game_session_id uuid,
  round_winner text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  captured_ids uuid[];
  duration_label text;
  finished_at timestamptz;
  highlight_avatar_id text;
  highlight_id uuid;
  highlight_nickname text;
  player_count integer;
  seeker_avatar_id text;
  seeker_id uuid;
  seeker_nickname text;
  session_started_at timestamptz;
  survivor_ids uuid[];
begin
  select session.seeker_player_id,
         session.started_at,
         coalesce(session.finished_at, now()),
         player.nickname,
         player.avatar_id
  into seeker_id, session_started_at, finished_at, seeker_nickname, seeker_avatar_id
  from public.pe_game_sessions session
  left join public.pe_players player on player.id = session.seeker_player_id
  where session.id = target_game_session_id
    and session.room_id = target_room_id;

  select count(*)
  into player_count
  from public.pe_players
  where room_id = target_room_id;

  duration_label := public.pe_format_duration_label(session_started_at, finished_at);

  if round_winner = 'seeker' then
    select coalesce(array_agg(id order by joined_at), '{}')
    into captured_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id;

    survivor_ids := '{}';
    highlight_id := seeker_id;
  else
    select id
    into highlight_id
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status <> 'Capturado'
    order by joined_at
    limit 1;

    highlight_id := coalesce(highlight_id, seeker_id);

    select coalesce(array_agg(id order by joined_at), '{}')
    into survivor_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status <> 'Capturado';

    select coalesce(array_agg(id order by joined_at), '{}')
    into captured_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status = 'Capturado';
  end if;

  select nickname, avatar_id
  into highlight_nickname, highlight_avatar_id
  from public.pe_players
  where id = highlight_id;

  return jsonb_build_object(
    'capturedPlayerIds', captured_ids,
    'durationLabel', duration_label,
    'finishedAt', finished_at,
    'gameSessionId', target_game_session_id,
    'highlightAvatarId', highlight_avatar_id,
    'highlightNickname', highlight_nickname,
    'highlightPlayerId', highlight_id,
    'playerCount', player_count,
    'seekerAvatarId', seeker_avatar_id,
    'seekerNickname', seeker_nickname,
    'seekerPlayerId', seeker_id,
    'survivorPlayerIds', survivor_ids,
    'winner', case when round_winner = 'seeker' then 'seeker' else 'hiders' end
  );
end;
$$;

create or replace function public.pe_final_round_snapshot(
  target_room_id uuid,
  target_game_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  room_record public.pe_rooms;
begin
  select *
  into room_record
  from public.pe_rooms
  where id = target_room_id;

  return jsonb_build_object(
    'expiresAt', room_record.expires_at,
    'finishedAt', room_record.result->>'finishedAt',
    'gameSessionId', target_game_session_id,
    'phase', room_record.phase,
    'players', public.pe_round_players_snapshot(target_room_id),
    'result', room_record.result,
    'roomCode', room_record.code,
    'roomId', room_record.id
  );
end;
$$;

create or replace function public.pe_close_round(
  target_room_id uuid,
  target_game_session_id uuid,
  round_winner text default 'hiders'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_finished_at timestamptz;
  result_payload jsonb;
begin
  select coalesce(sessions.finished_at, now())
  into v_finished_at
  from public.pe_game_sessions sessions
  where sessions.id = target_game_session_id
    and sessions.room_id = target_room_id;

  if v_finished_at is null then
    raise exception 'No round found';
  end if;

  update public.pe_game_sessions
  set status = 'finished',
      finished_at = v_finished_at,
      winner = case when round_winner = 'seeker' then 'seeker' else 'hiders' end
  where id = target_game_session_id
    and room_id = target_room_id;

  result_payload := public.pe_build_round_result(target_room_id, target_game_session_id, round_winner);

  update public.pe_game_sessions
  set highlight_player_id = nullif(result_payload->>'highlightPlayerId', '')::uuid
  where id = target_game_session_id
    and room_id = target_room_id;

  update public.pe_rooms
  set phase = 'finished',
      result = result_payload,
      closed_reason = null,
      expires_at = v_finished_at + interval '2 minutes'
  where id = target_room_id;

  delete from public.pe_capture_confirmations
  where room_id = target_room_id;

  delete from public.pe_player_hide_spots
  where room_id = target_room_id;

  delete from public.pe_player_locations
  where room_id = target_room_id;

  delete from public.pe_dev_test_distances
  where room_id = target_room_id;

  return public.pe_final_round_snapshot(target_room_id, target_game_session_id);
end;
$$;

drop function if exists public.pe_finish_round(uuid, uuid, text, text);

create or replace function public.pe_finish_round(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  round_winner text default 'hiders'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  room_record public.pe_rooms;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  select *
  into room_record
  from public.pe_rooms
  where id = target_room_id;

  if active_session.id is null then
    raise exception 'No round found';
  end if;

  if actor.id <> active_session.seeker_player_id and not actor.is_leader then
    raise exception 'Only the seeker or leader can finish a round';
  end if;

  if active_session.status = 'finished' and room_record.result is not null then
    return public.pe_final_round_snapshot(target_room_id, active_session.id);
  end if;

  return public.pe_close_round(target_room_id, active_session.id, round_winner);
end;
$$;

create or replace function public.pe_try_capture_nearest(
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
  capture_confirm_seconds double precision := 2;
  capture_started_at timestamptz;
  dev_control public.pe_dev_test_distances;
  final_snapshot jsonb;
  remaining_hiders integer;
  seeker_location public.pe_player_locations;
  target_distance_meters double precision;
  target_nickname text;
  target_hider_player_id uuid;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    raise exception 'No seeking phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can capture';
  end if;

  select *
  into dev_control
  from public.pe_dev_test_distances
  where room_id = target_room_id
    and game_session_id = active_session.id
    and seeker_player_id = actor.id
    and updated_at >= now() - interval '10 minutes';

  if dev_control.room_id is not null then
    capture_confirm_seconds := 0;

    select id, nickname
    into target_hider_player_id, target_nickname
    from public.pe_players
    where id = dev_control.hider_player_id
      and room_id = target_room_id
      and status <> 'Capturado';

    target_distance_meters := dev_control.distance_meters;
  else
    select *
    into seeker_location
    from public.pe_player_locations
    where player_id = actor.id
      and room_id = target_room_id
      and updated_at >= now() - interval '15 seconds';

    if seeker_location.player_id is null then
      delete from public.pe_capture_confirmations
      where seeker_player_id = actor.id;

      return jsonb_build_object('captured', false, 'reason', 'seeker_signal_unstable');
    end if;

    select players.id,
           players.nickname,
           public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
    into target_hider_player_id, target_nickname, target_distance_meters
    from public.pe_players players
    join public.pe_player_locations locations on locations.player_id = players.id
    where players.room_id = target_room_id
      and players.id <> active_session.seeker_player_id
      and players.status <> 'Capturado'
      and locations.updated_at >= now() - interval '15 seconds'
    order by public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
    limit 1;
  end if;

  if target_hider_player_id is null then
    delete from public.pe_capture_confirmations
    where seeker_player_id = actor.id;

    return jsonb_build_object('captured', false, 'reason', 'no_target_signal');
  end if;

  if target_distance_meters > 5 then
    delete from public.pe_capture_confirmations
    where seeker_player_id = actor.id;

    return jsonb_build_object(
      'captured', false,
      'reason', 'no_target_in_range',
      'targetPlayerId', target_hider_player_id,
      'distanceMeters', target_distance_meters
    );
  end if;

  delete from public.pe_capture_confirmations
  where seeker_player_id = actor.id
    and public.pe_capture_confirmations.target_player_id <> target_hider_player_id;

  insert into public.pe_capture_confirmations (
    seeker_player_id,
    target_player_id,
    room_id,
    game_session_id,
    started_at,
    last_seen_at
  )
  values (
    actor.id,
    target_hider_player_id,
    target_room_id,
    active_session.id,
    now(),
    now()
  )
  on conflict (seeker_player_id, target_player_id) do update
    set room_id = excluded.room_id,
        game_session_id = excluded.game_session_id,
        started_at = case
          when pe_capture_confirmations.game_session_id <> excluded.game_session_id then now()
          else pe_capture_confirmations.started_at
        end,
        last_seen_at = now()
  returning started_at into capture_started_at;

  if extract(epoch from (now() - capture_started_at)) < capture_confirm_seconds then
    return jsonb_build_object(
      'captured', false,
      'reason', 'confirming',
      'targetPlayerId', target_hider_player_id,
      'targetNickname', target_nickname,
      'distanceMeters', target_distance_meters,
      'confirmRemainingSeconds', greatest(0, ceil(capture_confirm_seconds - extract(epoch from (now() - capture_started_at))))::integer,
      'confirmStartedAt', capture_started_at
    );
  end if;

  update public.pe_players
  set status = 'Capturado'
  where id = target_hider_player_id
    and room_id = target_room_id;

  delete from public.pe_capture_confirmations
  where seeker_player_id = actor.id;

  select count(*)
  into remaining_hiders
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado';

  if remaining_hiders = 0 then
    final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'seeker');
  end if;

  return jsonb_build_object(
    'captured', true,
    'capturedPlayerId', target_hider_player_id,
    'capturedNickname', target_nickname,
    'finalSnapshot', final_snapshot,
    'remainingHiders', remaining_hiders,
    'distanceMeters', target_distance_meters
  );
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
  final_snapshot jsonb;
  hider_count integer;
  remaining_count integer;
  removed_count integer := 0;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null then
    return jsonb_build_object('changed', false, 'reason', 'no_active_round');
  end if;

  if active_session.status = 'finished' then
    return jsonb_build_object(
      'changed', false,
      'finalSnapshot', public.pe_final_round_snapshot(target_room_id, active_session.id),
      'reason', 'round_already_finished'
    );
  end if;

  enforcement_result := public.pe_enforce_location_rules(target_room_id);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null then
    return jsonb_build_object(
      'changed', true,
      'reason', 'gps_enforcement_removed_round',
      'enforcement', enforcement_result
    );
  end if;

  if active_session.status = 'finished' then
    return jsonb_build_object(
      'changed', true,
      'reason', 'gps_enforcement_finished_round',
      'finalSnapshot', public.pe_final_round_snapshot(target_room_id, active_session.id),
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

      final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'seeker');

      return jsonb_build_object('changed', true, 'reason', 'all_hiders_captured', 'finalSnapshot', final_snapshot, 'enforcement', enforcement_result);
    end if;

    if active_session.seek_started_at is null
      or now() < active_session.seek_started_at + make_interval(secs => active_session.seek_duration_seconds) then
      return jsonb_build_object('changed', false, 'reason', 'seek_timer_running', 'enforcement', enforcement_result);
    end if;

    final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'hiders');

    return jsonb_build_object('changed', true, 'reason', 'seek_timer_finished', 'finalSnapshot', final_snapshot, 'enforcement', enforcement_result);
  end if;

  return jsonb_build_object('changed', false, 'reason', 'unknown_state', 'enforcement', enforcement_result);
end;
$$;

create or replace function public.pe_simulate_capture(
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
  captured_player_id uuid;
  final_snapshot jsonb;
  remaining_hiders integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    raise exception 'No seeking phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can capture';
  end if;

  select id
  into captured_player_id
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado'
  order by joined_at
  limit 1;

  if captured_player_id is null then
    raise exception 'No hider left to capture';
  end if;

  update public.pe_players
  set status = 'Capturado'
  where id = captured_player_id;

  select count(*)
  into remaining_hiders
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado';

  if remaining_hiders = 0 then
    final_snapshot := public.pe_close_round(target_room_id, active_session.id, 'seeker');
  end if;

  return jsonb_build_object(
    'captured', true,
    'capturedPlayerId', captured_player_id,
    'finalSnapshot', final_snapshot,
    'remainingHiders', remaining_hiders
  );
end;
$$;

create or replace function public.pe_get_radar_hint(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  area_preset text default 'medium'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  angle_noise double precision;
  band text;
  bearing double precision;
  confidence double precision;
  confirm_remaining_seconds integer;
  elapsed_ratio double precision := 0;
  nearest_hider record;
  now_epoch double precision := extract(epoch from now());
  seeker_location public.pe_player_locations;
  signal_status text := 'lost';
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    return jsonb_build_object(
      'band', 'none',
      'confidence', 0,
      'reason', 'no_active_search',
      'signalStatus', 'lost'
    );
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can read radar hints';
  end if;

  select *
  into seeker_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id;

  if seeker_location.player_id is null or seeker_location.updated_at < now() - interval '30 seconds' then
    return jsonb_build_object(
      'band', 'none',
      'confidence', 0,
      'reason', 'seeker_signal_lost',
      'signalStatus', 'lost'
    );
  end if;

  select players.id,
         players.nickname,
         locations.updated_at,
         public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng) as distance_meters,
         public.pe_bearing_degrees(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng) as bearing_degrees
  into nearest_hider
  from public.pe_players players
  join public.pe_player_locations locations on locations.player_id = players.id
  where players.room_id = target_room_id
    and players.id <> active_session.seeker_player_id
    and players.status <> 'Capturado'
    and locations.updated_at >= now() - interval '30 seconds'
  order by public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
  limit 1;

  if nearest_hider.id is null then
    return jsonb_build_object(
      'band', 'none',
      'confidence', 0,
      'reason', 'no_target_signal',
      'signalStatus', 'lost'
    );
  end if;

  signal_status := public.pe_location_signal_status(nearest_hider.updated_at);
  band := case when signal_status = 'fresh' then public.pe_radar_band(nearest_hider.distance_meters, area_preset) else 'none' end;

  if active_session.seek_started_at is not null and active_session.seek_duration_seconds > 0 then
    elapsed_ratio := greatest(
      0,
      least(
        1,
        extract(epoch from (now() - active_session.seek_started_at)) / active_session.seek_duration_seconds
      )
    );
  end if;

  confidence := least(0.9, 0.25 + elapsed_ratio * 0.65);
  angle_noise := sin(now_epoch * 1.7 + length(nearest_hider.id::text)) * (1 - confidence) * 110;
  bearing := nearest_hider.bearing_degrees + angle_noise + 360;
  bearing := bearing - floor(bearing / 360) * 360;

  select greatest(0, ceil(2 - extract(epoch from (now() - started_at))))::integer
  into confirm_remaining_seconds
  from public.pe_capture_confirmations
  where seeker_player_id = actor.id
    and target_player_id = nearest_hider.id
    and room_id = target_room_id
    and game_session_id = active_session.id
    and last_seen_at >= now() - interval '5 seconds';

  return jsonb_build_object(
    'angleDegrees', bearing,
    'band', band,
    'canCapture', nearest_hider.distance_meters <= 5 and signal_status = 'fresh',
    'confidence', confidence,
    'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, 2),
    'distanceMetersApprox', round(nearest_hider.distance_meters::numeric),
    'signalStatus', signal_status,
    'targetNickname', nearest_hider.nickname,
    'targetPlayerId', nearest_hider.id,
    'updatedAt', now()
  );
end;
$$;

create or replace function public.pe_cleanup_expired_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_confirmations integer := 0;
  deleted_dev_controls integer := 0;
  deleted_hide_spots integer := 0;
  deleted_locations integer := 0;
  deleted_rooms integer := 0;
  deleted_empty_rooms integer := 0;
begin
  delete from public.pe_capture_confirmations
  where last_seen_at < now() - interval '10 minutes'
    or not exists (
      select 1 from public.pe_rooms rooms where rooms.id = pe_capture_confirmations.room_id
    );
  get diagnostics deleted_confirmations = row_count;

  delete from public.pe_dev_test_distances
  where updated_at < now() - interval '10 minutes'
    or not exists (
      select 1 from public.pe_rooms rooms where rooms.id = pe_dev_test_distances.room_id
    );
  get diagnostics deleted_dev_controls = row_count;

  delete from public.pe_player_hide_spots
  where locked_at < now() - interval '10 minutes'
    and not exists (
      select 1
      from public.pe_game_sessions sessions
      where sessions.id = pe_player_hide_spots.game_session_id
        and sessions.status in ('hiding', 'seeking')
    );
  get diagnostics deleted_hide_spots = row_count;

  delete from public.pe_player_locations
  where updated_at < now() - interval '10 minutes'
    or not exists (
      select 1
      from public.pe_game_sessions sessions
      where sessions.id = pe_player_locations.game_session_id
        and sessions.status in ('hiding', 'seeking')
    );
  get diagnostics deleted_locations = row_count;

  delete from public.pe_rooms
  where expires_at is not null
    and expires_at <= now();
  get diagnostics deleted_rooms = row_count;

  delete from public.pe_rooms rooms
  where not exists (
    select 1 from public.pe_players players where players.room_id = rooms.id
  );
  get diagnostics deleted_empty_rooms = row_count;
  deleted_rooms := deleted_rooms + deleted_empty_rooms;

  return jsonb_build_object(
    'deletedCaptureConfirmations', deleted_confirmations,
    'deletedDevControls', deleted_dev_controls,
    'deletedHideSpots', deleted_hide_spots,
    'deletedLocations', deleted_locations,
    'deletedRooms', deleted_rooms
  );
end;
$$;

create or replace function public.pe_create_room(
  nickname text,
  avatar_id text,
  max_players integer default 8
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_nickname text := left(coalesce(nullif(trim(nickname), ''), 'Jogador'), 24);
  new_code text;
  new_player_id uuid;
  new_room_id uuid;
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
begin
  perform public.pe_cleanup_expired_state();

  loop
    new_code := public.pe_random_room_code();
    exit when not exists (select 1 from public.pe_rooms where code = new_code);
  end loop;

  insert into public.pe_rooms (code, max_players, expires_at, closed_reason)
  values (new_code, least(greatest(max_players, 2), 8), now() + interval '6 minutes', null)
  returning id into new_room_id;

  insert into public.pe_players (room_id, nickname, avatar_id, status, is_leader, session_token_hash)
  values (new_room_id, clean_nickname, avatar_id, 'Entrou', true, extensions.crypt(session_token, extensions.gen_salt('bf')))
  returning id into new_player_id;

  return jsonb_build_object(
    'roomId', new_room_id,
    'activePlayerId', new_player_id,
    'playerSessionToken', session_token
  );
end;
$$;

create or replace function public.pe_join_room(
  room_code text,
  nickname text,
  avatar_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_nickname text := left(coalesce(nullif(trim(nickname), ''), 'Jogador'), 24);
  current_count integer;
  new_player_id uuid;
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
  target_room public.pe_rooms;
begin
  perform public.pe_cleanup_expired_state();

  select *
  into target_room
  from public.pe_rooms
  where code = upper(trim(room_code))
    and phase = 'lobby'
    and (expires_at is null or expires_at > now());

  if target_room.id is null then
    raise exception 'Room not found';
  end if;

  select count(*) into current_count from public.pe_players where room_id = target_room.id;

  if current_count >= target_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.pe_players (room_id, nickname, avatar_id, status, is_leader, session_token_hash)
  values (target_room.id, clean_nickname, avatar_id, 'Entrou', false, extensions.crypt(session_token, extensions.gen_salt('bf')))
  returning id into new_player_id;

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(current_count + 1)
  where id = target_room.id;

  return jsonb_build_object(
    'roomId', target_room.id,
    'activePlayerId', new_player_id,
    'playerSessionToken', session_token
  );
end;
$$;

revoke all on function public.pe_round_players_snapshot(uuid) from public;
revoke all on function public.pe_round_players_snapshot(uuid) from anon;
revoke all on function public.pe_build_round_result(uuid, uuid, text) from public;
revoke all on function public.pe_build_round_result(uuid, uuid, text) from anon;
revoke all on function public.pe_final_round_snapshot(uuid, uuid) from public;
revoke all on function public.pe_final_round_snapshot(uuid, uuid) from anon;
revoke all on function public.pe_close_round(uuid, uuid, text) from public;
revoke all on function public.pe_close_round(uuid, uuid, text) from anon;
grant execute on function public.pe_finish_round(uuid, uuid, text, text) to anon;
grant execute on function public.pe_try_capture_nearest(uuid, uuid, text) to anon;
grant execute on function public.pe_tick_game_session(uuid, uuid, text) to anon;
grant execute on function public.pe_simulate_capture(uuid, uuid, text) to anon;
grant execute on function public.pe_get_radar_hint(uuid, uuid, text, text) to anon;
grant execute on function public.pe_cleanup_expired_state() to anon;
grant execute on function public.pe_create_room(text, text, integer) to anon;
grant execute on function public.pe_join_room(text, text, text) to anon;

notify pgrst, 'reload schema';
