create or replace function public.pe_update_room_rules(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  environment_preset text,
  hide_duration_seconds integer,
  seek_duration_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  safe_environment text := case when environment_preset in ('small', 'medium', 'large') then environment_preset else 'medium' end;
  safe_hide_seconds integer := case when hide_duration_seconds in (30, 45, 60) then hide_duration_seconds else 60 end;
  safe_seek_seconds integer := case when seek_duration_seconds in (120, 180, 300) then seek_duration_seconds else 180 end;
  updated_room public.pe_rooms;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);

  if not actor.is_leader then
    raise exception 'Only the leader can change room rules';
  end if;

  if not exists (
    select 1
    from public.pe_rooms rooms
    where rooms.id = target_room_id
      and rooms.phase = 'lobby'
  ) then
    raise exception 'Rules can only be changed in the lobby';
  end if;

  update public.pe_rooms
  set environment_preset = safe_environment,
      hide_duration_seconds = safe_hide_seconds,
      seek_duration_seconds = safe_seek_seconds,
      capture_radius_meters = public.pe_capture_radius_for_preset(safe_environment),
      capture_confirm_seconds = public.pe_capture_confirm_for_preset(safe_environment)
  where id = target_room_id
  returning * into updated_room;

  update public.pe_players
  set status = 'Aguardando'
  where room_id = target_room_id
    and not is_leader
    and status = 'Preparado'
    and nickname <> 'Alvo DEV';

  return jsonb_build_object(
    'captureConfirmSeconds', updated_room.capture_confirm_seconds,
    'captureRadiusMeters', updated_room.capture_radius_meters,
    'environmentPreset', updated_room.environment_preset,
    'hideDurationSeconds', updated_room.hide_duration_seconds,
    'seekDurationSeconds', updated_room.seek_duration_seconds
  );
end;
$$;

grant execute on function public.pe_update_room_rules(uuid, uuid, text, text, integer, integer) to anon;

notify pgrst, 'reload schema';
