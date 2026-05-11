# Data Model

Modelo inicial de dados para o MVP do Pique Esconde.

O objetivo é suportar salas temporárias, jogadores, rodadas, eventos realtime e localização temporária durante partidas.

## Princípios

- Evitar login completo no MVP.
- Usar sessão temporária por sala.
- Não guardar histórico permanente de localização.
- Separar sala de rodada/partida para permitir "jogar novamente".
- Guardar apenas o necessário para operar o jogo e depurar o MVP.

## Entidades

### `rooms`

Representa uma sala temporária.

Campos sugeridos:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | Identificador interno da sala. |
| `code` | text | Código curto para entrada manual. |
| `status` | enum | `waiting`, `hiding`, `seeking`, `finished`, `expired`. |
| `leader_player_id` | uuid | Jogador com controle da sala. |
| `current_seeker_player_id` | uuid | Procurador atual. |
| `max_players` | int | Limite rígido inicial: 8. |
| `created_at` | timestamp | Criação da sala. |
| `updated_at` | timestamp | Última atualização. |
| `expires_at` | timestamp | Expiração por inatividade. |

Notas:

- O limite de 8 jogadores aparece para o usuário.
- Se todos saírem, a sala pode ser encerrada.
- Se todos saírem, expira imediatamente.
- Se restar apenas 1 jogador ativo, expira após 6 minutos sem novos jogadores.

### `players`

Representa um jogador dentro de uma sala.

Campos sugeridos:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | Identificador do jogador na sala. |
| `room_id` | uuid | Sala vinculada. |
| `nickname` | text | Apelido escolhido. |
| `avatar_id` | text | Avatar pré-pronto escolhido. |
| `role` | enum | `leader`, `seeker`, `hider`, `spectator`. |
| `status` | enum | `joined`, `ready`, `hiding`, `hidden`, `seeking`, `captured`, `disconnected`. |
| `location_permission` | boolean | Permissão de localização concedida. |
| `session_token_hash` | text | Identificador local para reconexão, sem login completo. |
| `joined_at` | timestamp | Entrada na sala. |
| `last_seen_at` | timestamp | Última presença/realtime. |

Notas:

- Jogadores podem voltar para a mesma sala após desconexão.
- Quem negar localização não participa como jogador ativo.
- Upload de foto fica fora do MVP.
- Leituras de snapshot podem validar a sessao do jogador, mas o toque em `last_seen_at` deve ser moderado para nao gerar loop de realtime.

### `game_sessions`

Representa uma rodada dentro de uma sala.

Campos sugeridos:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | Identificador da rodada. |
| `room_id` | uuid | Sala vinculada. |
| `seeker_player_id` | uuid | Procurador da rodada. |
| `status` | enum | `setup`, `hiding`, `seeking`, `rush_final`, `finished`. |
| `hide_duration_seconds` | int | Padrão 60, máximo inicial 60. |
| `seek_duration_seconds` | int | Padrão 180. |
| `capture_radius_meters` | numeric | Derivado do ambiente; padrão atual 5m. |
| `capture_confirm_seconds` | numeric | Derivado do ambiente; padrão atual 2s. |
| `environment_preset` | enum | `small`, `medium`, `large`. |
| `started_at` | timestamp | Início da rodada. |
| `seek_started_at` | timestamp | Momento em que procurador foi liberado. |
| `rush_started_at` | timestamp | Início do rush final. |
| `finished_at` | timestamp | Fim da rodada. |
| `winner` | enum | `seeker`, `hiders`, `none`. |
| `highlight_player_id` | uuid | Jogador exibido como destaque do resultado. Procurador se ele vencer; escondido que ficou mais tempo sem ser capturado se os escondidos vencerem. |

### Regras configuraveis de sala

`pe_rooms` guarda a versao editavel das regras enquanto a sala esta no lobby:

- `environment_preset`: `small`, `medium` ou `large`.
- `hide_duration_seconds`: 30, 45 ou 60.
- `seek_duration_seconds`: 120, 180 ou 300.
- `capture_radius_meters`: derivado do ambiente.
- `capture_confirm_seconds`: derivado do ambiente.

Quando a rodada inicia, `pe_start_round` copia esses valores para `pe_game_sessions`. A partir dai, radar, captura, timers e resultado leem a sessao ativa. Isso evita que uma mudanca no lobby altere uma rodada em andamento.

Ao iniciar uma rodada ativa, `pe_start_round` tambem limpa `pe_rooms.expires_at`. A limpeza de salas expiradas deve remover apenas salas em `lobby` ou `finished`, evitando apagar uma partida em `hiding` ou `seeking` por causa de uma expiracao antiga do lobby.

Notas:

- A sala pode ter várias rodadas.
- O grupo pode jogar novamente sem criar nova sala.
- Ao jogar novamente, o grupo volta para o lobby da mesma sala.
- Em modo DEV, o jogador sintetico `Alvo DEV` pode ser auto-confirmado como `Escondido` ao iniciar a rodada e e ignorado pelo enforcement de GPS real. Esse atalho nao se aplica a jogadores reais.

### `game_events`

Registra eventos relevantes da partida por janela curta.

Campos sugeridos:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | Identificador do evento. |
| `room_id` | uuid | Sala vinculada. |
| `game_session_id` | uuid | Rodada vinculada. |
| `player_id` | uuid | Jogador relacionado, quando houver. |
| `type` | enum | Tipo do evento. |
| `payload` | jsonb | Dados mínimos do evento. |
| `created_at` | timestamp | Quando aconteceu. |
| `expires_at` | timestamp | Janela curta de retenção. |

Tipos prováveis:

- `player_joined`
- `player_ready`
- `player_hidden`
- `game_started`
- `seeker_released`
- `player_captured`
- `rush_started`
- `game_finished`
- `leader_changed`
- `player_disconnected`
- `player_reconnected`

Retenção:

- Manter por até 24 horas para debug do MVP.
- Não guardar coordenadas em eventos sociais ou públicos.

### `location_snapshots`

Localização temporária usada durante partida ativa.

Campos sugeridos:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | Identificador do snapshot. |
| `room_id` | uuid | Sala vinculada. |
| `game_session_id` | uuid | Rodada vinculada. |
| `player_id` | uuid | Jogador que enviou posição. |
| `lat` | numeric | Latitude. |
| `lng` | numeric | Longitude. |
| `accuracy_meters` | numeric | Precisão reportada pelo aparelho. |
| `heading_degrees` | numeric | Direção, quando disponível. |
| `speed_mps` | numeric | Velocidade, quando disponível. |
| `captured` | boolean | Se o jogador já foi capturado naquele momento. |
| `created_at` | timestamp | Momento da leitura. |
| `expires_at` | timestamp | Expiração curta. |

Política:

- Usar apenas durante partida ativa.
- Apagar ao fim da partida ou expirar rapidamente.
- Não usar para replay de rota.
- Não expor diretamente ao procurador.

## Enums

### `room_status`

- `waiting`
- `hiding`
- `seeking`
- `finished`
- `expired`

### `player_role`

- `leader`
- `seeker`
- `hider`
- `spectator`

### `player_status`

- `joined`
- `ready`
- `hiding`
- `hidden`
- `seeking`
- `captured`
- `disconnected`

### `game_status`

- `setup`
- `hiding`
- `seeking`
- `rush_final`
- `finished`

### `winner`

- `seeker`
- `hiders`
- `none`

## Regras de Integridade

- Uma sala tem no máximo 8 jogadores ativos.
- Uma sala tem um líder ativo.
- Uma rodada tem um procurador.
- O próximo líder/procurador pode ser promovido pelo lobby.
- Jogador sem permissão de localização não pode ficar como `hider` ou `seeker`, exceto o alvo sintético `Alvo DEV` em fluxo de desenvolvimento.
- Jogador capturado não aparece como alvo ativo do radar.
- Ao finalizar a rodada, localização deixa de ser usada.
- Ao expirar sala em `lobby` ou `finished`, jogadores e estados temporários devem ser encerrados.

## Manutencao Server-Side

O backend possui uma rotina de manutencao para reduzir dependencia de cliente ativo:

- `pe_run_maintenance_tick(target_room_id uuid default null, max_rooms integer default 50)`: entrada para SQL manual ou Supabase Cron.
- `pe_maintenance_tick_room(target_room_id uuid)`: helper interno por sala.
- `pe-maintenance-tick-every-minute`: job Supabase Cron dev que chama a rotina a cada 1 minuto.

A rotina:

- aplica regras de GPS/sinal perdido via `pe_enforce_location_rules`;
- libera o procurador quando o tempo de esconder vence;
- encerra a busca quando o tempo de procurar vence;
- fecha a rodada pelo mesmo caminho terminal usado pelo cliente, `pe_close_round`;
- limpa salas expiradas e dados temporarios via `pe_cleanup_expired_state`;
- preserva salas ativas em `hiding` ou `seeking`, mesmo quando existe `expires_at` antigo;
- retorna apenas dados derivados, sem latitude/longitude.

As funcoes de manutencao nao sao expostas para `anon`; devem ser chamadas por conexao server-side, SQL administrativo ou job agendado.

## Snapshot Atomico de Sala

O app le a sala atual por `pe_get_room_snapshot(target_room_id, actor_player_id, player_session_token)`.

A RPC devolve, em uma unica chamada:

- sala;
- jogadores;
- sessao ativa ou mais recente, quando a sala nao esta no lobby;
- jogador ativo validado por token;
- aviso de saida do jogador ativo, quando existir.

Esse contrato substitui a montagem de snapshot no cliente com leituras paralelas de `pe_rooms`, `pe_players`, `pe_game_sessions` e `pe_player_exit_notices`. A mudanca reduz janelas em que o cliente poderia combinar uma fase nova de sala com jogadores vindos de uma leitura antiga.

Quando a sala esta no lobby, a resposta normaliza status de rodada apenas para exibicao do snapshot: lider aparece como `Entrou`, jogadores reais como `Aguardando` e `Alvo DEV` como `Preparado`. A RPC nao retorna latitude, longitude ou campos brutos de GPS.

## Sessao Local e Reconexao

No PWA, a sessao temporaria da sala e persistida localmente com `roomId`, `roomCode`, `activePlayerId` e `activePlayerToken`. Ao recarregar a pagina, o app tenta restaurar a sessao chamando `pe_get_room_snapshot` antes de redirecionar para a Home.

Se o token ainda for valido, o guard de rota envia o jogador para a tela correta da fase atual. Se o token nao for valido, a sessao local e limpa.

## Métricas Agregadas

Métricas futuras podem ser anônimas/agregadas:

- Salas criadas.
- Rodadas iniciadas.
- Rodadas concluídas.
- Quantidade média de jogadores.
- Duração média.
- Taxa de jogar novamente.

Não incluir:

- Rotas.
- Coordenadas.
- Endereço.
- Identidade real.
