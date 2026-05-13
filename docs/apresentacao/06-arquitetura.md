# 06 - Arquitetura

## Visão Técnica

O MVP será construído como um app mobile-first usando Expo e React Native, com suporte web para acelerar prototipação e validação visual. A experiência principal deve ser testada cedo em celular real, porque GPS, radar, vibração, som e permissões são parte central do jogo.

Decisão inicial:

```txt
App: Expo + React Native + Expo Router
Realtime: Supabase Realtime
Banco: Supabase Postgres
Autenticação: sessão temporária por sala no MVP
Localização: expo-location
Feedback: som, vibração/haptics e animações
```

Essa escolha favorece velocidade de MVP, familiaridade técnica e capacidade de evoluir para iOS, Android e web com uma base compartilhada.

Status atual em 2026-05-09:

- App Expo e fluxo navegável já existem em `apps/mobile`.
- Supabase já está conectado para salas temporárias, jogadores, lobby realtime e sessões de rodada.
- A camada real de sala usa RPCs e Realtime do Supabase, sem login completo.
- A camada real de rodada já cobre início, esconder, busca, captura simulada, resultado, rematch e regras de saída durante partida.
- GPS, radar por distância derivada e captura automática por proximidade já existem como base funcional, ainda em calibração para celular real.

## Aplicações

### App Mobile

Aplicação principal do produto.

Responsabilidades:

- Criar sala.
- Entrar por link/código.
- Escolher apelido e avatar.
- Exibir lobby.
- Configurar regras.
- Rodar fluxo de esconder/procurar.
- Capturar localização durante a partida.
- Mostrar radar/proximidade.
- Dar feedback com som, vibração e animações.

Tecnologia:

- Expo.
- React Native.
- Expo Router.
- TypeScript.

### Web

No MVP, a web pode ajudar na prototipação e em alguns testes de fluxo, mas não deve ser considerada validação completa do jogo.

Uso recomendado:

- Validar telas.
- Testar lobby.
- Testar entrada por link.
- Testar estados da partida.

Limitação:

- A experiência real de GPS, radar, movimento, vibração e permissões precisa ser validada em celular.

## Backend

Para o MVP, o backend pode começar com Supabase para reduzir tempo de implementação.

Responsabilidades:

- Salas temporárias.
- Jogadores da sala.
- Estado da partida.
- Eventos realtime.
- Status dos jogadores.
- Dados temporários de localização durante a partida.
- Resultado da partida.

Status implementado:

- `pe_rooms`: sala temporária, código, fase, resultado, expiração e motivo de retorno ao lobby.
- `pe_players`: jogadores da sala, apelido, avatar, líder/procurador, status e sessão temporária.
- `pe_game_sessions`: rodada ativa, procurador, status, tempos configurados e resultado.
- RPCs de sala/lobby: criar sala, entrar, sair, remover, promover líder, pronto e adicionar jogador demo.
- RPCs de rodada: iniciar, marcar escondido, liberar procurador, simular captura, finalizar e jogar novamente.
- Publicação realtime para salas, jogadores e sessões de partida.

Camada importante:

O app deve conversar com uma camada interna de serviços, como `game-service`, `room-service` e `location-service`, em vez de espalhar chamadas diretas ao Supabase por todas as telas. Assim, se no futuro for necessário migrar para Socket.IO ou um backend próprio de jogo, a troca fica mais controlada.

## Banco de Dados

Banco inicial: Supabase Postgres.

Entidades prováveis:

- `pe_rooms`: salas temporárias.
- `pe_players`: jogadores dentro da sala.
- `pe_game_sessions`: partidas/rodadas.
- `game_events`: eventos importantes da partida.
- `location_snapshots`: posições temporárias durante jogo, se necessário.

Princípio:

Não guardar histórico permanente de rota. Localização deve ser temporária e ligada à partida ativa.

## Autenticação

No MVP, evitar login completo.

Modelo inicial:

- Jogador entra com apelido.
- Jogador escolhe avatar pré-pronto.
- Sala gera um código/link.
- Sessão local identifica aquele jogador naquela sala.

Login com conta, perfil, histórico e ranking ficam fora do MVP.

## Integrações

- `expo-location` para localização, atualização de posição e direção/heading.
- Supabase Realtime para presença, estado da sala e eventos da partida.
- Compartilhamento nativo do celular para convite por link.
- Haptics/vibração para radar e captura.
- Áudio para sinais de proximidade e captura.
- Deep links para abrir sala diretamente pelo convite.

## Infraestrutura

MVP:

- Supabase para banco e realtime.
- Expo/EAS para builds mobile quando necessário.
- Deploy web do Expo quando fizer sentido para protótipo.

Ambientes:

- Desenvolvimento.
- Preview/teste.
- Produção.

Variáveis esperadas:

- URL do Supabase.
- Chave pública do Supabase.
- Configurações de deep link.

## Decisões Técnicas

### Decisão 1: Expo como base do app

Escolha: usar Expo + React Native.

Motivos:

- Permite iOS, Android e web com uma base compartilhada.
- Acelera desenvolvimento do MVP.
- Tem suporte a localização, navegação, deep links, áudio e feedback nativo.
- O time já tem familiaridade com Expo/React Native.

### Decisão 2: Supabase como realtime e banco inicial

Escolha: usar Supabase Realtime + Postgres no MVP.

Motivos:

- Reduz necessidade de backend próprio no início.
- Oferece banco relacional e realtime no mesmo ecossistema.
- Serve bem para validar lobby, presença, estados da sala e eventos.
- Permite evoluir com mais controle do que uma solução puramente NoSQL.

Risco:

- Se o jogo exigir baixa latência, muita escala ou lógica de captura muito controlada no servidor, pode ser necessário migrar a camada realtime para Socket.IO ou backend próprio.

Mitigação:

- Manter uma camada de serviço no app para não acoplar as telas diretamente ao Supabase.

### Decisão 3: Sem login completo no MVP

Escolha: sessão temporária por sala.

Motivos:

- Menos fricção para jogar.
- Menos coleta de dados.
- Mais alinhado com a proposta de sala temporária e jogo ocasional.

### Decisão 4: Localização temporária e privada

Escolha: localização usada apenas durante a partida.

Motivos:

- A localização é mecânica de jogo, não produto de monitoramento.
- O procurador recebe pistas/radar, não mapa exato dos escondidos.
- Ao terminar a partida, o compartilhamento deve parar.
- Cards sociais não devem conter GPS, mapa real, rota, endereço ou coordenadas.

## Atualizacao 2026-05-09 - Base GPS/Radar

A camada de sala e rodada ja esta apoiada em Supabase Realtime e RPCs. A base inicial de GPS/radar tambem foi implementada, mas ainda entra como camada em calibracao para testes reais.

Estado atual:

- Permissao de localizacao separada da entrada na sala.
- Lobby bloqueia `Preparado` e `Iniciar partida` quando o jogador ainda nao liberou localizacao.
- Escondido so consegue confirmar esconderijo quando ha leitura recente de GPS.
- App envia posicao temporaria durante a partida, com throttle para evitar excesso de escrita/realtime.
- Supabase guarda dados temporarios de localizacao e calcula derivados de jogo, sem expor coordenadas cruas para o procurador.
- Radar do procurador recebe distancia aproximada, direcao, faixa quente/morno/frio e confianca.
- Captura por proximidade ja existe como base, com confirmacao por tempo.
- Ha ferramentas DEV para o lider simular distancia e inspecionar snapshot tecnico sem vazar latitude/longitude.
- Teste mobile web exige origem segura HTTPS; localhost/IP local em celular nao e suficiente para GPS real.

Decisao de arquitetura:

- Para o MVP, o Supabase continua sendo a fonte de verdade da sala, da rodada e dos eventos de GPS derivados.
- O app pode simular GPS apenas em DEV para teste logico.
- Validacao real de sensor deve acontecer em celular fisico via HTTPS/tunnel ou build nativo.

Riscos ainda abertos:

- Radar/direcao precisam de calibracao em campo.
- Navegador desktop nao e fonte confiavel para GPS real.
- Captura automatica precisa de mais testes com dois ou mais celulares reais.

## Atualizacao 2026-05-09 - Contrato de Resultado

Estado atual:

- O Resultado e tratado no app como tela terminal da rodada.
- O cliente congela um snapshot final quando recebe `room.phase = finished` com `room.result`.
- O guard de rotas evita que snapshots realtime atrasados tirem o jogador de `/result` ou `/social-card`.
- Refreshes concorrentes do realtime sao descartados quando uma resposta antiga chega depois de uma mais nova.

Contrato desejado para a proxima etapa:

- Mutacoes que encerram rodada devem retornar um snapshot autoritativo da sala junto com a resposta da RPC.
- `pe_finish_round`, `pe_try_capture_nearest` e caminhos de timeout/tick devem gravar e retornar o mesmo resultado final quando a rodada ja estiver encerrada.
- O payload de `result` deve incluir `gameSessionId` e `finishedAt`.
- O Realtime deve continuar sincronizando outros clientes, mas o cliente que encerrou a rodada nao deve depender do proximo evento realtime para preencher a tela de Resultado.
