# Test Run - PWA Session and Lobby Sync

Data: 2026-05-10
Responsavel: Codex
Tipo: Regressao tecnica / Smoke web
Ambiente: Expo Web local, Vercel production deploy
Dispositivo: Desktop web automatizado; producao validada por HTTP
Sistema: Windows / Chromium Playwright
Commit: worktree local

## Objetivo

- Validar a correcao de refresh no PWA.
- Melhorar resposta do lobby quando Realtime atrasa.
- Reduzir risco de loop entre snapshot e `last_seen_at`.
- Preparar base para QA em Android real.

## Escopo Testado

- Restauracao de sessao local apos reload no lobby.
- Guard de rota aguardando restore antes de redirecionar para Home.
- Polling leve do lobby por `pe_get_room_snapshot`.
- Refresh ao voltar para foco/foreground.
- Debounce e coalescing de refresh originado por Realtime.
- Build web e deploy Vercel.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-PWA-001 | Passou | `npx tsc --noEmit` sem erros. |
| TC-PWA-002 | Passou | `npm run lint` sem erros. |
| TC-PWA-003 | Passou | `npm run qa:web -- --reporter=line` criou sala, abriu lobby, fez reload e continuou no lobby. |
| TC-PWA-004 | Passou | `npm run build:web` exportou web sem erro. |
| TC-PWA-005 | Passou | Vercel production deploy ficou `READY`. |
| TC-PWA-006 | Passou | `https://pique-esconde.eduardobertin.com.br` respondeu HTTP 200 apos deploy. |
| TC-DB-001 | Parcial | Migration `202605100009_throttle_player_presence_touch` criada; usuario informou que aplicou o SQL no Supabase. |

## Evidencias

- Deploy Vercel: `dpl_66SVXah6N44DYpZuKq8uUKs1YHVV`
- URL: `https://pique-esconde.eduardobertin.com.br`
- Teste Playwright: `apps/mobile/e2e/room-web-smoke.spec.js`

## Bugs Encontrados

- Nenhum bug novo confirmado na execucao automatizada.

## Riscos ou Duvidas

- Ainda falta validar em dois celulares reais.
- Se o usuario tocar em `Sair` e depois entrar de novo, duplicacao residual pode depender de idempotencia/limpeza em `pe_join_room` e `pe_leave_room`, nao apenas da sessao local.
- Polling melhora a percepcao do lobby, mas deve ser monitorado em custo/latencia durante piloto.

## Decisao Final

Status: Parcial

Resumo:
- A camada web esta pronta para novo teste PWA.
- A proxima validacao deve ser APK Android em aparelhos reais.
