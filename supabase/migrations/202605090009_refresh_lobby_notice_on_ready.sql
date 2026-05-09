create or replace function public.pe_toggle_ready(
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
  current_notice jsonb;
  not_ready_names text[];
  room_phase text;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  update public.pe_players
  set status = case when status = 'Preparado' then 'Entrou' else 'Preparado' end
  where id = actor.id;

  select phase, lobby_notice
  into room_phase, current_notice
  from public.pe_rooms
  where id = target_room_id;

  if room_phase = 'lobby' and current_notice->>'type' = 'players_not_ready' then
    select coalesce(array_agg(nickname order by joined_at), '{}')
    into not_ready_names
    from public.pe_players
    where room_id = target_room_id
      and not is_leader
      and status <> 'Preparado';

    update public.pe_rooms
    set lobby_notice = case
      when array_length(not_ready_names, 1) > 0 then jsonb_build_object(
        'type', 'players_not_ready',
        'names', not_ready_names,
        'createdAt', now()
      )
      else null
    end
    where id = target_room_id;
  end if;
end;
$$;

grant execute on function public.pe_toggle_ready(uuid, uuid, text) to anon;
