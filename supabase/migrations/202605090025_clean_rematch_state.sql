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
  set status = case when is_leader then 'Entrou' else 'Aguardando' end
  where room_id = target_room_id;
end;
$$;

grant execute on function public.pe_rematch(uuid, uuid, text) to anon;

notify pgrst, 'reload schema';
