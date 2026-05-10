create extension if not exists pg_cron;

select cron.schedule(
  'pe-maintenance-tick-every-minute',
  '* * * * *',
  $$select public.pe_run_maintenance_tick(null::uuid, 50);$$
);

comment on extension pg_cron is
  'Supabase Cron/pg_cron schedules server-side maintenance for Pique Esconde.';
