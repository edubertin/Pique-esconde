-- Harden pilot/prod access for server-side maintenance and DEV-only tools.
-- Normal player-facing RPCs remain available to anon because the MVP uses
-- temporary room/player tokens instead of full authentication.

revoke all on function public.pe_maintenance_tick_room(uuid) from public;
revoke all on function public.pe_maintenance_tick_room(uuid) from anon;
revoke all on function public.pe_maintenance_tick_room(uuid) from authenticated;

revoke all on function public.pe_run_maintenance_tick(uuid, integer) from public;
revoke all on function public.pe_run_maintenance_tick(uuid, integer) from anon;
revoke all on function public.pe_run_maintenance_tick(uuid, integer) from authenticated;

revoke all on function public.pe_cleanup_expired_state() from public;
revoke all on function public.pe_cleanup_expired_state() from anon;
revoke all on function public.pe_cleanup_expired_state() from authenticated;

revoke all on table public.pe_dev_test_distances from public;
revoke all on table public.pe_dev_test_distances from anon;
revoke all on table public.pe_dev_test_distances from authenticated;

drop policy if exists "pe dev test distances are readable for temporary room access"
on public.pe_dev_test_distances;

create policy "pe dev test distances are not publicly readable"
on public.pe_dev_test_distances for select
to anon
using (false);

revoke all on function public.pe_add_demo_player(uuid, uuid, text, integer) from public;
revoke all on function public.pe_add_demo_player(uuid, uuid, text, integer) from anon;
revoke all on function public.pe_add_demo_player(uuid, uuid, text, integer) from authenticated;

revoke all on function public.pe_simulate_capture(uuid, uuid, text) from public;
revoke all on function public.pe_simulate_capture(uuid, uuid, text) from anon;
revoke all on function public.pe_simulate_capture(uuid, uuid, text) from authenticated;

revoke all on function public.pe_dev_add_target_player(uuid, uuid, text) from public;
revoke all on function public.pe_dev_add_target_player(uuid, uuid, text) from anon;
revoke all on function public.pe_dev_add_target_player(uuid, uuid, text) from authenticated;

revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision) from public;
revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision) from anon;
revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision) from authenticated;

revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision, double precision, text) from public;
revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision, double precision, text) from anon;
revoke all on function public.pe_dev_set_test_distance(uuid, uuid, text, double precision, double precision, text) from authenticated;

revoke all on function public.pe_dev_clear_test_distance(uuid, uuid, text) from public;
revoke all on function public.pe_dev_clear_test_distance(uuid, uuid, text) from anon;
revoke all on function public.pe_dev_clear_test_distance(uuid, uuid, text) from authenticated;

revoke all on function public.pe_get_room_debug_snapshot(uuid, uuid, text) from public;
revoke all on function public.pe_get_room_debug_snapshot(uuid, uuid, text) from anon;
revoke all on function public.pe_get_room_debug_snapshot(uuid, uuid, text) from authenticated;

comment on function public.pe_run_maintenance_tick(uuid, integer) is
  'Server-side maintenance entrypoint. Do not grant to anon/authenticated clients.';

comment on function public.pe_cleanup_expired_state() is
  'Server-side cleanup helper. Do not grant to anon/authenticated clients.';

notify pgrst, 'reload schema';
