create or replace function public.pe_get_room_snapshot(
  target_room_id uuid,
  actor_player_id uuid default null,
  player_session_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_player public.pe_players;
  active_session public.pe_game_sessions;
  exit_notice public.pe_player_exit_notices;
  players_payload jsonb;
  room_record public.pe_rooms;
begin
  select *
  into room_record
  from public.pe_rooms
  where id = target_room_id;

  if room_record.id is null then
    raise exception 'Room not found';
  end if;

  if actor_player_id is not null and player_session_token is not null then
    active_player := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

    select *
    into exit_notice
    from public.pe_player_exit_notices
    where player_id = actor_player_id
    order by created_at desc
    limit 1;
  end if;

  select *
  into active_session
  from public.pe_game_sessions
  where room_id = target_room_id
  order by created_at desc
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'avatar_id', players.avatar_id,
        'id', players.id,
        'is_leader', players.is_leader,
        'nickname', players.nickname,
        'status', case
          when room_record.phase = 'lobby' and players.status in ('Escondendo', 'Escondido', 'Procurando', 'Capturado') then
            case
              when players.is_leader then 'Entrou'
              when players.nickname = 'Alvo DEV' then 'Preparado'
              else 'Aguardando'
            end
          else players.status
        end
      )
      order by players.joined_at
    ),
    '[]'::jsonb
  )
  into players_payload
  from public.pe_players players
  where players.room_id = target_room_id;

  return jsonb_build_object(
    'activePlayer', case
      when active_player.id is null then null
      else jsonb_build_object(
        'avatar_id', active_player.avatar_id,
        'id', active_player.id,
        'is_leader', active_player.is_leader,
        'nickname', active_player.nickname,
        'status', case
          when room_record.phase = 'lobby' and active_player.status in ('Escondendo', 'Escondido', 'Procurando', 'Capturado') then
            case
              when active_player.is_leader then 'Entrou'
              when active_player.nickname = 'Alvo DEV' then 'Preparado'
              else 'Aguardando'
            end
          else active_player.status
        end
      )
    end,
    'activePlayerExitReason', exit_notice.reason,
    'activePlayerToken', player_session_token,
    'gameSession', case
      when active_session.id is null or room_record.phase = 'lobby' then null
      else jsonb_build_object(
        'capture_confirm_seconds', active_session.capture_confirm_seconds,
        'capture_radius_meters', active_session.capture_radius_meters,
        'environment_preset', active_session.environment_preset,
        'hide_duration_seconds', active_session.hide_duration_seconds,
        'id', active_session.id,
        'seek_duration_seconds', active_session.seek_duration_seconds,
        'seek_started_at', active_session.seek_started_at,
        'seeker_player_id', active_session.seeker_player_id,
        'started_at', active_session.started_at,
        'status', active_session.status
      )
    end,
    'players', players_payload,
    'room', jsonb_build_object(
      'capture_confirm_seconds', room_record.capture_confirm_seconds,
      'capture_radius_meters', room_record.capture_radius_meters,
      'closed_reason', room_record.closed_reason,
      'code', room_record.code,
      'environment_preset', room_record.environment_preset,
      'expires_at', room_record.expires_at,
      'hide_duration_seconds', room_record.hide_duration_seconds,
      'id', room_record.id,
      'lobby_notice', room_record.lobby_notice,
      'max_players', room_record.max_players,
      'phase', room_record.phase,
      'result', room_record.result,
      'seek_duration_seconds', room_record.seek_duration_seconds
    )
  );
end;
$$;

grant execute on function public.pe_get_room_snapshot(uuid, uuid, text) to anon;

notify pgrst, 'reload schema';
