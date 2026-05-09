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
  highlight_avatar_id text;
  highlight_id uuid;
  highlight_nickname text;
  player_count integer;
  seeker_avatar_id text;
  seeker_id uuid;
  seeker_nickname text;
  session_started_at timestamptz;
  survivor_ids uuid[];
begin
  select session.seeker_player_id, session.started_at, player.nickname, player.avatar_id
  into seeker_id, session_started_at, seeker_nickname, seeker_avatar_id
  from public.pe_game_sessions session
  left join public.pe_players player on player.id = session.seeker_player_id
  where session.id = target_game_session_id
    and session.room_id = target_room_id;

  select count(*)
  into player_count
  from public.pe_players
  where room_id = target_room_id;

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

  select nickname, avatar_id
  into highlight_nickname, highlight_avatar_id
  from public.pe_players
  where id = highlight_id;

  return jsonb_build_object(
    'capturedPlayerIds', captured_ids,
    'durationLabel', duration_label,
    'highlightAvatarId', highlight_avatar_id,
    'highlightNickname', highlight_nickname,
    'highlightPlayerId', highlight_id,
    'playerCount', player_count,
    'seekerAvatarId', seeker_avatar_id,
    'seekerNickname', seeker_nickname,
    'seekerPlayerId', seeker_id,
    'survivorPlayerIds', survivor_ids,
    'winner', case when round_winner = 'seeker' then 'seeker' else 'hiders' end
  );
end;
$$;

grant execute on function public.pe_build_round_result(uuid, uuid, text) to anon;
