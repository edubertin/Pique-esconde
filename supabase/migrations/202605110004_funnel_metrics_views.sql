-- E5-H2 Phase A: aggregate funnel metrics derived from existing tables.
-- No PII: views never project player_id, nickname, seeker_player_id,
-- highlight_player_id, final_snapshot, result, lat, lng, or room_id.
-- Accessible only via service_role / Supabase dashboard — not granted to anon.

-- v_funnel_summary: room/session conversion rates and winner distribution.
create or replace view public.v_funnel_summary as
select
  count(distinct r.id)                                                      as rooms_created,
  count(distinct gs.room_id)                                                as rooms_started_game,
  count(distinct case when gs.status in ('seeking','finished') then gs.room_id end) as rooms_reached_seeking,
  count(distinct case when gs.status = 'finished' then gs.room_id end)     as rooms_finished,
  count(distinct gs.id)                                                     as sessions_total,
  count(distinct case when gs.status = 'finished' then gs.id end)          as sessions_finished,
  count(distinct case when gs.winner = 'seeker'  then gs.id end)           as seeker_wins,
  count(distinct case when gs.winner = 'hiders'  then gs.id end)           as hiders_wins,
  count(distinct case when sc.session_count > 1  then r.id end)            as rooms_with_rematch,
  round(
    count(distinct gs.room_id)::numeric /
    nullif(count(distinct r.id), 0) * 100, 1
  )                                                                          as lobby_to_game_pct,
  round(
    count(distinct case when gs.status = 'finished' then gs.id end)::numeric /
    nullif(count(distinct gs.id), 0) * 100, 1
  )                                                                          as game_completion_pct,
  round(
    count(distinct case when sc.session_count > 1 then r.id end)::numeric /
    nullif(count(distinct case when gs.status = 'finished' then gs.room_id end), 0) * 100, 1
  )                                                                          as rematch_pct
from public.pe_rooms r
left join public.pe_game_sessions gs on gs.room_id = r.id
left join (
  select room_id, count(*) as session_count
  from public.pe_game_sessions
  where status = 'finished'
  group by room_id
) sc on sc.room_id = r.id;

-- v_session_durations: hide/seek phase durations by environment preset.
-- Only completed sessions with both timestamps present.
-- HAVING COUNT(*) >= 3 suppresses groups too small to aggregate safely.
create or replace view public.v_session_durations as
select
  gs.environment_preset,
  count(*)                                                                   as session_count,
  -- Configured timer limits for comparison context.
  round(avg(gs.hide_duration_seconds), 0)                                  as hide_configured_s,
  round(avg(gs.seek_duration_seconds), 0)                                  as seek_configured_s,
  -- Actual hide phase: session start → seeker released.
  round(percentile_cont(0.25) within group (
    order by extract(epoch from (gs.seek_started_at - gs.started_at))
  )::numeric, 0)                                                            as hide_p25_s,
  round(percentile_cont(0.50) within group (
    order by extract(epoch from (gs.seek_started_at - gs.started_at))
  )::numeric, 0)                                                            as hide_p50_s,
  round(percentile_cont(0.75) within group (
    order by extract(epoch from (gs.seek_started_at - gs.started_at))
  )::numeric, 0)                                                            as hide_p75_s,
  -- Actual seek phase: seeker released → game finished.
  round(percentile_cont(0.25) within group (
    order by extract(epoch from (gs.finished_at - gs.seek_started_at))
  )::numeric, 0)                                                            as seek_p25_s,
  round(percentile_cont(0.50) within group (
    order by extract(epoch from (gs.finished_at - gs.seek_started_at))
  )::numeric, 0)                                                            as seek_p50_s,
  round(percentile_cont(0.75) within group (
    order by extract(epoch from (gs.finished_at - gs.seek_started_at))
  )::numeric, 0)                                                            as seek_p75_s
from public.pe_game_sessions gs
where gs.status = 'finished'
  and gs.seek_started_at is not null
  and gs.finished_at is not null
group by gs.environment_preset
having count(*) >= 3;

-- Intentionally NOT granting to anon or authenticated.
-- Query via Supabase dashboard or service_role key only.
