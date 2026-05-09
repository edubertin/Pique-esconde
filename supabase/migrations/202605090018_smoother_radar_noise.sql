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

grant execute on function public.pe_get_radar_hint(uuid, uuid, text, text) to anon;
