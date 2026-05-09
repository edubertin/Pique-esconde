alter table public.pe_rooms
  add column if not exists closed_reason text;

alter table public.pe_rooms drop constraint if exists pe_rooms_closed_reason_check;
alter table public.pe_rooms
  add constraint pe_rooms_closed_reason_check
  check (closed_reason is null or closed_reason in ('seeker_left', 'not_enough_players'));

create or replace function public.pe_create_room(
  nickname text,
  avatar_id text,
  max_players integer default 8
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_nickname text := left(coalesce(nullif(trim(nickname), ''), 'Jogador'), 24);
  new_code text;
  new_player_id uuid;
  new_room_id uuid;
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
begin
  loop
    new_code := public.pe_random_room_code();
    exit when not exists (select 1 from public.pe_rooms where code = new_code);
  end loop;

  insert into public.pe_rooms (code, max_players, expires_at, closed_reason)
  values (new_code, least(greatest(max_players, 2), 8), now() + interval '6 minutes', null)
  returning id into new_room_id;

  insert into public.pe_players (room_id, nickname, avatar_id, status, is_leader, session_token_hash)
  values (new_room_id, clean_nickname, avatar_id, 'Entrou', true, extensions.crypt(session_token, extensions.gen_salt('bf')))
  returning id into new_player_id;

  return jsonb_build_object(
    'roomId', new_room_id,
    'activePlayerId', new_player_id,
    'playerSessionToken', session_token
  );
end;
$$;

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

  update public.pe_rooms
  set phase = 'lobby', result = null, closed_reason = null
  where id = target_room_id;

  update public.pe_players
  set status = case when is_leader then 'Entrou' else 'Aguardando' end
  where room_id = target_room_id;
end;
$$;

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
