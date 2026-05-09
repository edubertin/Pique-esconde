create or replace function public.pe_rematch(
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
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  delete from public.pe_capture_confirmations
  where room_id = target_room_id;

  delete from public.pe_dev_test_distances
  where room_id = target_room_id;

  delete from public.pe_player_hide_spots
  where room_id = target_room_id;

  delete from public.pe_player_locations
  where room_id = target_room_id;

  update public.pe_rooms
  set phase = 'lobby',
      result = null,
      closed_reason = null,
      lobby_notice = null
  where id = target_room_id;

  update public.pe_players
  set status = case
    when is_leader then 'Entrou'
    when nickname = 'Alvo DEV' then 'Preparado'
    else 'Aguardando'
  end
  where room_id = target_room_id;
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
  capture_confirm_seconds double precision := 3;
  capture_started_at timestamptz;
  dev_control public.pe_dev_test_distances;
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
    perform public.pe_finish_round(target_room_id, actor.id, player_session_token, 'seeker');
  end if;

  return jsonb_build_object(
    'captured', true,
    'capturedPlayerId', target_hider_player_id,
    'capturedNickname', target_nickname,
    'remainingHiders', remaining_hiders,
    'distanceMeters', target_distance_meters
  );
end;
$$;

grant execute on function public.pe_rematch(uuid, uuid, text) to anon;
grant execute on function public.pe_try_capture_nearest(uuid, uuid, text) to anon;

notify pgrst, 'reload schema';
