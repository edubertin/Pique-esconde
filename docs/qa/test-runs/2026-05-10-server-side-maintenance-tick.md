# Test Run - Server-Side Maintenance Tick

Data: 2026-05-10
Ambiente: Supabase dev via conexao SQL direta
Branch: `codex/final-snapshot-cleanup`
Migration: `202605100001_server_side_maintenance_tick`

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

## Observacoes

- A RPC esta pronta para chamada manual/admin e para ser plugada em Supabase Cron.
- O cron ainda nao foi configurado automaticamente nesta etapa.
- O intervalo recomendado inicial e 30s ou 60s, a validar com custo e necessidade do piloto.

## Referencias

- Supabase Cron: https://supabase.com/docs/guides/cron
- Supabase Database Functions: https://supabase.com/docs/guides/database/functions
