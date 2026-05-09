create or replace function public.pe_leave_room(
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
  active_session public.pe_game_sessions;
  next_leader_id uuid;
  remaining_count integer;
  room_phase text;
  should_interrupt_match boolean := false;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  select phase into room_phase from public.pe_rooms where id = target_room_id;
  active_session := public.pe_current_game_session(target_room_id);

  delete from public.pe_players
  where id = actor.id
    and room_id = target_room_id;

  select count(*) into remaining_count from public.pe_players where room_id = target_room_id;

  if remaining_count = 0 then
    delete from public.pe_rooms where id = target_room_id;
    return;
  end if;

  if actor.is_leader then
    select id
    into next_leader_id
    from public.pe_players
    where room_id = target_room_id
    order by joined_at
    limit 1;

    update public.pe_players
    set is_leader = (id = next_leader_id)
    where room_id = target_room_id;
  end if;

  if room_phase in ('hiding', 'seeking') and active_session.id is not null then
    should_interrupt_match := remaining_count < 2 or actor.id = active_session.seeker_player_id;

    if should_interrupt_match then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = now(),
          winner = case
            when actor.id = active_session.seeker_player_id then 'hiders'
            when remaining_count < 2 then 'seeker'
            else winner
          end
      where id = active_session.id;

      update public.pe_players
      set status = case when is_leader then 'Entrou' else 'Aguardando' end
      where room_id = target_room_id;

      update public.pe_rooms
      set phase = 'lobby',
          result = null,
          closed_reason = case
            when remaining_count < 2 then 'not_enough_players'
            when actor.id = active_session.seeker_player_id then 'seeker_left'
            else null
          end,
          expires_at = public.pe_solo_expires_at(remaining_count)
      where id = target_room_id;

      return;
    end if;
  end if;

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(remaining_count)
  where id = target_room_id;
end;
$$;
