create or replace function public.pe_assert_player_token(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text
)
returns public.pe_players
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
begin
  select *
  into actor
  from public.pe_players
  where id = actor_player_id
    and room_id = target_room_id
    and session_token_hash = extensions.crypt(player_session_token, session_token_hash);

  if actor.id is null then
    raise exception 'Invalid room session';
  end if;

  update public.pe_players
  set last_seen_at = now()
  where id = actor.id
    and last_seen_at < now() - interval '20 seconds';

  return actor;
end;
$$;

notify pgrst, 'reload schema';
