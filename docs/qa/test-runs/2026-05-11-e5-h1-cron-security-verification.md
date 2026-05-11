# Test Run - E5-H1 Supabase Cron e Seguranca de Grants

Data: 2026-05-11
Ambiente: Supabase dev — dashboard SQL + Cron jobs
Branch: `codex/final-snapshot-cleanup`
Migrations aplicadas nesta sessao:
- `202605110001_unique_room_nicknames`
- `202605110002_hider_signal_warning`
- `202605110003_revoke_cleanup_from_anon` (criado apos correco ao vivo)

## Objetivo

Confirmar que o Supabase Cron esta ativo e saudavel no ambiente usado para teste, e que nenhuma funcao critica de manutencao esta exposta a `anon`.

## Criterio de Aceite (E5-H1)

> Given partida sem cliente ativo, when timer vence, then cron/tick muda fase ou encerra rodada e nao expoe lat/lng.

## Verificacoes Executadas

### 1. Job registrado e ativo
- Query: `SELECT * FROM cron.job;`
- Resultado: `jobid=1`, `jobname=pe-maintenance-tick-every-minute`, `schedule=* * * * *`, `active=true`
- Status: PASSOU

### 2. Execucoes recentes com sucesso
- Query: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
- Resultado: 10 execucoes com `status=succeeded`, duracao entre 7ms e 20ms
- Status: PASSOU

### 3. Grant pe_run_maintenance_tick para anon
- Query: `SELECT has_function_privilege('anon', 'public.pe_run_maintenance_tick(uuid, integer)', 'execute');`
- Resultado: `false`
- Status: PASSOU

### 4. Grant pe_cleanup_expired_state para anon (problema encontrado e corrigido)
- Query: `SELECT has_function_privilege('anon', 'public.pe_cleanup_expired_state()', 'execute');`
- Resultado inicial: `true` — FALHOU
- Causa: `harden_pilot_security` usou `GRANT EXECUTE ON ALL FUNCTIONS` que incluiu esta funcao
- Correcao: `REVOKE ALL ON FUNCTION pe_cleanup_expired_state() FROM public, anon, authenticated;`
- Verificacao pos-correcao: `false` para `anon` e `false` para `authenticated`
- Status: CORRIGIDO E PASSOU

### 5. Privacidade — ausencia de lat/lng no payload do tick
- Validado em test run anterior (`2026-05-10-server-side-maintenance-tick.md`)
- Status: CONFIRMADO

## Resultado Geral

PASSOU com uma correcao ao vivo (grant de `pe_cleanup_expired_state` revogado).

## Artifacts

- Migration de seguranca criada: `supabase/migrations/202605110003_revoke_cleanup_from_anon.sql`
- Esta migration permanece como registro auditavel e garante que o revoke sobreviva a re-deploys.

## Go/No-Go E5-H1

GO — todos os criterios atendidos:
- [x] Cron ativo com `* * * * *`
- [x] 10/10 execucoes recentes com `succeeded`
- [x] `pe_run_maintenance_tick` nao acessivel por `anon`
- [x] `pe_cleanup_expired_state` nao acessivel por `anon` (corrigido)
- [x] Payload do tick nao contem lat/lng
