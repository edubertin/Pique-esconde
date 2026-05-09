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

Status: Aceito no MVP atual
Severidade: Alta
Area: Realtime
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- Lobby, jogadores, status e eventos ainda usam dados mockados.

Impacto:
- Nao e possivel validar multiplos celulares na mesma sala ainda.

Decisao:
- Proxima fase deve criar estado de sala e depois plugar Supabase Realtime.

Link para test run:
- `docs/qa/test-runs/2026-05-08-lobby-rematch-web.md`

## L-003 - Promover líder pelo lobby ainda não é realtime

Status: Parcialmente resolvido localmente
Severidade: Media
Area: Lobby
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- A regra de promover outro jogador como lider/procurador ja existe no estado local/mock, mas ainda nao esta conectada ao realtime.

Impacto:
- O fluxo pode ser validado em um aparelho, mas ainda nao sincroniza entre varios celulares.

Decisao:
- Validar localmente na fase 3.1 e depois conectar ao Supabase Realtime.

Link para test run:
- `docs/qa/test-runs/2026-05-08-lobby-rematch-web.md`

## L-004 - Expiração em 6 minutos ainda não é backend

Status: Parcialmente resolvido localmente
Severidade: Media
Area: Sala
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- A regra de expirar sala apos 6 minutos com apenas 1 jogador ativo existe no estado local/mock, mas ainda nao existe backend para executar quando o app fecha.

Impacto:
- O comportamento local ajuda testes do fluxo, mas nao substitui expiracao server-side.

Decisao:
- Manter local para prototipo e mover para backend/realtime na fase Supabase.

Link para test run:
- `docs/qa/test-runs/2026-05-08-lobby-rematch-web.md`

## L-005 - Botão Convidar ainda não abre compartilhamento nativo

Status: Aceito no MVP atual
Severidade: Media
Area: Convite
Detectado em: 2026-05-08
Commit/versao: 8bec69f

Descricao:
- O lobby usa o termo `Convidar`, mas por enquanto adiciona amigos demo no estado local. Ainda nao abre share nativo nem gera link real.

Impacto:
- Convite local permite testar lobby, limite e promocao de lider, mas ainda nao convida outro aparelho.

Decisao:
- Implementar quando houver criacao real de sala/codigo/link.

Link para test run:
- `docs/qa/test-runs/2026-05-08-fluxo-navegavel-web.md`

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
