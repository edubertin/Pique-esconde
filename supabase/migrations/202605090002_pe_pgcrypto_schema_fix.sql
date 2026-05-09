create extension if not exists pgcrypto with schema extensions;

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
  where id = actor.id;

  return actor;
end;
$$;

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

  insert into public.pe_rooms (code, max_players, expires_at)
  values (new_code, least(greatest(max_players, 2), 8), now() + interval '6 minutes')
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

create or replace function public.pe_join_room(
  room_code text,
  nickname text,
  avatar_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_nickname text := left(coalesce(nullif(trim(nickname), ''), 'Jogador'), 24);
  current_count integer;
  new_player_id uuid;
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
  target_room public.pe_rooms;
begin
  select *
  into target_room
  from public.pe_rooms
  where code = upper(trim(room_code))
    and phase = 'lobby';

  if target_room.id is null then
    raise exception 'Room not found';
  end if;

  select count(*) into current_count from public.pe_players where room_id = target_room.id;

  if current_count >= target_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.pe_players (room_id, nickname, avatar_id, status, is_leader, session_token_hash)
  values (target_room.id, clean_nickname, avatar_id, 'Entrou', false, extensions.crypt(session_token, extensions.gen_salt('bf')))
  returning id into new_player_id;

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(current_count + 1)
  where id = target_room.id;

  return jsonb_build_object(
    'roomId', target_room.id,
    'activePlayerId', new_player_id,
    'playerSessionToken', session_token
  );
end;
$$;

create or replace function public.pe_add_demo_player(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  max_players integer default 8
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  current_count integer;
  demo_avatar text;
  demo_name text;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  select count(*) into current_count from public.pe_players where room_id = target_room_id;

  if current_count >= least(greatest(max_players, 2), 8) then
    return;
  end if;

  demo_name := (array['Ana','Rafa','Bia','Lu','Thi','Nina','Caio'])[current_count];
  demo_avatar := (array['avatar_02','avatar_03','avatar_04','avatar_01','avatar_03','avatar_02','avatar_04'])[current_count];

  if demo_name is null then
    return;
  end if;

  insert into public.pe_players (room_id, nickname, avatar_id, status, is_leader, session_token_hash)
  values (target_room_id, demo_name, demo_avatar, case when current_count % 2 = 0 then 'Preparado' else 'Aguardando' end, false, extensions.crypt(encode(extensions.gen_random_bytes(24), 'base64'), extensions.gen_salt('bf')));

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(current_count + 1)
  where id = target_room_id;
end;
$$;
