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

## L-001 - GPS real ainda não implementado

Status: Aceito no MVP atual
Severidade: Alta
Area: Localizacao
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- O prototipo ainda nao solicita nem usa GPS real.

Impacto:
- Radar, captura automatica e permissao de localizacao ainda sao fluxos visuais/simulados.

Decisao:
- Implementar estado de sala antes de conectar GPS real.

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

Status: Aceito no MVP atual
Severidade: Media
Area: Timer/Regras
Detectado em: 2026-05-09
Commit/versao: e7accf0

Descricao:
- O timer real de rodada existe no Supabase, mas a transição é acordada por chamada do app para `pe_tick_game_session`.
- Ainda não há job server-side/agendado garantindo transição sem nenhum cliente ativo.

Impacto:
- Em testes normais com jogadores na sala, o timer funciona.
- Se todos os clientes travarem ou fecharem exatamente durante uma fase, a transição pode aguardar o próximo cliente ativo.

Decisao:
- Aceito para o MVP atual.
- Reavaliar com rotina agendada, Edge Function ou outra estratégia server-side antes de piloto/producao.

Link para test run:
- `docs/qa/test-runs/2026-05-09-round-timers-web.md`
- `docs/qa/test-runs/2026-05-09-room-round-polish-manual-web.md`

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

Status: Aberto
Severidade: Alta
Area: Gameplay / GPS

Descricao:
- A base do radar existe, mas direcao, instabilidade proposital, quente/morno/frio e captura automatica ainda precisam de teste fisico.
- O comportamento em web desktop pode parecer estranho por falta de sensor real.

Impacto:
- Pode haver falso positivo, falso negativo ou leitura visual confusa.

Decisao:
- Rodar QA pesado com pelo menos dois celulares reais antes de seguir para novas features grandes.

## L-009 - Resultado final ainda depende de confirmacao realtime para preencher instantaneamente

Status: Aberto / Proxima atualizacao
Severidade: Media
Area: Resultado / Backend / Realtime
Detectado em: 2026-05-09
Commit/versao: worktree local

Descricao:
- O Resultado foi estabilizado no cliente com snapshot terminal congelado, evitando piscadas e regressao de rota.
- Ainda existe uma janela em que a tela pode entrar antes do payload final estar preenchido, aguardando o snapshot do Supabase Realtime confirmar `room.result`.
- A experiencia ideal de game e a tela de Resultado abrir ja com vencedor, destaque e estatisticas prontos.

Impacto:
- UX pode parecer lenta no encerramento da rodada, mesmo sem bug de navegacao.
- Em rede ruim, o jogador pode ver estado de fechamento por alguns segundos antes do resultado completo.

Comportamento esperado:
- A RPC que encerra a rodada deve gravar e retornar o snapshot final completo no mesmo contrato da acao.
- O app deve aplicar esse snapshot imediatamente no store, usando o Realtime posterior apenas como confirmacao.

Decisao:
- Proxima atualizacao tecnica: evoluir backend/RPCs de finalizacao para retornar resultado completo e idempotente.
- Incluir `gameSessionId` e `finishedAt` no payload de `result` para blindar rematch, card social e snapshots atrasados.
- Manter o loading contextual de Resultado como fallback, nao como solucao principal.

Link para test run:
- `docs/qa/test-runs/2026-05-09-result-route-guard-web.md`
