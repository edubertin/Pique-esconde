create table if not exists public.pe_game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.pe_rooms(id) on delete cascade,
  seeker_player_id uuid not null references public.pe_players(id) on delete cascade,
  status text not null default 'hiding' check (status in ('hiding', 'seeking', 'finished')),
  hide_duration_seconds integer not null default 60,
  seek_duration_seconds integer not null default 180,
  started_at timestamptz not null default now(),
  seek_started_at timestamptz,
  finished_at timestamptz,
  winner text check (winner in ('seeker', 'hiders')),
  highlight_player_id uuid references public.pe_players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pe_game_sessions_room_id_created_at_idx on public.pe_game_sessions(room_id, created_at desc);
create index if not exists pe_game_sessions_room_id_status_idx on public.pe_game_sessions(room_id, status);

alter table public.pe_game_sessions enable row level security;

drop policy if exists "pe game sessions are readable for temporary room access" on public.pe_game_sessions;
create policy "pe game sessions are readable for temporary room access"
on public.pe_game_sessions for select
to anon
using (true);

drop trigger if exists pe_game_sessions_touch_updated_at on public.pe_game_sessions;
create trigger pe_game_sessions_touch_updated_at
before update on public.pe_game_sessions
for each row execute function public.pe_touch_updated_at();

alter table public.pe_players drop constraint if exists pe_players_status_check;
alter table public.pe_players
  add constraint pe_players_status_check
  check (status in ('Entrou', 'Preparado', 'Aguardando', 'Escondendo', 'Escondido', 'Procurando', 'Capturado'));

alter table public.pe_rooms drop constraint if exists pe_rooms_phase_check;
alter table public.pe_rooms
  add constraint pe_rooms_phase_check
  check (phase in ('lobby', 'hiding', 'seeking', 'finished'));

create or replace function public.pe_current_game_session(target_room_id uuid)
returns public.pe_game_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_session public.pe_game_sessions;
begin
  select *
  into current_session
  from public.pe_game_sessions
  where room_id = target_room_id
  order by created_at desc
  limit 1;

  return current_session;
end;
$$;

create or replace function public.pe_build_round_result(
  target_room_id uuid,
  target_game_session_id uuid,
  round_winner text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  captured_ids uuid[];
  highlight_id uuid;
  seeker_id uuid;
  survivor_ids uuid[];
begin
  select seeker_player_id
  into seeker_id
  from public.pe_game_sessions
  where id = target_game_session_id
    and room_id = target_room_id;

  if round_winner = 'seeker' then
    select coalesce(array_agg(id order by joined_at), '{}')
    into captured_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id;

    survivor_ids := '{}';
    highlight_id := seeker_id;
  else
    select id
    into highlight_id
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status <> 'Capturado'
    order by joined_at
    limit 1;

    highlight_id := coalesce(highlight_id, seeker_id);

    select coalesce(array_agg(id order by joined_at), '{}')
    into survivor_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status <> 'Capturado';

    select coalesce(array_agg(id order by joined_at), '{}')
    into captured_ids
    from public.pe_players
    where room_id = target_room_id
      and id <> seeker_id
      and status = 'Capturado';
  end if;

  return jsonb_build_object(
    'capturedPlayerIds', captured_ids,
    'durationLabel', '3min',
    'highlightPlayerId', highlight_id,
    'survivorPlayerIds', survivor_ids,
    'winner', case when round_winner = 'seeker' then 'seeker' else 'hiders' end
  );
end;
$$;

drop function if exists public.pe_start_round(uuid, uuid, text);

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
  set phase = 'hiding', result = null
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

create or replace function public.pe_mark_hidden(
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
  remaining_hiders integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'hiding' then
    raise exception 'No hiding phase is active';
  end if;

  if actor.id = active_session.seeker_player_id then
    raise exception 'Seeker cannot mark hidden';
  end if;

  update public.pe_players
  set status = 'Escondido'
  where id = actor.id
    and room_id = target_room_id;

  select count(*)
  into remaining_hiders
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Escondido';

  if remaining_hiders = 0 then
    perform public.pe_release_seeker(target_room_id, actor.id, player_session_token, true);
  end if;
end;
$$;

create or replace function public.pe_release_seeker(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  allow_hider_release boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'hiding' then
    raise exception 'No hiding phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id and not allow_hider_release then
    raise exception 'Only the seeker can release the search';
  end if;

  update public.pe_game_sessions
  set status = 'seeking',
      seek_started_at = coalesce(seek_started_at, now())
  where id = active_session.id;

  update public.pe_rooms
  set phase = 'seeking'
  where id = target_room_id;

  update public.pe_players
  set status = case
    when id = active_session.seeker_player_id then 'Procurando'
    when status <> 'Capturado' then 'Escondido'
    else status
  end
  where room_id = target_room_id;
end;
$$;

create or replace function public.pe_simulate_capture(
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
  active_session public.pe_game_sessions;
  captured_player_id uuid;
  remaining_hiders integer;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    raise exception 'No seeking phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can capture';
  end if;

  select id
  into captured_player_id
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado'
  order by joined_at
  limit 1;

  if captured_player_id is null then
    raise exception 'No hider left to capture';
  end if;

  update public.pe_players
  set status = 'Capturado'
  where id = captured_player_id;

  select count(*)
  into remaining_hiders
  from public.pe_players
  where room_id = target_room_id
    and id <> active_session.seeker_player_id
    and status <> 'Capturado';

  if remaining_hiders = 0 then
    perform public.pe_finish_round(target_room_id, actor.id, player_session_token, 'seeker');
  end if;

  return jsonb_build_object(
    'capturedPlayerId', captured_player_id,
    'remainingHiders', remaining_hiders
  );
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
  active_session public.pe_game_sessions;
  result_payload jsonb;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null then
    raise exception 'No round found';
  end if;

  if actor.id <> active_session.seeker_player_id and not actor.is_leader then
    raise exception 'Only the seeker or leader can finish a round';
  end if;

  result_payload := public.pe_build_round_result(target_room_id, active_session.id, round_winner);

  update public.pe_game_sessions
  set status = 'finished',
      finished_at = now(),
      winner = case when round_winner = 'seeker' then 'seeker' else 'hiders' end,
      highlight_player_id = (result_payload->>'highlightPlayerId')::uuid
  where id = active_session.id;

  update public.pe_rooms
  set phase = 'finished',
      result = result_payload
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

grant select on public.pe_game_sessions to anon;
grant execute on function public.pe_current_game_session(uuid) to anon;
grant execute on function public.pe_build_round_result(uuid, uuid, text) to anon;
grant execute on function public.pe_start_round(uuid, uuid, text) to anon;
grant execute on function public.pe_mark_hidden(uuid, uuid, text) to anon;
grant execute on function public.pe_release_seeker(uuid, uuid, text, boolean) to anon;
grant execute on function public.pe_simulate_capture(uuid, uuid, text) to anon;
grant execute on function public.pe_finish_round(uuid, uuid, text, text) to anon;
grant execute on function public.pe_rematch(uuid, uuid, text) to anon;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pe_game_sessions'
  ) then
    alter publication supabase_realtime add table public.pe_game_sessions;
  end if;
end;
$$;
