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
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can start a round';
  end if;

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
    raise exception 'Players not ready: %', array_to_string(not_ready_names, ', ');
  end if;

  update public.pe_rooms
  set phase = 'hiding', result = null, closed_reason = null
  where id = target_room_id;

  update public.pe_players
  set status = case when id = actor.id then 'Procurando' else 'Escondendo' end
  where room_id = target_room_id;

  insert into public.pe_game_sessions (room_id, seeker_player_id, status, hide_duration_seconds, seek_duration_seconds)
  values (target_room_id, actor.id, 'hiding', 60, 180)
  returning id into current_session_id;

  return jsonb_build_object('gameSessionId', current_session_id);
end;
$$;
