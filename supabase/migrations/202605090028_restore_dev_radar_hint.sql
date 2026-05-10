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

    band := public.pe_radar_band(dev_control.distance_meters, area_preset);
    bearing := coalesce(dev_control.bearing_degrees, 0) + 360;
    bearing := bearing - floor(bearing / 360) * 360;

    select greatest(0, ceil(2 - extract(epoch from (now() - started_at))))::integer
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
      'confirmRemainingSeconds', coalesce(confirm_remaining_seconds, 2),
      'devOverride', true,
      'distanceMetersApprox', round(dev_control.distance_meters::numeric),
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
  band := case when signal_status = 'fresh' then public.pe_radar_band(nearest_hider.distance_meters, area_preset) else 'none' end;

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

grant execute on function public.pe_get_radar_hint(uuid, uuid, text, text) to anon;

notify pgrst, 'reload schema';
