# Test Run - Room Round Polish Manual Web

Data: 2026-05-09
Responsavel: Usuario + Codex
Tipo: Manual assistido / Regressao de fluxo
Ambiente: Expo Web `http://localhost:8082` + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: e7accf0

## Objetivo

- Registrar a validacao manual final da camada atual de sala, lobby, rodada sem GPS e resultado.
- Confirmar que as correcoes recentes de saida, menos de 2 jogadores, resultado e linguagem por nickname funcionaram no app.
- Parar a documentacao no estado atual, sem iniciar a proxima camada grande de localizacao/radar real.

## Escopo Testado

- Criacao/entrada de sala real.
- Lobby realtime com pronto obrigatorio.
- Inicio da rodada.
- Tela de esconder diferenciada para quem vai procurar e para escondidos.
- Saida durante partida quando sobra apenas 1 jogador.
- Resultado e rematch.
- Copia de interface usando nickname de quem vai procurar.
- Polimento da tela de resultado.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-POLISH-001 | Passou | Usuario confirmou que a regra de voltar ao lobby quando sobra apenas 1 jogador funcionou apos migration 010 e protecao de UI. |
| TC-POLISH-002 | Passou | Usuario confirmou que a camada atual de salas esta funcionando. |
| TC-POLISH-003 | Passou | Tela de resultado foi simplificada: sem voltar no topo, avatar maior e resumo duplicado removido. |
| TC-POLISH-004 | Passou | Linguagem foi ajustada para mostrar nickname de quem vai procurar em vez de tratar "procurador" como identidade fixa. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` passou durante os ajustes. |
| TC-TECH-002 | Passou | `npm run lint` passou durante os ajustes. |

## Evidencias

- Commits relacionados:
  - `f485d0b Return to lobby when hide phase loses players`
  - `8010d2a Polish result screen header and avatar`
  - `30ed170 Simplify result summary layout`
  - `e7accf0 Use player names for searching role copy`
- Migration relacionada:
  - `supabase/migrations/202605090010_pe_remove_player_match_closure.sql`

## Bugs Encontrados

- Nenhum bug aberto ao final desta rodada manual.

## Riscos ou Duvidas

- O timer de busca de 180s ainda merece teste dedicado ou hook de duracao menor para QA mais rapido.
- GPS, radar real e captura automatica por proximidade seguem fora desta etapa.
- Limpeza server-side de salas expiradas ainda nao foi implementada.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- A camada atual de sala/realtime/rodada sem GPS ficou funcional para continuar a partir dela.
- Antes da proxima grande camada, manter apenas revisao, documentacao e regressao curta quando houver ajuste.
