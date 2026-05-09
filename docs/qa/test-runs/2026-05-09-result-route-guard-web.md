# Test Run - Result Route Guard Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Regressao tecnica / fluxo web
Ambiente: Expo Web `http://localhost:8083` + Supabase dev + GPS DEV
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar a correcao arquitetural do fluxo `Resultado -> Jogar novamente -> Lobby`.
- Validar a correcao arquitetural do fluxo `Resultado -> Sair -> Home`.
- Confirmar que o resultado nao navega por caminhos duplicados durante rematch/saida.

## Mudanca Testada

- `GameButton` voltou a ser somente botao visual/de acao.
- `GameLinkButton` ficou responsavel por navegacao com `Link` direto em um `Pressable` com `href` real.
- `RoomRouteGuard` passou a centralizar navegacao derivada de `room.phase`.
- `room-store.rematch` deixou de fazer reset otimista estrutural antes da RPC.
- `fetchSnapshot` deixou de expor `gameSession` antiga quando `room.phase === 'lobby'`.
- Snapshots de salas abandonadas passaram a ser ignorados localmente para nao ressuscitar estado antigo depois de `Sair`.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-RG-001 | Passou | Criar sala, usar GPS DEV, iniciar partida, capturar alvo e chegar em Resultado. |
| TC-RG-002 | Passou | `Jogar novamente` manteve Resultado com `Sincronizando...` ate o snapshot remoto voltar `phase=lobby`, depois navegou para `/lobby`. |
| TC-RG-003 | Passou | Durante rematch nao houve volta `lobby -> result -> lobby`; o destino final foi `/lobby`. |
| TC-RG-004 | Passou | `Sair` manteve Resultado ate a sala local ser limpa e depois foi para `/`. |
| TC-RG-005 | Passou | Depois de sair de uma sala anterior, criar outra sala, finalizar rodada e clicar `Sair` no Resultado levou direto para `/` no primeiro snapshot. |
| TC-RG-006 | Passou | Depois de `Sair` para a Home, tocar em `Criar sala` navegou para `/create-room` e exibiu `Criar partida`. |
| TC-RG-007 | Passou | Fluxo completo sem warnings/errors de console no browser. |
| TC-RG-008 | Passou | Regressao da hipotese do link fantasma: apos jogar, sair e clicar `Criar sala`, o app abriu `/create-room` em 3 repeticoes seguidas. |
| TC-RG-009 | Passou | Resultado permaneceu estavel por 6s em `/result`, sem estado `Fechando resultado...` e sem troca de rota. |
| TC-TECH-001 | Passou | `npm run lint`. |
| TC-TECH-002 | Passou | `npx tsc --noEmit`. |

## Evidencias

- Teste automatizado com Playwright em viewport mobile `430x760`.
- `REMATCH_STATES`: `result` com `syncing=true` ate `i=4`; em `i=5`, URL `/lobby`, `result=false`, `lobby=true`.
- `EXIT_STATES`: `result=true` ate a limpeza; depois URL `/`, `home=true`.
- `RESULT_EXIT_AFTER_PREVIOUS_ROOM`: em `i=0`, URL `/`, `result=false`, `home=true`.
- `CREATE_AFTER_EXIT_OK`: URL `/create-room` com formulario `Criar partida` visivel depois de sair do Resultado para a Home.
- `CONSOLE_ISSUES`: lista vazia no teste Playwright final.
- `CREATE_AFTER_EXIT_REPEAT`: `ITER_1_OK`, `ITER_2_OK`, `ITER_3_OK` em `http://localhost:8083/create-room`.
- `RESULT_STABILITY`: 24 amostras em 6s com `path=/result`, `result=true`, `closing=false`.

## Diagnostico da Hipotese do Botao

- Antes do ajuste, o hover mostrava `/create-room` porque o link existia no DOM.
- O clique chegava a chamar `pushState('/create-room')`, mas uma navegacao atrasada de tela antiga empurrava `pushState('/')` logo depois.
- A origem era a duplicacao de redirecionamento entre telas de fase antigas e `RoomRouteGuard`.
- A correcao removeu os redirects locais das telas de fase e fez o guard ignorar pathname web defasado da URL real.

## Diagnostico da Piscada no Resultado

- O resultado agora fica congelado no store como snapshot terminal da rodada.
- Refreshes concorrentes do realtime passam por controle de sequencia para nao aplicar resposta antiga depois de resposta nova.
- O guard aceita `/result` e `/social-card` quando existe snapshot final, mesmo que o estado vivo da sala receba eventos atrasados.
- Proxima melhoria: backend/RPC deve retornar o snapshot final completo no encerramento da rodada para reduzir a espera ate os dados aparecerem.

## Riscos Restantes

- Ainda precisa teste manual em celular real/Expo Go, porque React Native Web nao representa perfeitamente toque nativo.
- O guard central deve ser observado em fluxos auxiliares: regras, permissao, card social e captura.
- Resultado instantaneo ainda nao foi resolvido no backend; o cliente estabiliza a tela, mas pode aguardar o payload final chegar por Realtime.

## Decisao Final

Status: Aprovado para seguir com QA manual.

Resumo:
- O fluxo deixou de tentar navegar por botao, handler e estado otimista ao mesmo tempo.
- A tela agora espera a transicao real do snapshot antes de trocar de fase.
