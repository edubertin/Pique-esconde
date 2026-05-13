-- =============================================================================
-- E4-H3: Data Retention Policy Enforcement
-- =============================================================================
-- Retention windows (authoritative reference — also documented in
-- docs/specs/privacy-and-data.md under "Janelas de Retenção Formalizadas"):
--
--   pe_player_locations (raw GPS)
--     • Active match     : kept while room.phase in ('hiding','seeking')
--                          AND associated session.status in ('hiding','seeking')
--     • Post-match grace : 5 minutes after session leaves active phase
--                          (allows result screen to finish loading)
--     • Absolute ceiling : 2 hours since last updated_at
--                          (orphan safety net for abandoned sessions)
--
--   pe_player_hide_spots (locked GPS)
--     • Unchanged — existing cleanup in pe_cleanup_expired_state handles these.
--
--   pe_game_sessions
--     • NOT deleted — retained indefinitely for product metrics views.
--
--   pe_rooms
--     • NOT deleted here — pe_cleanup_expired_state handles room expiry.
--
-- Caller: pe_run_maintenance_tick (security definer, never anon).
-- No PII (nicknames, coordinates) appears in any log or return value.
-- =============================================================================

create or replace function public.pe_enforce_retention_policy()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_post_match  integer := 0;
  deleted_orphan      integer := 0;
begin
  -- Rule 1: GPS rows whose session is no longer active, past the 5-min grace.
  -- Covers: finished sessions, sessions with NULL game_session_id, and rooms
  -- that transitioned to 'finished'/'lobby' phase after a normal round end.
  delete from public.pe_player_locations loc
  where not exists (
    select 1
    from public.pe_game_sessions s
    where s.id = loc.game_session_id
      and s.status in ('hiding', 'seeking')
  )
  and loc.updated_at < now() - interval '5 minutes';
  get diagnostics deleted_post_match = row_count;

  -- Rule 2: Absolute 2-hour ceiling — orphan safety net.
  -- Catches GPS rows where updated_at is stale beyond any reasonable game
  -- duration. This is the last line of defence for sessions that were never
  -- formally finished (e.g. server restart between ticks).
  delete from public.pe_player_locations
  where updated_at < now() - interval '2 hours';
  get diagnostics deleted_orphan = row_count;

  return jsonb_build_object(
    'deletedPostMatch', deleted_post_match,
    'deletedOrphan',    deleted_orphan
  );
end;
$$;

-- Grant only to the role that runs the maintenance tick.
-- anon must never be able to invoke retention cleanup directly.
revoke all on function public.pe_enforce_retention_policy() from public;
revoke all on function public.pe_enforce_retention_policy() from anon;

-- Wire the companion function into the maintenance tick.
-- pe_run_maintenance_tick already calls pe_cleanup_expired_state() twice
-- (before and after the per-room loop). We replace those call-sites so the
-- tick also invokes pe_enforce_retention_policy() in the after-pass, where
-- post-match rows are most likely to be eligible.
create or replace function public.pe_run_maintenance_tick(
  target_room_id uuid default null,
  max_rooms integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleanup_after     jsonb;
  cleanup_before    jsonb;
  processed_count   integer := 0;
  retention_result  jsonb;
  room_record       record;
  tick_results      jsonb := '[]'::jsonb;
  tick_result       jsonb;
begin
  cleanup_before := public.pe_cleanup_expired_state();

  for room_record in
    select rooms.id
    from public.pe_rooms rooms
    where (
      target_room_id is not null
      and rooms.id = target_room_id
    ) or (
      target_room_id is null
      and exists (
        select 1
        from public.pe_game_sessions sessions
        where sessions.room_id = rooms.id
          and sessions.status in ('hiding', 'seeking')
      )
    ) or (
      target_room_id is null
      and rooms.expires_at is not null
      and rooms.expires_at <= now()
    )
    order by rooms.id
    limit least(greatest(coalesce(max_rooms, 50), 1), 250)
    for update of rooms skip locked
  loop
    tick_result  := public.pe_maintenance_tick_room(room_record.id);
    tick_results := tick_results || jsonb_build_array(tick_result);
    processed_count := processed_count + 1;
  end loop;

  cleanup_after    := public.pe_cleanup_expired_state();
  retention_result := public.pe_enforce_retention_policy();

  return jsonb_build_object(
    'cleanupAfter',    cleanup_after,
    'cleanupBefore',   cleanup_before,
    'processedRooms',  processed_count,
    'retentionPolicy', retention_result,
    'results',         tick_results,
    'serverTime',      now()
  );
end;
$$;

comment on function public.pe_enforce_retention_policy() is
  'E4-H3 retention enforcement. Deletes pe_player_locations rows for '
  'finished/orphaned sessions (5-min grace) and any row older than 2 hours. '
  'Never deletes pe_game_sessions. Called by pe_run_maintenance_tick.';

comment on function public.pe_run_maintenance_tick(uuid, integer) is
  'Server-side maintenance entrypoint. Intended for Supabase Cron/manual SQL, '
  'not client gameplay. Runs due game ticks, GPS enforcement, expired-state '
  'cleanup, and retention policy enforcement (E4-H3).';

revoke all on function public.pe_run_maintenance_tick(uuid, integer) from public;
revoke all on function public.pe_run_maintenance_tick(uuid, integer) from anon;

notify pgrst, 'reload schema';
