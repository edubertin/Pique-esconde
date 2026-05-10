# Test Run - Server-Side Maintenance Tick

Data: 2026-05-10
Ambiente: Supabase dev via conexao SQL direta
Branch: `codex/final-snapshot-cleanup`
Migrations:

- `202605100001_server_side_maintenance_tick`
- `202605100002_schedule_maintenance_cron`

## Objetivo

Validar a nova rotina server-side de manutencao para timers, GPS enforcement e limpeza, sem depender de cliente ativo.

## Escopo

- `pe_run_maintenance_tick(target_room_id, max_rooms)`
- `pe_maintenance_tick_room(target_room_id)`
- `pe_cleanup_expired_state()`
- Fluxos de esconder vencido, busca vencida, idempotencia e limpeza de sala expirada.

## Resultado Geral

Passou.

## Casos Executados

- Sala sem rodada ativa: `pe_run_maintenance_tick(room_id, 5)` processou a sala e retornou `changed=false`, `reason=no_active_round`.
- Fase de esconder vencida: sala com hider ativo e GPS recente foi transicionada para `seeking` com `reason=hide_timer_finished`.
- Fase de busca vencida: sala foi encerrada como vitoria dos escondidos com `reason=seek_timer_finished`.
- Snapshot final: retorno incluiu `finalSnapshot` com vencedor, sala e jogadores.
- Limpeza de GPS: `pe_player_locations` ficou vazio para a sala encerrada.
- Idempotencia: segunda chamada na sala finalizada retornou `changed=false` e manteve o mesmo `finishedAt`.
- Limpeza de sala expirada: sala com `expires_at` vencido foi removida.
- Grants: `anon` nao possui `execute` em `pe_run_maintenance_tick(uuid, integer)` nem em `pe_cleanup_expired_state()`.
- Privacidade: payload serializado da manutencao nao contem `lat` nem `lng`.
- Supabase Cron: job `pe-maintenance-tick-every-minute` registrado com agenda `* * * * *`.
- Smoke do cron: sala expirada criada artificialmente foi removida pelo job, sem chamada manual de `pe_run_maintenance_tick`.
- Historico do cron: `cron.job_run_details` registrou execucao `succeeded`.

## Observacoes

- A RPC segue disponivel para chamada manual/admin.
- O cron foi configurado no Supabase dev com intervalo de 1 minuto.
- O intervalo de 1 minuto e conservador para MVP; se a experiencia pedir transicoes mais imediatas, avaliar agenda em segundos conforme suporte do Postgres/Supabase do ambiente.

## Referencias

- Supabase Cron: https://supabase.com/docs/guides/cron
- Supabase Database Functions: https://supabase.com/docs/guides/database/functions
