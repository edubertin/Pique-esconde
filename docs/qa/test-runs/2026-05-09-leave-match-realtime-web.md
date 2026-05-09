# Test Run - Leave Match Realtime Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica, integracao e smoke visual
Ambiente: Expo Web `http://localhost:8082` + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar a regra real de saida durante partida.
- Confirmar que a rodada continua quando um escondido sai e ainda ha jogadores suficientes.
- Confirmar que a rodada volta ao lobby quando o procurador sai ou quando sobra menos de 2 jogadores.
- Confirmar visualmente que o app carrega, cria sala real, mostra lobby e consegue sair limpando a sala.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-LEAVE-001 | Passou | Escondido saiu com 3 jogadores; sala continuou em `hiding`, `closed_reason` ficou `null` e restaram 2 jogadores. |
| TC-LEAVE-002 | Passou | Procurador saiu com 3 jogadores; sala voltou para `lobby`, `closed_reason` ficou `seeker_left` e um novo lider foi promovido. |
| TC-LEAVE-003 | Passou | Escondido saiu com 2 jogadores; sala voltou para `lobby`, `closed_reason` ficou `not_enough_players` e restou 1 jogador. |
| TC-WEB-001 | Passou | Screenshot com espera confirmou home renderizada em `8082`. |
| TC-WEB-002 | Passou | Playwright smoke criou sala real, abriu lobby, salvou screenshot e saiu da sala. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |

## Evidencias

- Migrations:
  - `supabase/migrations/202605090004_pe_leave_match_closure.sql`
  - `supabase/migrations/202605090005_pe_leave_match_continue_fix.sql`
- Smoke visual:
  - `apps/mobile/e2e/room-web-smoke.spec.js`
- Screenshots:
  - `docs/qa/test-runs/2026-05-09-visual-home-8082-wait.png`
  - `docs/qa/test-runs/2026-05-09-smoke-home.png`
  - `docs/qa/test-runs/2026-05-09-smoke-lobby-created.png`

## Bugs Encontrados

- A primeira versao da migration 004 interrompia a rodada quando qualquer jogador saia. Corrigido com a migration 005 para interromper somente quando o procurador sai ou quando restam menos de 2 jogadores.
- Algumas telas de partida exibiam `Sair`, mas nao chamavam `leaveRoom`; corrigido em `hide-phase`, `hider-status`, `seeker-radar` e `capture`.
- A tela de captura mostrava acoes de procurador para jogador capturado; corrigido para escondido capturado ver apenas a acao de sair.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- A regra real de saida da partida esta validada por RPC no Supabase.
- O smoke visual web esta automatizado e passou em `8082`.
- Ainda vale repetir manualmente em duas maquinas/celulares para confirmar sensacao de realtime fora do desktop local.
