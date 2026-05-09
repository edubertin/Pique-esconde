# Test Run - Game Session Real Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica e integracao
Ambiente: Expo Web + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar a primeira camada real de rodada sem GPS.
- Confirmar que sala real agora cria `pe_game_sessions` e sincroniza status de jogo.
- Confirmar que captura simulada usa jogadores reais da sala.

## Escopo Testado

- Migration `pe_game_sessions`.
- Status reais de jogadores durante rodada: `Escondendo`, `Escondido`, `Procurando`, `Capturado`.
- RPCs:
  - `pe_start_round`
  - `pe_mark_hidden`
  - `pe_release_seeker`
  - `pe_simulate_capture`
  - `pe_finish_round`
  - `pe_rematch`
- Integração do app com `gameSession` no `room-store`.
- Rotas:
  - `/lobby`
  - `/hide-phase`
  - `/hider-status`
  - `/seeker-radar`
  - `/capture`
  - `/result`

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-GAME-001 | Passou | Criar sala e entrar com segundo jogador via Supabase RPC. |
| TC-GAME-002 | Passou | `pe_start_round` criou game session e colocou lider como `Procurando`, escondido como `Escondendo`. |
| TC-GAME-003 | Passou | `pe_mark_hidden` marcou escondido e liberou busca automaticamente quando todos estavam escondidos. |
| TC-GAME-004 | Passou | `pe_simulate_capture` capturou um jogador real e finalizou a rodada quando nao havia escondidos restantes. |
| TC-GAME-005 | Passou | Resultado foi gravado em `pe_rooms.result` com vencedor e jogador em destaque. |
| TC-GAME-006 | Passou | `pe_rematch` voltou a sala para lobby e resetou status dos jogadores. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |
| TC-TECH-003 | Passou | `npx expo export --platform web --output-dir dist-qa-game-session` executado sem erros. |

## Evidencias

- Migration: `supabase/migrations/202605090003_pe_game_sessions.sql`
- Store: `apps/mobile/src/state/room-store.tsx`
- Service: `apps/mobile/src/services/room-service.ts`
- Telas integradas:
  - `apps/mobile/app/hide-phase.tsx`
  - `apps/mobile/app/hider-status.tsx`
  - `apps/mobile/app/seeker-radar.tsx`
  - `apps/mobile/app/capture.tsx`
  - `apps/mobile/app/result.tsx`

## Bugs Encontrados

- Nenhum bug tecnico confirmado nesta rodada.

## Riscos ou Duvidas

- Validacao visual manual em duas abas/dispositivos ainda deve ser feita para o novo fluxo de rodada.
- Timers ainda sao visuais/simulados; a liberacao automatica por tempo real fica para etapa posterior.
- GPS, radar real e captura por proximidade continuam fora desta etapa.
- Captura simulada captura o primeiro escondido ativo por ordem de entrada.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- A rodada real sem GPS esta operacional no backend e compilando no app.
- Proxima validacao deve ser manual em duas abas: iniciar partida, marcar escondido, liberar busca, simular captura, resultado e jogar novamente.
