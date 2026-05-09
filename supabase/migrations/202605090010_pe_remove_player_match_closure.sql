create or replace function public.pe_remove_player(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  removed_player_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  remaining_count integer;
  room_phase text;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can remove players';
  end if;

  if actor.id = removed_player_id then
    raise exception 'Leader cannot remove themselves';
  end if;

  select phase into room_phase from public.pe_rooms where id = target_room_id;
  active_session := public.pe_current_game_session(target_room_id);

  delete from public.pe_players
  where id = removed_player_id
    and room_id = target_room_id;

  select count(*) into remaining_count from public.pe_players where room_id = target_room_id;

  if room_phase in ('hiding', 'seeking') and active_session.id is not null and remaining_count < 2 then
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

    return;
  end if;

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(remaining_count)
  where id = target_room_id;
end;
$$;

grant execute on function public.pe_remove_player(uuid, uuid, text, uuid) to anon;
