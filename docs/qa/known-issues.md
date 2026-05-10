# Known Issues and Risks

Registro de bugs conhecidos, riscos aceitos e limitacoes do MVP.

## Como Registrar

```md
## KI-000 - Titulo curto

Status: Aberto | Em analise | Aceito no MVP | Resolvido
Severidade: Alta | Media | Baixa
Area:
Detectado em:
Commit/versao:

Descricao:
- 

Impacto:
- 

Passos para reproduzir:
1. 
2. 
3. 

Comportamento esperado:
- 

Comportamento atual:
- 

Decisao:
- 

Link para test run:
- 
```

## Bugs Conhecidos

## KI-001 - Navegacao de resultado duplicada entre botao, tela e estado

Status: Resolvido em QA web
Severidade: Alta
Area: Navegacao / Estado / Realtime
Detectado em: 2026-05-09
Commit/versao: worktree local

Descricao:
- O fluxo `Resultado -> Jogar novamente -> Lobby` e `Resultado -> Sair -> Home` apresentou piscadas, voltas temporarias para `Resultado` e telas intermediarias.
- A causa provavel e duplicidade de responsabilidade: botao com `href`, handlers com `router.replace`, effects por fase e reset otimista no `room-store` competindo com o snapshot real do Supabase.

Impacto:
- UX instavel no fim da partida.
- Risco de regressao diferente entre Expo Web e mobile nativo.
- Dificulta garantir que `pe_rematch` e `pe_leave_room` sejam a fonte de verdade.

Passos para reproduzir:
1. Criar sala em ambiente DEV GPS.
2. Iniciar partida, capturar alvo e chegar em Resultado.
3. Clicar `Jogar novamente` ou `Sair`.
4. Observar se a tela pisca ou volta para resultado antes do destino final.

Comportamento esperado:
- `Jogar novamente` executa uma unica acao de rematch e o snapshot com `phase=lobby` leva ao lobby.
- `Sair` executa uma unica acao de saida e o app volta para Home.
- Botao visual, link de navegacao e mutacao de estado nao devem estar misturados.

Comportamento atual:
- Corrigido em QA web: botao visual foi separado de link, rematch deixou de fazer reset otimista estrutural e a navegacao por fase passou a ter guard central.

Decisao:
- Tratar como bug arquitetural antes de novas features de gameplay.
- Supabase/RPC/snapshot deve ser a fonte de verdade das transicoes de sala.

Link para test run:
- `docs/qa/test-runs/2026-05-09-result-route-guard-web.md`

## Limitações Aceitas Nesta Fase

## L-001 - GPS real base implementada, em calibracao

Status: Resolvido parcialmente / Em calibracao
Severidade: Alta
Area: Localizacao
Detectado em: 2026-05-08
Commit/versao: base original 8bec69f; atualizado em 2026-05-10

Descricao:
- O prototipo original ainda nao solicitava nem usava GPS real.
- A base atual ja solicita permissao, envia localizacao temporaria, usa radar derivado e valida captura por proximidade.

Impacto:
- O risco deixou de ser "nao existe GPS" e passou a ser calibracao em celular real.

Decisao:
- Manter este item como historico resolvido parcialmente.
- Acompanhar calibracao em `L-008`.

Link para test run:
- `docs/qa/test-runs/2026-05-08-privacidade-compartilhamento.md`

## L-002 - Realtime real ainda não implementado

Status: Resolvido
Severidade: Alta
Area: Realtime
Detectado em: 2026-05-08
Commit/versao: resolvido em 556e944

Descricao:
- Lobby, jogadores, status e eventos usavam dados mockados.

Impacto:
- Resolvido para sala, lobby e rodada sem GPS com Supabase Realtime.

Decisao:
- Manter como resolvido para sala/lobby/rodada. GPS/radar real seguem em limitacoes separadas.

Link para test run:
- `docs/qa/test-runs/2026-05-09-supabase-room-realtime-web.md`
- `docs/qa/test-runs/2026-05-09-game-session-real-web.md`
- `docs/qa/test-runs/2026-05-09-leave-match-realtime-web.md`

## L-003 - Promover líder pelo lobby ainda não é realtime

Status: Resolvido
Severidade: Media
Area: Lobby
Detectado em: 2026-05-08
Commit/versao: resolvido em ce8496d

Descricao:
- A regra de promover outro jogador como lider/procurador existia no estado local/mock, mas ainda nao estava conectada ao realtime.

Impacto:
- Resolvido no lobby realtime via RPC `pe_promote_leader`.

Decisao:
- Manter regra manual no lobby para o MVP.

Link para test run:
- `docs/qa/test-runs/2026-05-09-supabase-room-realtime-web.md`

## L-004 - Expiração em 6 minutos ainda não é backend

Status: Parcialmente resolvido no backend
Severidade: Media
Area: Sala
Detectado em: 2026-05-08
Commit/versao: 556e944

Descricao:
- A sala grava `expires_at` no Supabase quando resta apenas 1 jogador, mas ainda nao ha job/rotina de limpeza server-side apagando salas expiradas automaticamente.

Impacto:
- O app consegue interpretar expiração durante uso, mas salas antigas podem permanecer no banco ate uma limpeza futura.

Decisao:
- Criar limpeza agendada ou rotina segura antes de piloto/producao.

Link para test run:
- `docs/qa/test-runs/2026-05-09-leave-match-realtime-web.md`

## L-005 - Botão Convidar ainda não abre compartilhamento nativo

Status: Aceito no MVP atual
Severidade: Media
Area: Convite
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- O lobby usa o termo `Convidar`, mas por enquanto adiciona amigos demo no Supabase para teste. Ainda nao abre share nativo nem gera link real/deep link.

Impacto:
- O codigo real da sala permite entrada manual em outro aparelho, mas o botao ainda nao aciona compartilhamento nativo.

Decisao:
- Implementar share nativo e deep link na etapa de convite.

Link para test run:
- `docs/qa/test-runs/2026-05-09-supabase-room-realtime-web.md`

## L-006 - Tick de timer depende de cliente ativo

Status: Resolvido no backend dev
Severidade: Media
Area: Timer/Regras
Detectado em: 2026-05-09
Commit/versao: e7accf0; migrations `202605100001_server_side_maintenance_tick`, `202605100002_schedule_maintenance_cron`

Descricao:
- O timer real de rodada existe no Supabase, mas a transição é acordada por chamada do app para `pe_tick_game_session`.
- Agora existe `pe_run_maintenance_tick`, uma entrada server-side/manual/cron-safe para acordar timers, aplicar regras de GPS e limpar estado expirado sem token de jogador.
- O Supabase Cron dev chama a rotina a cada 1 minuto pelo job `pe-maintenance-tick-every-minute`.

Impacto:
- Em testes normais com jogadores na sala, o timer funciona.
- Com a RPC de manutencao, o backend ja consegue executar a transicao sem cliente ativo quando chamado por SQL/cron.
- A garantia automatica existe no ambiente dev. Para producao/piloto, confirmar que a migration de cron foi aplicada e que o job esta ativo.

Decisao:
- Manter `pe_run_maintenance_tick` sem grant para `anon`.
- Manter `pe_run_maintenance_tick` sem grant para `anon`.
- Monitorar `cron.job_run_details` antes e durante piloto.
- Usar chamadas manuais da RPC apenas para QA e debug.

Link para test run:
- `docs/qa/test-runs/2026-05-09-round-timers-web.md`
- `docs/qa/test-runs/2026-05-09-room-round-polish-manual-web.md`
- `docs/qa/test-runs/2026-05-10-server-side-maintenance-tick.md`

## Riscos do MVP

## R-001 - GPS pode oscilar em ambiente fechado

Status: Aceito no MVP
Severidade: Alta
Area: Localizacao

Descricao:
- GPS e sensores do celular podem ter baixa precisao em ambiente fechado, predios, garagens ou locais com sinal ruim.

Impacto:
- Radar pode indicar direcao ou distancia instavel.
- Captura automatica pode ter falso positivo ou falso negativo.

Decisao:
- O MVP deve recomendar ambiente aberto ou misto.
- O app nao deve prometer funcionamento perfeito em ambiente fechado.

## R-002 - Realtime pode sofrer atraso em rede ruim

Status: Aberto
Severidade: Media
Area: Realtime

Descricao:
- Internet ruim pode atrasar atualizacoes de status, localizacao e captura.

Impacto:
- Lobby pode demorar para atualizar.
- Procurador pode receber sinal atrasado.
- Resultado pode aparecer com atraso entre aparelhos.

Decisao:
- Validar no piloto com celulares reais antes de ajustar arquitetura.

## R-003 - Captura automatica precisa evitar falso positivo

Status: Aberto
Severidade: Alta
Area: Captura

Descricao:
- Captura por proximidade pode disparar cedo demais se uma leitura de GPS vier imprecisa.

Impacto:
- Jogador pode ser capturado sem o procurador estar realmente perto.

Decisao:
- Usar confirmacao por tempo ou leituras consecutivas no MVP.

## R-004 - Card social nao pode vazar localizacao

Status: Aberto
Severidade: Alta
Area: Privacidade

Descricao:
- Card social ajuda divulgacao, mas nao pode expor coordenadas, mapa, rota, endereco ou local real da partida.

Impacto:
- Risco de privacidade e perda de confianca.

Decisao:
- Card deve conter somente logo, placar simples, texto promocional e possivelmente QR code/link da loja no futuro.

## Atualizacao 2026-05-09 - L-001 GPS real

Status: Resolvido parcialmente / Em calibracao
Severidade: Alta
Area: Localizacao

Resumo:
- A base de GPS real foi implementada: permissao, leitura inicial, envio temporario, esconderijo com GPS recente, radar derivado e captura por proximidade.
- Ainda nao esta pronto para piloto sem calibracao em celulares reais.
- Navegador desktop e dois browsers no mesmo PC nao representam bem o comportamento final.

Decisao:
- Usar web/DEV para fluxo logico.
- Usar HTTPS tunnel ou build nativo para validar GPS em celular.

## L-007 - GPS mobile web exige origem segura

Status: Aceito no MVP de desenvolvimento
Severidade: Alta
Area: Localizacao / Web

Descricao:
- Celular nao libera GPS confiavelmente em `localhost` do PC, IP local HTTP ou origem considerada insegura.
- O teste mobile web deve usar HTTPS, como tunnel ou deploy.

Impacto:
- Testes com celular podem falhar antes mesmo da logica do app se a origem nao for segura.

Decisao:
- Para teste rapido, usar tunnel HTTPS.
- Para piloto, preferir build nativo ou deploy HTTPS estavel.

## L-008 - Radar e captura ainda precisam calibracao em campo

Status: Aberto / Proxima prioridade
Severidade: Alta
Area: Gameplay / GPS

Descricao:
- A base do radar existe, mas direcao, instabilidade proposital, quente/morno/frio e captura automatica ainda precisam de teste fisico.
- O comportamento em web desktop pode parecer estranho por falta de sensor real.
- A captura oficial esta calibrada no backend como 5m por 2s, mas ainda precisa prova em campo.

Impacto:
- Pode haver falso positivo, falso negativo ou leitura visual confusa.

Decisao:
- Rodar QA pesado com pelo menos dois celulares reais antes de seguir para novas features grandes.

## Atualizacao 2026-05-10 - Estado Geral de Riscos

Status:
- Fluxo principal e modo DEV estao funcionando.
- GPS/radar/captura existem no backend e no app, mas seguem em calibracao para piloto.
- Resultado final foi estabilizado com snapshot congelado e navegacao terminal.

Riscos que continuam relevantes:
- GPS em ambiente fechado ou com sinal ruim.
- Captura automatica em movimento real.
- Timer/limpeza sem cliente ativo, que ainda pede rotina server-side antes de producao.
- Convite/share nativo, ainda pendente para reduzir atrito de entrada.

Decisao:
- A proxima etapa deve ser QA em celular real e calibracao, antes de abrir novas features grandes.

## L-009 - Resultado final ainda depende de confirmacao realtime para preencher instantaneamente

Status: Resolvido em backend dev
Severidade: Media
Area: Resultado / Backend / Realtime
Detectado em: 2026-05-09
Commit/versao: worktree local / migration `202605090027_final_snapshot_capture_cleanup`

Descricao:
- O Resultado foi estabilizado no cliente com snapshot terminal congelado, evitando piscadas e regressao de rota.
- O backend dev agora retorna o snapshot final completo nas RPCs terminais, sem depender do Supabase Realtime para preencher vencedor/estatisticas.
- O snapshot inclui `result`, `players`, `gameSessionId`, `finishedAt`, `roomCode` e `expiresAt`.

Impacto:
- Reduz janela de Resultado vazio/lento.
- Mantem Resultado e Card Social estaveis mesmo com eventos realtime atrasados.

Comportamento esperado:
- A RPC que encerra a rodada deve gravar e retornar o snapshot final completo no mesmo contrato da acao.
- O app deve aplicar esse snapshot imediatamente no store, usando o Realtime posterior apenas como confirmacao.

Decisao:
- Manter Resultado/Card Social usando snapshot congelado como fonte primaria.
- Manter Realtime posterior apenas como confirmacao.
- Rodar validacao UI em dois clientes e celular real antes de marcar pronto para piloto.
- Manter o loading contextual de Resultado como fallback, nao como solucao principal.

Link para test run:
- `docs/qa/test-runs/2026-05-09-result-route-guard-web.md`
- `docs/qa/test-runs/2026-05-09-final-snapshot-backend.md`

## L-010 - Snapshot de sala podia misturar fases em transicoes rapidas

Status: Resolvido em backend dev
Severidade: Media
Area: Estado / Realtime / Lobby
Detectado em: 2026-05-10
Commit/versao: worktree local / migration `202605100005_atomic_room_snapshot`

Descricao:
- Em transicoes rapidas de resultado, rematch, cron ou Realtime atrasado, o cliente podia montar snapshot com leituras paralelas de momentos diferentes.
- O sintoma observado foi sala ja voltando para `lobby` enquanto o bot DEV ainda aparecia com tag `Escondido`, alem de mensagem antiga de regras na tela de resultado.

Impacto:
- Visualmente poderia afetar bot DEV e jogadores reais, principalmente logo depois de finalizar rodada ou jogar novamente.
- O backend de regras continuava correto, mas a UI podia exibir um estado transitorio incoerente.

Decisao:
- Centralizar leitura em `pe_get_room_snapshot`.
- Normalizar status de lobby na resposta da RPC.
- Limpar erro global antigo ao entrar em `finished`, `lobby` ou apos rematch bem-sucedido.

Link para test run:
- `docs/qa/test-runs/2026-05-10-atomic-room-snapshot.md`
