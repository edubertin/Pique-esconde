# Test Run - Round Timers Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica, integracao e smoke visual
Ambiente: Expo Web `http://localhost:8082` + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar timer real da fase de esconder.
- Confirmar que jogador que nao marca "Estou escondido" ate o fim do tempo sai da rodada.
- Confirmar que a partida continua se ainda restarem pelo menos 2 jogadores.
- Confirmar que a sala volta para o lobby se a remocao quebrar o minimo de jogadores.
- Confirmar que o app compila e o smoke visual de sala continua passando.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-TIMER-001 | Passou | Com 3 jogadores, 1 escondido confirmou e 1 nao confirmou; apos 60s, o nao confirmado foi removido, recebeu `not_hidden_in_time` e a sala avancou para `seeking`. |
| TC-TIMER-002 | Passou | Com 2 jogadores, o escondido nao confirmou; apos 60s, ele foi removido, recebeu `not_hidden_in_time` e a sala voltou para `lobby` com `not_enough_players`. |
| TC-TIMER-003 | Parcial | Timeout de busca de 180s foi implementado em `pe_tick_game_session`, mas nao foi aguardado integralmente nesta rodada de QA automatizada. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |
| TC-WEB-001 | Passou | `npm run qa:web -- --reporter=line` executado sem erros. |
| TC-BUILD-001 | Passou | `npx expo export --platform web --output-dir dist-qa-round-timers` executado sem erros. |

## Evidencias

- Migration: `supabase/migrations/202605090006_pe_round_timers.sql`
- RPC nova: `pe_tick_game_session`
- Aviso de saida: `pe_player_exit_notices.reason = not_hidden_in_time`
- Telas integradas:
  - `apps/mobile/app/hide-phase.tsx`
  - `apps/mobile/app/hider-status.tsx`
  - `apps/mobile/app/seeker-radar.tsx`
  - `apps/mobile/app/index.tsx`

## Bugs Encontrados

- Nenhum bug confirmado nesta rodada.

## Riscos ou Pendencias

- O timer ainda depende de algum cliente ativo chamando `pe_tick_game_session`; uma rotina agendada/server-side pode ser necessaria antes de producao.
- Timeout de busca de 180s deve ganhar teste dedicado ou duracao configuravel/test hook para QA mais rapido.
- GPS, radar real e captura por proximidade seguem fora desta etapa.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- Timer real de esconder esta operacional no Supabase e no app.
- Regra CEO validada: quem nao confirma que esta escondido a tempo sai da rodada e pode entrar novamente por codigo.
