alter table public.pe_rooms
  add column if not exists environment_preset text not null default 'medium',
  add column if not exists hide_duration_seconds integer not null default 60,
  add column if not exists seek_duration_seconds integer not null default 180,
  add column if not exists capture_radius_meters double precision not null default 5,
  add column if not exists capture_confirm_seconds double precision not null default 2;

alter table public.pe_rooms
  drop constraint if exists pe_rooms_environment_preset_check,
  drop constraint if exists pe_rooms_hide_duration_seconds_check,
  drop constraint if exists pe_rooms_seek_duration_seconds_check,
  drop constraint if exists pe_rooms_capture_radius_meters_check,
  drop constraint if exists pe_rooms_capture_confirm_seconds_check;

alter table public.pe_rooms
  add constraint pe_rooms_environment_preset_check check (environment_preset in ('small', 'medium', 'large')),
  add constraint pe_rooms_hide_duration_seconds_check check (hide_duration_seconds in (30, 45, 60)),
  add constraint pe_rooms_seek_duration_seconds_check check (seek_duration_seconds in (120, 180, 300)),
  add constraint pe_rooms_capture_radius_meters_check check (capture_radius_meters between 4 and 6),
  add constraint pe_rooms_capture_confirm_seconds_check check (capture_confirm_seconds between 1.5 and 3);

alter table public.pe_game_sessions
  add column if not exists environment_preset text not null default 'medium',
  add column if not exists capture_radius_meters double precision not null default 5,
  add column if not exists capture_confirm_seconds double precision not null default 2;

alter table public.pe_game_sessions
  drop constraint if exists pe_game_sessions_environment_preset_check,
  drop constraint if exists pe_game_sessions_capture_radius_meters_check,
  drop constraint if exists pe_game_sessions_capture_confirm_seconds_check;

alter table public.pe_game_sessions
  add constraint pe_game_sessions_environment_preset_check check (environment_preset in ('small', 'medium', 'large')),
  add constraint pe_game_sessions_capture_radius_meters_check check (capture_radius_meters between 4 and 6),
  add constraint pe_game_sessions_capture_confirm_seconds_check check (capture_confirm_seconds between 1.5 and 3);

create or replace function public.pe_capture_radius_for_preset(environment_preset text)
returns double precision
language sql
stable
set search_path = public
as $$
  select case
    when environment_preset = 'small' then 4.5
    when environment_preset = 'large' then 6
    else 5
  end;
$$;

create or replace function public.pe_capture_confirm_for_preset(environment_preset text)
returns double precision
language sql
stable
set search_path = public
as $$
  select case
    when environment_preset = 'small' then 2.5
    else 2
  end;
$$;

create or replace function public.pe_update_room_rules(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  environment_preset text,
  hide_duration_seconds integer,
  seek_duration_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  safe_environment text := case when environment_preset in ('small', 'medium', 'large') then environment_preset else 'medium' end;
  safe_hide_seconds integer := case when hide_duration_seconds in (30, 45, 60) then hide_duration_seconds else 60 end;
  safe_seek_seconds integer := case when seek_duration_seconds in (120, 180, 300) then seek_duration_seconds else 180 end;
  updated_room public.pe_rooms;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can change room rules';
  end if;

  if not exists (
    select 1
    from public.pe_rooms rooms
    where rooms.id = target_room_id
      and rooms.phase = 'lobby'
  ) then
    raise exception 'Rules can only be changed in the lobby';
  end if;

  update public.pe_rooms
  set environment_preset = safe_environment,
      hide_duration_seconds = safe_hide_seconds,
      seek_duration_seconds = safe_seek_seconds,
      capture_radius_meters = public.pe_capture_radius_for_preset(safe_environment),
      capture_confirm_seconds = public.pe_capture_confirm_for_preset(safe_environment)
  where id = target_room_id
  returning * into updated_room;

  update public.pe_players
  set status = 'Aguardando'
  where room_id = target_room_id
    and not is_leader
    and status = 'Preparado';

  return jsonb_build_object(
    'captureConfirmSeconds', updated_room.capture_confirm_seconds,
    'captureRadiusMeters', updated_room.capture_radius_meters,
    'environmentPreset', updated_room.environment_preset,
    'hideDurationSeconds', updated_room.hide_duration_seconds,
    'seekDurationSeconds', updated_room.seek_duration_seconds
  );
end;
$$;

create or replace function public.pe_start_round(
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
  current_session_id uuid;
  not_ready_names text[];
  player_count integer;
  room_rules public.pe_rooms;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can start a round';
  end if;

  select *
  into room_rules
  from public.pe_rooms
  where id = target_room_id;

  select count(*) into player_count from public.pe_players where room_id = target_room_id;

  if player_count < 2 then
    raise exception 'At least 2 players are required';
  end if;

  select coalesce(array_agg(nickname order by joined_at), '{}')
  into not_ready_names
  from public.pe_players
  where room_id = target_room_id
    and id <> actor.id
    and status <> 'Preparado';

  if array_length(not_ready_names, 1) > 0 then
    update public.pe_rooms
    set lobby_notice = jsonb_build_object(
          'type', 'players_not_ready',
          'names', not_ready_names,
          'createdAt', now()
        )
    where id = target_room_id;

    return jsonb_build_object(
      'started', false,
      'reason', 'players_not_ready',
      'missingReadyNames', not_ready_names
    );
  end if;

  update public.pe_rooms
  set phase = 'hiding',
      result = null,
      closed_reason = null,
      lobby_notice = null
  where id = target_room_id;

  update public.pe_players
  set status = case when id = actor.id then 'Procurando' else 'Escondendo' end
  where room_id = target_room_id;

  insert into public.pe_game_sessions (
    room_id,
    seeker_player_id,
    status,
    hide_duration_seconds,
    seek_duration_seconds,
    environment_preset,
    capture_radius_meters,
    capture_confirm_seconds
  )
  values (
    target_room_id,
    actor.id,
    'hiding',
    room_rules.hide_duration_seconds,
    room_rules.seek_duration_seconds,
    room_rules.environment_preset,
    room_rules.capture_radius_meters,
    room_rules.capture_confirm_seconds
  )
  returning id into current_session_id;

  return jsonb_build_object('started', true, 'gameSessionId', current_session_id);
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
  capture_radius_meters double precision := 5;
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

  capture_confirm_seconds := coalesce(active_session.capture_confirm_seconds, 2);
  capture_radius_meters := coalesce(active_session.capture_radius_meters, 5);

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

  if target_distance_meters > capture_radius_meters then
    delete from public.pe_capture_confirmations
    where seeker_player_id = actor.id;

    return jsonb_build_object(
      'captured', false,
      'captureRadiusMeters', capture_radius_meters,
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
      'captureRadiusMeters', capture_radius_meters,
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
    'captureRadiusMeters', capture_radius_meters,
    'finalSnapshot', final_snapshot,
    'remainingHiders', remaining_hiders,
    'distanceMeters', target_distance_meters
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
  capture_radius_meters double precision := 5;
  confidence double precision;
  confirm_remaining_seconds integer;
  dev_control public.pe_dev_test_distances;
  elapsed_ratio double precision := 0;
  nearest_hider record;
  now_epoch double precision := extract(epoch from now());
  radar_preset text := area_preset;
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

  radar_preset := coalesce(active_session.environment_preset, area_preset, 'medium');
  capture_radius_meters := coalesce(active_session.capture_radius_meters, 5);

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

  select *
  into dev_control
  from public.pe_dev_test_distances
  where room_id = target_room_id
    and game_session_id = active_session.id
    and seeker_player_id = actor.id
    and updated_at >= now() - interval '10 minutes';

  if dev_control.room_id is not null then
    select players.id,
           players.nickname
    into nearest_hider
    from public.pe_players players
    where players.id = dev_control.hider_player_id
      and players.room_id = target_room_id
      and players.status <> 'Capturado';

    if nearest_hider.id is null then
      return jsonb_build_object(
        'band', 'none',
        'confidence', 0,
        'reason', 'no_target_signal',
        'signalStatus', 'lost'
      );
    end if;

    band := public.pe_radar_band(dev_control.distance_meters, radar_preset);
    bearing := coalesce(dev_control.bearing_degrees, 0) + 360;
    bearing := bearing - floor(bearing / 360) * 360;

    select greatest(0, ceil(coalesce(active_session.capture_confirm_seconds, 2) - extract(epoch from (now() - started_at))))::integer
    into confirm_remaining_seconds
    from public.pe_capture_confirmations
    where seeker_player_id = actor.id
      and target_player_id = dev_control.hider_player_id
      and room_id = target_room_id
      and game_session_id = active_session.id
      and last_seen_at >= now() - interval '5 seconds';

    return jsonb_build_object(
      'angleDegrees', bearing,
      'band', band,
      'canCapture', dev_control.distance_meters <= capture_radius_meters,
      'cardinal', dev_control.cardinal,
      'confidence', confidence,
      'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, ceil(coalesce(active_session.capture_confirm_seconds, 2))::integer),
      'devOverride', true,
      'distanceMetersApprox', round(dev_control.distance_meters::numeric),
      'environmentPreset', radar_preset,
      'signalStatus', 'fresh',
      'targetNickname', nearest_hider.nickname,
      'targetPlayerId', dev_control.hider_player_id,
      'updatedAt', now()
    );
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
  band := case when signal_status = 'fresh' then public.pe_radar_band(nearest_hider.distance_meters, radar_preset) else 'none' end;

  angle_noise := sin(now_epoch * 1.7 + length(nearest_hider.id::text)) * (1 - confidence) * 110;
  bearing := nearest_hider.bearing_degrees + angle_noise + 360;
  bearing := bearing - floor(bearing / 360) * 360;

  select greatest(0, ceil(coalesce(active_session.capture_confirm_seconds, 2) - extract(epoch from (now() - started_at))))::integer
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
    'canCapture', nearest_hider.distance_meters <= capture_radius_meters and signal_status = 'fresh',
    'confidence', confidence,
    'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, ceil(coalesce(active_session.capture_confirm_seconds, 2))::integer),
    'distanceMetersApprox', round(nearest_hider.distance_meters::numeric),
    'environmentPreset', radar_preset,
    'signalStatus', signal_status,
    'targetNickname', nearest_hider.nickname,
    'targetPlayerId', nearest_hider.id,
    'updatedAt', now()
  );
end;
$$;

create or replace function public.pe_get_hider_danger_hint(
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
  danger_distance double precision;
  distance_meters double precision;
  hider_location public.pe_player_locations;
  near_distance double precision;
  seeker_location public.pe_player_locations;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    return jsonb_build_object('level', 'calm', 'signalStatus', 'lost');
  end if;

  if actor.id = active_session.seeker_player_id then
    raise exception 'Seeker cannot read hider danger hints';
  end if;

  danger_distance := greatest(8, coalesce(active_session.capture_radius_meters, 5) + 3);
  near_distance := case
    when coalesce(active_session.environment_preset, 'medium') = 'small' then 14
    when coalesce(active_session.environment_preset, 'medium') = 'large' then 28
    else 20
  end;

  select *
  into hider_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id
    and updated_at >= now() - interval '30 seconds';

  select *
  into seeker_location
  from public.pe_player_locations
  where player_id = active_session.seeker_player_id
    and room_id = target_room_id
    and updated_at >= now() - interval '30 seconds';

  if hider_location.player_id is null or seeker_location.player_id is null then
    return jsonb_build_object('level', 'calm', 'signalStatus', 'lost');
  end if;

  distance_meters := public.pe_distance_meters(hider_location.lat, hider_location.lng, seeker_location.lat, seeker_location.lng);

  return jsonb_build_object(
    'distanceMetersApprox', round(distance_meters::numeric),
    'environmentPreset', active_session.environment_preset,
    'level', case
      when distance_meters <= danger_distance then 'danger'
      when distance_meters <= near_distance then 'near'
      else 'calm'
    end,
    'signalStatus', 'fresh',
    'updatedAt', now()
  );
end;
$$;

grant execute on function public.pe_update_room_rules(uuid, uuid, text, text, integer, integer) to anon;
grant execute on function public.pe_start_round(uuid, uuid, text) to anon;
grant execute on function public.pe_try_capture_nearest(uuid, uuid, text) to anon;
grant execute on function public.pe_get_radar_hint(uuid, uuid, text, text) to anon;
grant execute on function public.pe_get_hider_danger_hint(uuid, uuid, text) to anon;
revoke all on function public.pe_capture_radius_for_preset(text) from public;
revoke all on function public.pe_capture_radius_for_preset(text) from anon;
revoke all on function public.pe_capture_confirm_for_preset(text) from public;
revoke all on function public.pe_capture_confirm_for_preset(text) from anon;

notify pgrst, 'reload schema';
