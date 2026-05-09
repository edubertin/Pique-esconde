alter table public.pe_dev_test_distances
  add column if not exists bearing_degrees double precision not null default 0,
  add column if not exists cardinal text not null default 'N';

alter table public.pe_dev_test_distances
  drop constraint if exists pe_dev_test_distances_cardinal_check;

alter table public.pe_dev_test_distances
  add constraint pe_dev_test_distances_cardinal_check
  check (cardinal in ('N', 'S', 'E', 'W'));

create or replace function public.pe_dev_add_target_player(
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
  current_count integer;
  target_player public.pe_players;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can create a DEV target';
  end if;

  select *
  into target_player
  from public.pe_players
  where room_id = target_room_id
    and nickname = 'Alvo DEV'
  order by joined_at
  limit 1;

  if target_player.id is not null then
    update public.pe_players
    set status = 'Preparado',
        is_leader = false,
        last_seen_at = now()
    where id = target_player.id
    returning * into target_player;

    return jsonb_build_object(
      'created', false,
      'playerId', target_player.id,
      'nickname', target_player.nickname
    );
  end if;

  select count(*) into current_count
  from public.pe_players
  where room_id = target_room_id;

  if current_count >= 8 then
    raise exception 'Room is full';
  end if;

  insert into public.pe_players (
    room_id,
    nickname,
    avatar_id,
    status,
    is_leader,
    session_token_hash
  )
  values (
    target_room_id,
    'Alvo DEV',
    'avatar_04',
    'Preparado',
    false,
    extensions.crypt(encode(extensions.gen_random_bytes(24), 'base64'), extensions.gen_salt('bf'))
  )
  returning * into target_player;

  return jsonb_build_object(
    'created', true,
    'playerId', target_player.id,
    'nickname', target_player.nickname
  );
end;
$$;

create or replace function public.pe_dev_set_test_distance(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  distance_meters double precision,
  bearing_degrees double precision default 0,
  cardinal text default 'N'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  clamped_bearing double precision := bearing_degrees - floor(bearing_degrees / 360) * 360;
  clamped_distance double precision := least(greatest(distance_meters, 0), 60);
  hider public.pe_players;
  safe_cardinal text := case when cardinal in ('N', 'S', 'E', 'W') then cardinal else 'N' end;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    raise exception 'No seeking phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can set test distance';
  end if;

  select *
  into hider
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado'
  order by case when nickname = 'Alvo DEV' then 0 else 1 end, joined_at
  limit 1;

  if hider.id is null then
    delete from public.pe_dev_test_distances
    where room_id = target_room_id;

    return jsonb_build_object('changed', false, 'reason', 'no_active_hider');
  end if;

  insert into public.pe_dev_test_distances (
    room_id,
    game_session_id,
    seeker_player_id,
    hider_player_id,
    distance_meters,
    bearing_degrees,
    cardinal,
    updated_at
  )
  values (
    target_room_id,
    active_session.id,
    actor.id,
    hider.id,
    clamped_distance,
    clamped_bearing,
    safe_cardinal,
    now()
  )
  on conflict (room_id) do update
    set game_session_id = excluded.game_session_id,
        seeker_player_id = excluded.seeker_player_id,
        hider_player_id = excluded.hider_player_id,
        distance_meters = excluded.distance_meters,
        bearing_degrees = excluded.bearing_degrees,
        cardinal = excluded.cardinal,
        updated_at = now();

  return jsonb_build_object(
    'changed', true,
    'distanceMeters', clamped_distance,
    'bearingDegrees', clamped_bearing,
    'cardinal', safe_cardinal,
    'hiderPlayerId', hider.id,
    'seekerPlayerId', actor.id
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
  dev_control public.pe_dev_test_distances;
  elapsed_ratio double precision := 0;
  nearest_bearing_degrees double precision;
  nearest_distance_meters double precision;
  nearest_hider_id uuid;
  nearest_hider_nickname text;
  nearest_hider_updated_at timestamptz;
  noise_ratio double precision;
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

  if active_session.seek_started_at is not null and active_session.seek_duration_seconds > 0 then
    elapsed_ratio := greatest(
      0,
      least(
        1,
        extract(epoch from (now() - active_session.seek_started_at)) / active_session.seek_duration_seconds
      )
    );
  end if;

  noise_ratio := 0.6 - elapsed_ratio * 0.4;
  confidence := 1 - noise_ratio;

  select *
  into dev_control
  from public.pe_dev_test_distances
  where room_id = target_room_id
    and game_session_id = active_session.id
    and seeker_player_id = actor.id
    and updated_at >= now() - interval '10 minutes';

  if dev_control.room_id is not null then
    select nickname
    into nearest_hider_nickname
    from public.pe_players
    where id = dev_control.hider_player_id
      and room_id = target_room_id
      and status <> 'Capturado';

    if nearest_hider_nickname is null then
      return jsonb_build_object(
        'band', 'none',
        'confidence', 0,
        'reason', 'no_target_signal',
        'signalStatus', 'lost'
      );
    end if;

    band := public.pe_radar_band(dev_control.distance_meters, area_preset);
    bearing := coalesce(dev_control.bearing_degrees, 0) + 360;
    bearing := bearing - floor(bearing / 360) * 360;

    select greatest(0, ceil(3 - extract(epoch from (now() - started_at))))::integer
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
      'canCapture', dev_control.distance_meters <= 5,
      'cardinal', dev_control.cardinal,
      'confidence', confidence,
      'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, 3),
      'distanceMetersApprox', round(dev_control.distance_meters::numeric),
      'signalStatus', 'fresh',
      'targetNickname', nearest_hider_nickname,
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
         public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng),
         public.pe_bearing_degrees(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
  into nearest_hider_id,
       nearest_hider_nickname,
       nearest_hider_updated_at,
       nearest_distance_meters,
       nearest_bearing_degrees
  from public.pe_players players
  join public.pe_player_locations locations on locations.player_id = players.id
  where players.room_id = target_room_id
    and players.id <> active_session.seeker_player_id
    and players.status <> 'Capturado'
    and locations.updated_at >= now() - interval '30 seconds'
  order by public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
  limit 1;

  if nearest_hider_id is null then
    return jsonb_build_object(
      'band', 'none',
      'confidence', 0,
      'reason', 'no_target_signal',
      'signalStatus', 'lost'
    );
  end if;

  signal_status := public.pe_location_signal_status(nearest_hider_updated_at);
  band := case when signal_status = 'fresh' then public.pe_radar_band(nearest_distance_meters, area_preset) else 'none' end;
  angle_noise := sin(now_epoch * 1.35 + length(nearest_hider_id::text)) * noise_ratio * 70;
  bearing := nearest_bearing_degrees + angle_noise + 360;
  bearing := bearing - floor(bearing / 360) * 360;

  select greatest(0, ceil(3 - extract(epoch from (now() - started_at))))::integer
  into confirm_remaining_seconds
  from public.pe_capture_confirmations
  where seeker_player_id = actor.id
    and target_player_id = nearest_hider_id
    and room_id = target_room_id
    and game_session_id = active_session.id
    and last_seen_at >= now() - interval '5 seconds';

  return jsonb_build_object(
    'angleDegrees', bearing,
    'band', band,
    'canCapture', nearest_distance_meters <= 5 and signal_status = 'fresh',
    'confidence', confidence,
    'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, 3),
    'distanceMetersApprox', round(nearest_distance_meters::numeric),
    'signalStatus', signal_status,
    'targetNickname', nearest_hider_nickname,
    'targetPlayerId', nearest_hider_id,
    'updatedAt', now()
  );
end;
$$;

grant execute on function public.pe_dev_add_target_player(uuid, uuid, text) to anon;
grant execute on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision, double precision, text) to anon;
grant execute on function public.pe_get_radar_hint(uuid, uuid, text, text) to anon;

notify pgrst, 'reload schema';
