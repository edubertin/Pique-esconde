create or replace function public.pe_dev_set_test_distance(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  distance_meters double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  base_lat double precision := -23.55052;
  base_lng double precision := -46.633308;
  hider public.pe_players;
  meters_per_degree_latitude double precision := 111320;
  seeker_lat double precision;
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
  order by joined_at
  limit 1;

  if hider.id is null then
    return jsonb_build_object('changed', false, 'reason', 'no_active_hider');
  end if;

  seeker_lat := base_lat + least(greatest(distance_meters, 0), 60) / meters_per_degree_latitude;

  insert into public.pe_player_locations (
    player_id,
    room_id,
    game_session_id,
    lat,
    lng,
    accuracy_m,
    heading_degrees,
    speed_mps,
    updated_at
  )
  values
    (hider.id, target_room_id, active_session.id, base_lat, base_lng, 1, 0, 0, now()),
    (actor.id, target_room_id, active_session.id, seeker_lat, base_lng, 1, 0, 0, now())
  on conflict (player_id) do update
    set room_id = excluded.room_id,
        game_session_id = excluded.game_session_id,
        lat = excluded.lat,
        lng = excluded.lng,
        accuracy_m = excluded.accuracy_m,
        heading_degrees = excluded.heading_degrees,
        speed_mps = excluded.speed_mps,
        updated_at = now();

  insert into public.pe_player_hide_spots (
    player_id,
    room_id,
    game_session_id,
    lat,
    lng,
    accuracy_m,
    locked_at,
    violation_started_at,
    last_violation_at
  )
  values (
    hider.id,
    target_room_id,
    active_session.id,
    base_lat,
    base_lng,
    1,
    now(),
    null,
    null
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

  return jsonb_build_object(
    'changed', true,
    'distanceMeters', least(greatest(distance_meters, 0), 60),
    'hiderPlayerId', hider.id,
    'seekerPlayerId', actor.id
  );
end;
$$;

grant execute on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision) to anon;
