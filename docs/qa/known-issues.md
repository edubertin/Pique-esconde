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

Nenhum bug conhecido registrado ainda.

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
