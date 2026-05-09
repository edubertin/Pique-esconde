create or replace function public.pe_format_duration_label(
  started_at timestamptz,
  finished_at timestamptz default now()
)
returns text
language plpgsql
stable
as $$
declare
  total_seconds integer := greatest(0, floor(extract(epoch from (finished_at - started_at)))::integer);
  minutes integer := total_seconds / 60;
  seconds integer := total_seconds % 60;
begin
  if minutes = 0 then
    return seconds || 's';
  end if;

  if seconds = 0 then
    return minutes || 'min';
  end if;

  return minutes || 'min ' || seconds || 's';
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
  duration_label text;
  highlight_id uuid;
  seeker_id uuid;
  session_started_at timestamptz;
  survivor_ids uuid[];
begin
  select seeker_player_id, started_at
  into seeker_id, session_started_at
  from public.pe_game_sessions
  where id = target_game_session_id
    and room_id = target_room_id;

  duration_label := public.pe_format_duration_label(session_started_at, now());

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
    'durationLabel', duration_label,
    'highlightPlayerId', highlight_id,
    'survivorPlayerIds', survivor_ids,
    'winner', case when round_winner = 'seeker' then 'seeker' else 'hiders' end
  );
end;
$$;

grant execute on function public.pe_format_duration_label(timestamptz, timestamptz) to anon;
grant execute on function public.pe_build_round_result(uuid, uuid, text) to anon;
