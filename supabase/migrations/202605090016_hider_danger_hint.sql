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

grant execute on function public.pe_get_hider_danger_hint(uuid, uuid, text) to anon;
