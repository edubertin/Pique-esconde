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
  distance_meters double precision;
  hider_location public.pe_player_locations;
  hider_signal text;
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

  -- Check hider's own signal first — if degraded, warn before the 30s elimination.
  select *
  into hider_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id
  order by updated_at desc
  limit 1;

  hider_signal := public.pe_location_signal_status(hider_location.updated_at);

  if hider_signal = 'lost' then
    return jsonb_build_object('level', 'calm', 'signalStatus', 'lost');
  end if;

  if hider_signal = 'warning' then
    return jsonb_build_object('level', 'calm', 'signalStatus', 'warning', 'updatedAt', now());
  end if;

  -- Hider signal is fresh — check seeker signal to compute distance.
  select *
  into seeker_location
  from public.pe_player_locations
  where player_id = active_session.seeker_player_id
    and room_id = target_room_id
    and updated_at >= now() - interval '30 seconds';

  if seeker_location.player_id is null then
    -- Seeker signal lost — distance unknown but hider is still safe.
    return jsonb_build_object('level', 'calm', 'signalStatus', 'warning', 'updatedAt', now());
  end if;

  distance_meters := public.pe_distance_meters(
    hider_location.lat, hider_location.lng,
    seeker_location.lat, seeker_location.lng
  );

  return jsonb_build_object(
    'distanceMetersApprox', round(distance_meters::numeric),
    'level', case
      when distance_meters <= 8 then 'danger'
      when distance_meters <= 20 then 'near'
      else 'calm'
    end,
    'signalStatus', 'fresh',
    'updatedAt', now()
  );
end;
$$;

-- Grant preserved from original migration; re-stated for clarity on re-apply.
grant execute on function public.pe_get_hider_danger_hint(uuid, uuid, text) to anon;

notify pgrst, 'reload schema';
