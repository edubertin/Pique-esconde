create extension if not exists pgcrypto;

create table if not exists public.pe_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  phase text not null default 'lobby' check (phase in ('lobby', 'hiding', 'seeking', 'finished')),
  max_players integer not null default 8 check (max_players between 2 and 8),
  result jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pe_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.pe_rooms(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  avatar_id text not null,
  status text not null default 'Entrou' check (status in ('Entrou', 'Preparado', 'Aguardando')),
  is_leader boolean not null default false,
  session_token_hash text not null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists pe_players_room_id_joined_at_idx on public.pe_players(room_id, joined_at);
create unique index if not exists pe_rooms_code_upper_idx on public.pe_rooms(upper(code));
create unique index if not exists pe_players_one_leader_per_room_idx on public.pe_players(room_id) where is_leader;

alter table public.pe_rooms enable row level security;
alter table public.pe_players enable row level security;

drop policy if exists "pe rooms are readable for temporary room access" on public.pe_rooms;
create policy "pe rooms are readable for temporary room access"
on public.pe_rooms for select
to anon
using (true);

drop policy if exists "pe players are readable for temporary room access" on public.pe_players;
create policy "pe players are readable for temporary room access"
on public.pe_players for select
to anon
using (true);

create or replace function public.pe_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pe_rooms_touch_updated_at on public.pe_rooms;
create trigger pe_rooms_touch_updated_at
before update on public.pe_rooms
for each row execute function public.pe_touch_updated_at();

create or replace function public.pe_random_room_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  code text := '';
  index integer;
begin
  for index in 1..4 loop
    code := code || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
  end loop;

  return code;
end;
$$;

create or replace function public.pe_solo_expires_at(player_count integer)
returns timestamptz
language sql
as $$
  select case when player_count = 1 then now() + interval '6 minutes' else null end;
$$;

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
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  update public.pe_players
  set status = case when status = 'Preparado' then 'Entrou' else 'Preparado' end
  where id = actor.id;
end;
$$;

create or replace function public.pe_promote_leader(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  next_leader_player_id uuid
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

  if not actor.is_leader then
    raise exception 'Only the leader can promote another player';
  end if;

  if not exists (select 1 from public.pe_players where id = next_leader_player_id and room_id = target_room_id) then
    raise exception 'Player is not in this room';
  end if;

  update public.pe_players
  set is_leader = false
  where room_id = target_room_id;

  update public.pe_players
  set is_leader = true
  where id = next_leader_player_id
    and room_id = target_room_id;
end;
$$;

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
  remaining_count integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can remove players';
  end if;

  if actor.id = removed_player_id then
    raise exception 'Leader cannot remove themselves';
  end if;

  delete from public.pe_players
  where id = removed_player_id
    and room_id = target_room_id;

  select count(*) into remaining_count from public.pe_players where room_id = target_room_id;

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(remaining_count)
  where id = target_room_id;
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
  next_leader_id uuid;
  remaining_count integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

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

  update public.pe_rooms
  set expires_at = public.pe_solo_expires_at(remaining_count)
  where id = target_room_id;
end;
$$;

create or replace function public.pe_start_round(
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
  set phase = 'hiding', result = null
  where id = target_room_id;
end;
$$;

create or replace function public.pe_finish_round(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  round_winner text default 'hiders'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  captured_ids uuid[];
  highlight_id uuid;
  seeker_id uuid;
  survivor_ids uuid[];
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  select id into seeker_id from public.pe_players where room_id = target_room_id and is_leader limit 1;

  if round_winner = 'seeker' then
    select coalesce(array_agg(id), '{}') into captured_ids from public.pe_players where room_id = target_room_id and id <> seeker_id;
    survivor_ids := '{}';
    highlight_id := seeker_id;
  else
    select id into highlight_id from public.pe_players where room_id = target_room_id and id <> seeker_id order by joined_at limit 1;
    highlight_id := coalesce(highlight_id, seeker_id);
    select coalesce(array_agg(id), '{}') into survivor_ids from (
      select id from public.pe_players where room_id = target_room_id and id <> seeker_id order by joined_at limit 2
    ) survivors;
    select coalesce(array_agg(id), '{}') into captured_ids from public.pe_players where room_id = target_room_id and id <> all(survivor_ids) and id <> seeker_id;
  end if;

  update public.pe_rooms
  set phase = 'finished',
      result = jsonb_build_object(
        'capturedPlayerIds', captured_ids,
        'durationLabel', '3min',
        'highlightPlayerId', highlight_id,
        'survivorPlayerIds', survivor_ids,
        'winner', case when round_winner = 'seeker' then 'seeker' else 'hiders' end
      )
  where id = target_room_id;
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
  set phase = 'lobby', result = null
  where id = target_room_id;

  update public.pe_players
  set status = case when is_leader then 'Entrou' else 'Aguardando' end
  where room_id = target_room_id;
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

grant usage on schema public to anon;
grant select on public.pe_rooms to anon;
revoke all on public.pe_players from anon;
grant select (id, room_id, nickname, avatar_id, status, is_leader, joined_at, last_seen_at) on public.pe_players to anon;
grant execute on function public.pe_create_room(text, text, integer) to anon;
grant execute on function public.pe_join_room(text, text, text) to anon;
grant execute on function public.pe_toggle_ready(uuid, uuid, text) to anon;
grant execute on function public.pe_promote_leader(uuid, uuid, text, uuid) to anon;
grant execute on function public.pe_remove_player(uuid, uuid, text, uuid) to anon;
grant execute on function public.pe_leave_room(uuid, uuid, text) to anon;
grant execute on function public.pe_start_round(uuid, uuid, text) to anon;
grant execute on function public.pe_finish_round(uuid, uuid, text, text) to anon;
grant execute on function public.pe_rematch(uuid, uuid, text) to anon;
grant execute on function public.pe_add_demo_player(uuid, uuid, text, integer) to anon;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pe_rooms'
  ) then
    alter publication supabase_realtime add table public.pe_rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pe_players'
  ) then
    alter publication supabase_realtime add table public.pe_players;
  end if;
end;
$$;
