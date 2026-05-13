create extension if not exists unaccent with schema extensions;

create or replace function public.pe_clean_nickname(raw_nickname text)
returns text
language sql
immutable
as $$
  select left(
    coalesce(
      nullif(regexp_replace(trim(coalesce(raw_nickname, '')), '[[:space:]]+', ' ', 'g'), ''),
      'Jogador'
    ),
    24
  );
$$;

create or replace function public.pe_nickname_key(display_nickname text)
returns text
language sql
immutable
as $$
  select lower(extensions.unaccent(public.pe_clean_nickname(display_nickname)));
$$;

alter table public.pe_players
  add column if not exists nickname_key text;

with ranked_players as (
  select
    id,
    public.pe_nickname_key(nickname) as base_key,
    row_number() over (
      partition by room_id, public.pe_nickname_key(nickname)
      order by joined_at, id
    ) as duplicate_index
  from public.pe_players
)
update public.pe_players players
set nickname_key = case
  when ranked_players.duplicate_index = 1 then ranked_players.base_key
  else ranked_players.base_key || '-' || ranked_players.duplicate_index::text
end
from ranked_players
where players.id = ranked_players.id;

alter table public.pe_players
  alter column nickname_key set not null;

drop index if exists public.pe_players_room_nickname_key_uidx;

create unique index pe_players_room_nickname_key_uidx
  on public.pe_players (room_id, nickname_key);

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
  clean_nickname text := public.pe_clean_nickname(nickname);
  new_code text;
  new_player_id uuid;
  new_room_id uuid;
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
begin
  perform public.pe_cleanup_expired_state();

  loop
    new_code := public.pe_random_room_code();
    exit when not exists (select 1 from public.pe_rooms where code = new_code);
  end loop;

  insert into public.pe_rooms (code, max_players, expires_at, closed_reason)
  values (new_code, least(greatest(max_players, 2), 8), now() + interval '6 minutes', null)
  returning id into new_room_id;

  insert into public.pe_players (room_id, nickname, nickname_key, avatar_id, status, is_leader, session_token_hash)
  values (
    new_room_id,
    clean_nickname,
    public.pe_nickname_key(clean_nickname),
    avatar_id,
    'Entrou',
    true,
    extensions.crypt(session_token, extensions.gen_salt('bf'))
  )
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
  clean_nickname text := public.pe_clean_nickname(nickname);
  current_count integer;
  new_player_id uuid;
  next_nickname_key text := public.pe_nickname_key(nickname);
  session_token text := encode(extensions.gen_random_bytes(24), 'base64');
  target_room public.pe_rooms;
begin
  perform public.pe_cleanup_expired_state();

  select *
  into target_room
  from public.pe_rooms
  where code = upper(trim(room_code))
    and phase = 'lobby'
    and (expires_at is null or expires_at > now());

  if target_room.id is null then
    raise exception 'Room not found';
  end if;

  select count(*) into current_count from public.pe_players where room_id = target_room.id;

  if current_count >= target_room.max_players then
    raise exception 'Room is full';
  end if;

  if exists (
    select 1
    from public.pe_players players
    where players.room_id = target_room.id
      and players.nickname_key = next_nickname_key
  ) then
    raise exception 'Nickname already in use';
  end if;

  begin
    insert into public.pe_players (room_id, nickname, nickname_key, avatar_id, status, is_leader, session_token_hash)
    values (
      target_room.id,
      clean_nickname,
      next_nickname_key,
      avatar_id,
      'Entrou',
      false,
      extensions.crypt(session_token, extensions.gen_salt('bf'))
    )
    returning id into new_player_id;
  exception
    when unique_violation then
      raise exception 'Nickname already in use';
  end;

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
  demo_names text[] := array['Ana','Rafa','Bia','Lu','Thi','Nina','Caio'];
  demo_avatars text[] := array['avatar_02','avatar_03','avatar_04','avatar_01','avatar_03','avatar_02','avatar_04'];
  name_index integer;
  next_nickname_key text;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  select count(*) into current_count from public.pe_players where room_id = target_room_id;

  if current_count >= least(greatest(max_players, 2), 8) then
    return;
  end if;

  for name_index in 1..array_length(demo_names, 1) loop
    next_nickname_key := public.pe_nickname_key(demo_names[name_index]);

    if not exists (
      select 1
      from public.pe_players players
      where players.room_id = target_room_id
        and players.nickname_key = next_nickname_key
    ) then
      demo_avatar := demo_avatars[name_index];

      insert into public.pe_players (room_id, nickname, nickname_key, avatar_id, status, is_leader, session_token_hash)
      values (
        target_room_id,
        demo_names[name_index],
        next_nickname_key,
        demo_avatar,
        case when current_count % 2 = 0 then 'Preparado' else 'Aguardando' end,
        false,
        extensions.crypt(encode(extensions.gen_random_bytes(24), 'base64'), extensions.gen_salt('bf'))
      );

      update public.pe_rooms
      set expires_at = public.pe_solo_expires_at(current_count + 1)
      where id = target_room_id;

      return;
    end if;
  end loop;
end;
$$;

create or replace function public.pe_dev_add_target_player(
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
  current_count integer;
  target_player public.pe_players;
  target_player_key text := public.pe_nickname_key('Alvo DEV');
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can create a DEV target';
  end if;

  select *
  into target_player
  from public.pe_players
  where room_id = target_room_id
    and nickname_key = target_player_key
  order by joined_at
  limit 1;

  if target_player.id is not null then
    update public.pe_players
    set status = 'Preparado',
        is_leader = false,
        last_seen_at = now()
    where id = target_player.id
    returning * into target_player;

    return jsonb_build_object(
      'created', false,
      'playerId', target_player.id,
      'nickname', target_player.nickname
    );
  end if;

  select count(*) into current_count
  from public.pe_players
  where room_id = target_room_id;

  if current_count >= 8 then
    raise exception 'Room is full';
  end if;

  insert into public.pe_players (
    room_id,
    nickname,
    nickname_key,
    avatar_id,
    status,
    is_leader,
    session_token_hash
  )
  values (
    target_room_id,
    'Alvo DEV',
    target_player_key,
    'avatar_04',
    'Preparado',
    false,
    extensions.crypt(encode(extensions.gen_random_bytes(24), 'base64'), extensions.gen_salt('bf'))
  )
  returning * into target_player;

  return jsonb_build_object(
    'created', true,
    'playerId', target_player.id,
    'nickname', target_player.nickname
  );
end;
$$;

grant execute on function public.pe_clean_nickname(text) to anon;
grant execute on function public.pe_nickname_key(text) to anon;
grant execute on function public.pe_create_room(text, text, integer) to anon;
grant execute on function public.pe_join_room(text, text, text) to anon;

notify pgrst, 'reload schema';
