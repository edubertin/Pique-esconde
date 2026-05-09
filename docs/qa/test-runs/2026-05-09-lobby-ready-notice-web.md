# Test Run - Lobby Ready Notice Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica, integracao e smoke visual
Ambiente: Expo Web `http://localhost:8082` + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar aviso realtime quando o lider tenta iniciar a partida e ainda ha jogadores nao preparados.
- Confirmar que o aviso e gravado no Supabase e chega para todos via sala.
- Confirmar que o aviso limpa quando os jogadores pendentes ficam preparados.
- Confirmar que o aviso nao reaparece sozinho caso alguem desmarque preparado depois; ele so reaparece em nova tentativa do lider.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-NOTICE-001 | Passou | Tentativa de iniciar com jogador em `Entrou` retornou `started:false` e gravou `lobby_notice.type = players_not_ready`. |
| TC-NOTICE-002 | Passou | `lobby_notice.names` incluiu o jogador nao preparado. |
| TC-NOTICE-003 | Passou | Ao jogador clicar `Preparado`, `pe_toggle_ready` limpou o `lobby_notice`. |
| TC-NOTICE-004 | Passou | Ao desmarcar preparado depois do aviso limpo, o aviso nao reapareceu sozinho. |
| TC-NOTICE-005 | Passou | Nova tentativa do lider recriou o aviso com o jogador pendente. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |
| TC-WEB-001 | Passou | `npm run qa:web -- --reporter=line` executado sem erros. |
| TC-BUILD-001 | Passou | `npx expo export --platform web --output-dir dist-qa-lobby-notice` executado sem erros. |

## Evidencias

- Migrations:
  - `supabase/migrations/202605090008_lobby_start_notice.sql`
  - `supabase/migrations/202605090009_refresh_lobby_notice_on_ready.sql`
- UI: `apps/mobile/app/lobby.tsx`
- Service: `apps/mobile/src/services/room-service.ts`
- Store: `apps/mobile/src/state/room-store.tsx`

## Decisao Final

Status: Aprovado

Resumo:
- A tentativa de iniciar partida agora vira um aviso realtime para toda a sala quando falta alguem preparar.
- O aviso e diferente por papel na UI: lider, jogador pendente e jogador ja pronto.
