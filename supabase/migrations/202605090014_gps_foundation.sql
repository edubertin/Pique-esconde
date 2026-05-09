alter table public.pe_player_exit_notices
  drop constraint if exists pe_player_exit_notices_reason_check;

alter table public.pe_player_exit_notices
  add constraint pe_player_exit_notices_reason_check
  check (reason in ('not_hidden_in_time', 'signal_lost', 'left_hide_area'));

create table if not exists public.pe_player_locations (
  player_id uuid primary key references public.pe_players(id) on delete cascade,
  room_id uuid not null references public.pe_rooms(id) on delete cascade,
  game_session_id uuid references public.pe_game_sessions(id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  accuracy_m double precision check (accuracy_m is null or accuracy_m >= 0),
  heading_degrees double precision,
  speed_mps double precision,
  updated_at timestamptz not null default now()
);

create index if not exists pe_player_locations_room_updated_idx
on public.pe_player_locations(room_id, updated_at);

create table if not exists public.pe_player_hide_spots (
  player_id uuid primary key references public.pe_players(id) on delete cascade,
  room_id uuid not null references public.pe_rooms(id) on delete cascade,
  game_session_id uuid not null references public.pe_game_sessions(id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  accuracy_m double precision check (accuracy_m is null or accuracy_m >= 0),
  locked_at timestamptz not null default now(),
  violation_started_at timestamptz,
  last_violation_at timestamptz
);

create index if not exists pe_player_hide_spots_room_idx
on public.pe_player_hide_spots(room_id, game_session_id);

create table if not exists public.pe_capture_confirmations (
  seeker_player_id uuid not null references public.pe_players(id) on delete cascade,
  target_player_id uuid not null references public.pe_players(id) on delete cascade,
  room_id uuid not null references public.pe_rooms(id) on delete cascade,
  game_session_id uuid not null references public.pe_game_sessions(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (seeker_player_id, target_player_id)
);

alter table public.pe_player_locations enable row level security;
alter table public.pe_player_hide_spots enable row level security;
alter table public.pe_capture_confirmations enable row level security;

create or replace function public.pe_distance_meters(
  lat_a double precision,
  lng_a double precision,
  lat_b double precision,
  lng_b double precision
)
returns double precision
language sql
immutable
as $$
  select 6371000 * 2 * asin(
    sqrt(
      power(sin(radians((lat_b - lat_a) / 2)), 2) +
      cos(radians(lat_a)) * cos(radians(lat_b)) *
      power(sin(radians((lng_b - lng_a) / 2)), 2)
    )
  );
$$;

create or replace function public.pe_location_signal_status(last_update timestamptz)
returns text
language sql
stable
as $$
  select case
    when last_update is null then 'lost'
    when now() - last_update >= interval '30 seconds' then 'lost'
    when now() - last_update >= interval '15 seconds' then 'warning'
    else 'fresh'
  end;
$$;

create or replace function public.pe_finish_gps_interrupted_match(
  target_room_id uuid,
  target_game_session_id uuid,
  remaining_count integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if remaining_count >= 2 then
    return;
  end if;

  update public.pe_game_sessions
  set status = 'finished',
      finished_at = now(),
      winner = 'seeker'
  where id = target_game_session_id;

  update public.pe_players
  set status = case when is_leader then 'Entrou' else 'Aguardando' end
  where room_id = target_room_id;

  update public.pe_rooms
  set phase = 'lobby',
      result = null,
      closed_reason = 'not_enough_players',
      expires_at = public.pe_solo_expires_at(remaining_count)
  where id = target_room_id;
end;
$$;

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

create or replace function public.pe_update_player_location(
  target_room_id uuid,
  actor_player_id uuid,
  player_session_token text,
  lat double precision,
  lng double precision,
  accuracy_m double precision default null,
  heading_degrees double precision default null,
  speed_mps double precision default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.pe_players;
  active_session public.pe_game_sessions;
  enforcement_result jsonb;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if lat < -90 or lat > 90 or lng < -180 or lng > 180 then
    raise exception 'Invalid GPS coordinates';
  end if;

  insert into public.pe_player_locations (
    player_id,
    room_id,
    game_session_id,
    lat,
    lng,
    accuracy_m,
    heading_degrees,
    speed_mps,
    updated_at
  )
  values (
    actor.id,
    target_room_id,
    active_session.id,
    lat,
    lng,
    accuracy_m,
    heading_degrees,
    speed_mps,
    now()
  )
  on conflict (player_id) do update
    set room_id = excluded.room_id,
        game_session_id = excluded.game_session_id,
        lat = excluded.lat,
        lng = excluded.lng,
        accuracy_m = excluded.accuracy_m,
        heading_degrees = excluded.heading_degrees,
        speed_mps = excluded.speed_mps,
        updated_at = now();

  enforcement_result := public.pe_enforce_location_rules(target_room_id);

  return jsonb_build_object(
    'signalStatus', 'fresh',
    'enforcement', enforcement_result
  );
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
  latest_location public.pe_player_locations;
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

  select *
  into latest_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id;

  if latest_location.player_id is not null then
    insert into public.pe_player_hide_spots (
      player_id,
      room_id,
      game_session_id,
      lat,
      lng,
      accuracy_m,
      locked_at
    )
    values (
      actor.id,
      target_room_id,
      active_session.id,
      latest_location.lat,
      latest_location.lng,
      latest_location.accuracy_m,
      now()
    )
    on conflict (player_id) do update
      set room_id = excluded.room_id,
          game_session_id = excluded.game_session_id,
          lat = excluded.lat,
          lng = excluded.lng,
          accuracy_m = excluded.accuracy_m,
          locked_at = now(),
          violation_started_at = null,
          last_violation_at = null;
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

create or replace function public.pe_try_capture_nearest(
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
  capture_started_at timestamptz;
  nearest_hider record;
  remaining_hiders integer;
  seeker_location public.pe_player_locations;
begin
  actor := public.pe_assert_player_token(target_room_id, actor_player_id, player_session_token);
  active_session := public.pe_current_game_session(target_room_id);

  if active_session.id is null or active_session.status <> 'seeking' then
    raise exception 'No seeking phase is active';
  end if;

  if actor.id <> active_session.seeker_player_id then
    raise exception 'Only the seeker can capture';
  end if;

  select *
  into seeker_location
  from public.pe_player_locations
  where player_id = actor.id
    and room_id = target_room_id
    and updated_at >= now() - interval '15 seconds';

  if seeker_location.player_id is null then
    delete from public.pe_capture_confirmations
    where seeker_player_id = actor.id;

    return jsonb_build_object('captured', false, 'reason', 'seeker_signal_unstable');
  end if;

  select players.id,
         players.nickname,
         public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng) as distance_meters
  into nearest_hider
  from public.pe_players players
  join public.pe_player_locations locations on locations.player_id = players.id
  where players.room_id = target_room_id
    and players.id <> active_session.seeker_player_id
    and players.status <> 'Capturado'
    and locations.updated_at >= now() - interval '15 seconds'
  order by public.pe_distance_meters(seeker_location.lat, seeker_location.lng, locations.lat, locations.lng)
  limit 1;

  if nearest_hider.id is null or nearest_hider.distance_meters > 5 then
    delete from public.pe_capture_confirmations
    where seeker_player_id = actor.id;

    return jsonb_build_object(
      'captured', false,
      'reason', 'no_target_in_range',
      'distanceMeters', nearest_hider.distance_meters
    );
  end if;

  delete from public.pe_capture_confirmations
  where seeker_player_id = actor.id
    and target_player_id <> nearest_hider.id;

  insert into public.pe_capture_confirmations (
    seeker_player_id,
    target_player_id,
    room_id,
    game_session_id,
    started_at,
    last_seen_at
  )
  values (
    actor.id,
    nearest_hider.id,
    target_room_id,
    active_session.id,
    now(),
    now()
  )
  on conflict (seeker_player_id, target_player_id) do update
    set room_id = excluded.room_id,
        game_session_id = excluded.game_session_id,
        started_at = case
          when pe_capture_confirmations.game_session_id <> excluded.game_session_id then now()
          else pe_capture_confirmations.started_at
        end,
        last_seen_at = now()
  returning started_at into capture_started_at;

  if now() - capture_started_at < interval '3 seconds' then
    return jsonb_build_object(
      'captured', false,
      'reason', 'confirming',
      'targetPlayerId', nearest_hider.id,
      'distanceMeters', nearest_hider.distance_meters,
      'confirmStartedAt', capture_started_at
    );
  end if;

  update public.pe_players
  set status = 'Capturado'
  where id = nearest_hider.id
    and room_id = target_room_id;

  delete from public.pe_capture_confirmations
  where seeker_player_id = actor.id;

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
    'captured', true,
    'capturedPlayerId', nearest_hider.id,
    'remainingHiders', remaining_hiders,
    'distanceMeters', nearest_hider.distance_meters
  );
end;
$$;

revoke all on public.pe_player_locations from anon;
revoke all on public.pe_player_hide_spots from anon;
revoke all on public.pe_capture_confirmations from anon;
revoke all on function public.pe_finish_gps_interrupted_match(uuid, uuid, integer) from public;
revoke all on function public.pe_finish_gps_interrupted_match(uuid, uuid, integer) from anon;
revoke all on function public.pe_enforce_location_rules(uuid) from public;
revoke all on function public.pe_enforce_location_rules(uuid) from anon;
grant execute on function public.pe_distance_meters(double precision, double precision, double precision, double precision) to anon;
grant execute on function public.pe_location_signal_status(timestamptz) to anon;
grant execute on function public.pe_update_player_location(uuid, uuid, text, double precision, double precision, double precision, double precision, double precision) to anon;
grant execute on function public.pe_mark_hidden(uuid, uuid, text) to anon;
grant execute on function public.pe_try_capture_nearest(uuid, uuid, text) to anon;
