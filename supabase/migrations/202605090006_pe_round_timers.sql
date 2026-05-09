create table if not exists public.pe_player_exit_notices (
  player_id uuid primary key,
  room_id uuid not null,
  reason text not null check (reason in ('not_hidden_in_time')),
  created_at timestamptz not null default now()
);

alter table public.pe_player_exit_notices enable row level security;

drop policy if exists "pe player exit notices are readable for temporary room access" on public.pe_player_exit_notices;
create policy "pe player exit notices are readable for temporary room access"
on public.pe_player_exit_notices for select
to anon
using (true);

create or replace function public.pe_release_seeker_internal(
  target_room_id uuid,
  target_game_session_id uuid,
  target_seeker_player_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pe_game_sessions
  set status = 'seeking',
      seek_started_at = coalesce(seek_started_at, now())
  where id = target_game_session_id;

  update public.pe_rooms
  set phase = 'seeking'
  where id = target_room_id;

  update public.pe_players
  set status = case
    when id = target_seeker_player_id then 'Procurando'
    when status <> 'Capturado' then 'Escondido'
    else status
  end
  where room_id = target_room_id;
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

  perform public.pe_release_seeker_internal(target_room_id, active_session.id, active_session.seeker_player_id);
end;
$$;

create or replace function public.pe_tick_game_session(
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
  hider_count integer;
  remaining_count integer;
  removed_count integer := 0;
  result_payload jsonb;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status = 'finished' then
    return jsonb_build_object('changed', false, 'reason', 'no_active_round');
  end if;

  if active_session.status = 'hiding' then
    if now() < active_session.started_at + make_interval(secs => active_session.hide_duration_seconds) then
      return jsonb_build_object('changed', false, 'reason', 'hide_timer_running');
    end if;

    insert into public.pe_player_exit_notices (player_id, room_id, reason)
    select id, room_id, 'not_hidden_in_time'
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id
      and status = 'Escondendo'
    on conflict (player_id) do update
      set reason = excluded.reason,
          created_at = now();

    delete from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id
      and status = 'Escondendo';

    get diagnostics removed_count = row_count;

    select count(*) into remaining_count from public.pe_players where room_id = target_room_id;

    if remaining_count = 0 then
      delete from public.pe_rooms where id = target_room_id;
      return jsonb_build_object('changed', true, 'reason', 'room_empty', 'removedPlayers', removed_count);
    end if;

    if remaining_count < 2 then
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

      return jsonb_build_object('changed', true, 'reason', 'not_enough_players', 'removedPlayers', removed_count);
    end if;

    select count(*)
    into hider_count
    from public.pe_players
    where room_id = target_room_id
      and id <> active_session.seeker_player_id;

    if hider_count = 0 then
      update public.pe_game_sessions
      set status = 'finished',
          finished_at = now(),
          winner = 'seeker'
      where id = active_session.id;

      update public.pe_rooms
      set phase = 'lobby',
          result = null,
          closed_reason = 'not_enough_players',
          expires_at = public.pe_solo_expires_at(remaining_count)
      where id = target_room_id;

      return jsonb_build_object('changed', true, 'reason', 'no_hiders', 'removedPlayers', removed_count);
    end if;

    perform public.pe_release_seeker_internal(target_room_id, active_session.id, active_session.seeker_player_id);

    return jsonb_build_object('changed', true, 'reason', 'hide_timer_finished', 'removedPlayers', removed_count);
  end if;

  if active_session.status = 'seeking' then
    if active_session.seek_started_at is null
      or now() < active_session.seek_started_at + make_interval(secs => active_session.seek_duration_seconds) then
      return jsonb_build_object('changed', false, 'reason', 'seek_timer_running');
    end if;

    result_payload := public.pe_build_round_result(target_room_id, active_session.id, 'hiders');

    update public.pe_game_sessions
    set status = 'finished',
        finished_at = now(),
        winner = 'hiders',
        highlight_player_id = (result_payload->>'highlightPlayerId')::uuid
    where id = active_session.id;

    update public.pe_rooms
    set phase = 'finished',
        result = result_payload
    where id = target_room_id;

    return jsonb_build_object('changed', true, 'reason', 'seek_timer_finished');
  end if;

  return jsonb_build_object('changed', false, 'reason', 'unknown_state');
end;
$$;

grant select on public.pe_player_exit_notices to anon;
revoke all on function public.pe_release_seeker_internal(uuid, uuid, uuid) from public;
revoke all on function public.pe_release_seeker_internal(uuid, uuid, uuid) from anon;
grant execute on function public.pe_tick_game_session(uuid, uuid, text) to anon;
