# Test Run - Ready Gate Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica, integracao e smoke visual
Ambiente: Expo Web `http://localhost:8082` + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar que o lider nao consegue iniciar partida enquanto houver jogador nao preparado.
- Confirmar que o banco bloqueia `pe_start_round` mesmo se chamado direto.
- Confirmar que, depois de todos os nao-lideres marcarem `Preparado`, a partida inicia normalmente.
- Confirmar que o app segue compilando e o smoke visual de sala continua passando.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-READY-001 | Passou | `pe_start_round` falhou com `Players not ready` quando o escondido ainda estava em `Entrou`. |
| TC-READY-002 | Passou | Sala permaneceu em `lobby` e nenhuma `pe_game_sessions` foi criada apos tentativa bloqueada. |
| TC-READY-003 | Passou | Depois de `pe_toggle_ready`, `pe_start_round` iniciou a rodada e moveu o escondido para `Escondendo`. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |
| TC-WEB-001 | Passou | `npm run qa:web -- --reporter=line` executado sem erros. |
| TC-BUILD-001 | Passou | `npx expo export --platform web --output-dir dist-qa-ready-gate` executado sem erros. |

## Evidencias

- Migration: `supabase/migrations/202605090007_require_ready_to_start.sql`
- UI: `apps/mobile/app/lobby.tsx`
- Store: `apps/mobile/src/state/room-store.tsx`

## Decisao Final

Status: Aprovado

Resumo:
- Regra de pronto obrigatorio no lobby esta aplicada no app e no banco.
- Nao ha kick automatico no lobby; o lider pode remover manualmente quem estiver travando a sala.
