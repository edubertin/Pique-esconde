create or replace function public.pe_enforce_location_rules(target_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_session public.pe_game_sessions;
  drift_meters double precision;
  eliminated_count integer := 0;
  player_record record;
  remaining_count integer;
  stale_since timestamptz;
begin
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status not in ('hiding', 'seeking') then
    return jsonb_build_object('eliminatedCount', 0);
  end if;

  for player_record in
    select players.id,
           players.room_id,
           players.nickname,
           players.status,
           locations.updated_at,
           locations.lat,
           locations.lng,
           hide_spots.lat as hidden_lat,
           hide_spots.lng as hidden_lng,
           hide_spots.violation_started_at
    from public.pe_players players
    left join public.pe_player_locations locations on locations.player_id = players.id
    left join public.pe_player_hide_spots hide_spots on hide_spots.player_id = players.id
    where players.room_id = target_room_id
      and players.id <> active_session.seeker_player_id
      and players.status = 'Escondido'
  loop
    if player_record.nickname = 'Alvo DEV' then
      continue;
    end if;

    stale_since := coalesce(player_record.updated_at, active_session.seek_started_at, active_session.started_at);

    if now() - stale_since >= interval '30 seconds' then
      insert into public.pe_player_exit_notices (player_id, room_id, reason)
      values (player_record.id, target_room_id, 'signal_lost')
      on conflict (player_id) do update
        set reason = excluded.reason,
            created_at = now();

      delete from public.pe_players
      where id = player_record.id
        and room_id = target_room_id;

      eliminated_count := eliminated_count + 1;
      continue;
    end if;

    if player_record.status = 'Escondido'
      and player_record.hidden_lat is not null
      and player_record.lat is not null then
      drift_meters := public.pe_distance_meters(player_record.hidden_lat, player_record.hidden_lng, player_record.lat, player_record.lng);

      if drift_meters > 10 then
        update public.pe_player_hide_spots
        set violation_started_at = coalesce(violation_started_at, now()),
            last_violation_at = now()
        where player_id = player_record.id;

        if now() - coalesce(player_record.violation_started_at, now()) >= interval '30 seconds' then
          insert into public.pe_player_exit_notices (player_id, room_id, reason)
          values (player_record.id, target_room_id, 'left_hide_area')
          on conflict (player_id) do update
            set reason = excluded.reason,
                created_at = now();

          delete from public.pe_players
          where id = player_record.id
            and room_id = target_room_id;

          eliminated_count := eliminated_count + 1;
        end if;
      else
        update public.pe_player_hide_spots
        set violation_started_at = null,
            last_violation_at = null
        where player_id = player_record.id;
      end if;
    end if;
  end loop;

  select count(*) into remaining_count from public.pe_players where room_id = target_room_id;
  perform public.pe_finish_gps_interrupted_match(target_room_id, active_session.id, remaining_count);

  return jsonb_build_object('eliminatedCount', eliminated_count);
end;
$$;

revoke all on function public.pe_enforce_location_rules(uuid) from public;
revoke all on function public.pe_enforce_location_rules(uuid) from anon;

notify pgrst, 'reload schema';
