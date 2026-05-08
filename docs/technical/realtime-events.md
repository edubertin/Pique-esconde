# Realtime Events

Eventos realtime iniciais para o MVP do Pique Esconde.

O objetivo é sincronizar sala, lobby, rodada, radar e resultado entre celulares com baixa fricção.

## Princípios

- O cliente não deve depender de mapa exato dos outros jogadores.
- Eventos devem ser pequenos e objetivos.
- Localização bruta não deve ser enviada para interfaces que não precisam dela.
- Estado importante deve poder ser reconstruído a partir das tabelas principais.
- Eventos são para sincronização e feedback, não para histórico permanente.

## Canais

### `room:{room_id}`

Canal principal da sala.

Usado para:

- Lobby.
- Status dos jogadores.
- Início de rodada.
- Mudança de líder/procurador.
- Resultado.

### `game:{game_session_id}`

Canal da rodada ativa.

Usado para:

- Fase de esconder.
- Liberação do procurador.
- Capturas.
- Rush final.
- Fim de jogo.

### `player:{player_id}`

Canal privado do jogador, se necessário.

Usado para:

- Feedback individual.
- Mensagens específicas.
- Confirmações de captura.
- Alertas de permissão/reconexão.

## Eventos de Sala

### `room.created`

Emitido quando a sala é criada.

Payload:

```json
{
  "roomId": "uuid",
  "code": "ABCD",
  "leaderPlayerId": "uuid",
  "maxPlayers": 8
}
```

### `player.joined`

Emitido quando um jogador entra.

Payload:

```json
{
  "roomId": "uuid",
  "player": {
    "id": "uuid",
    "nickname": "Ana",
    "avatarId": "avatar_02",
    "status": "joined"
  },
  "playerCount": 4,
  "maxPlayers": 8
}
```

### `player.ready_changed`

Emitido quando jogador marca/desmarca preparado.

Payload:

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "status": "ready"
}
```

### `leader.changed`

Emitido quando liderança muda manualmente ou por queda do líder.

Payload:

```json
{
  "roomId": "uuid",
  "previousLeaderPlayerId": "uuid",
  "newLeaderPlayerId": "uuid",
  "reason": "manual"
}
```

Razões:

- `manual`
- `disconnected`
- `left_room`

### `player.disconnected`

Emitido quando jogador perde presença.

Payload:

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "lastSeenAt": "timestamp"
}
```

### `player.reconnected`

Emitido quando jogador volta para a sala.

Payload:

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "status": "ready"
}
```

## Eventos de Rodada

### `game.started`

Emitido quando o líder inicia a rodada.

Payload:

```json
{
  "roomId": "uuid",
  "gameSessionId": "uuid",
  "seekerPlayerId": "uuid",
  "hideDurationSeconds": 60,
  "seekDurationSeconds": 180,
  "startedAt": "timestamp"
}
```

### `hider.hidden`

Emitido quando escondido marca "estou escondido".

Payload:

```json
{
  "gameSessionId": "uuid",
  "playerId": "uuid",
  "hiddenCount": 3,
  "totalHiders": 4
}
```

### `seeker.released`

Emitido quando procurador é liberado.

Payload:

```json
{
  "gameSessionId": "uuid",
  "seekerPlayerId": "uuid",
  "reason": "all_hidden",
  "seekStartedAt": "timestamp"
}
```

Razões:

- `all_hidden`
- `hide_timer_finished`

### `radar.signal`

Evento para atualizar a experiência do procurador sem revelar localização exata.

Payload:

```json
{
  "gameSessionId": "uuid",
  "seekerPlayerId": "uuid",
  "signal": "warm",
  "confidence": 0.64,
  "direction": "approx_ne",
  "remainingHiders": 3
}
```

Notas:

- Não incluir latitude/longitude.
- Direção é aproximada.
- Ponteiro pode oscilar.
- Sinal deve ficar mais confiante quando estiver perto.

### `player.captured`

Emitido quando a captura automática é confirmada.

Payload:

```json
{
  "gameSessionId": "uuid",
  "capturedPlayerId": "uuid",
  "seekerPlayerId": "uuid",
  "remainingHiders": 2,
  "capturedAt": "timestamp"
}
```

Regra:

- Captura inicial sugerida: dentro de 8m por cerca de 3 segundos.

### `rush.started`

Emitido quando entra o rush final.

Payload:

```json
{
  "gameSessionId": "uuid",
  "startedAt": "timestamp",
  "remainingSeconds": 20,
  "radarBoost": true
}
```

### `game.finished`

Emitido quando a rodada termina.

Payload:

```json
{
  "gameSessionId": "uuid",
  "winner": "hiders",
  "capturedPlayerIds": ["uuid"],
  "survivorPlayerIds": ["uuid"],
  "finishedAt": "timestamp",
  "reason": "time_finished"
}
```

Razões:

- `all_captured`
- `time_finished`
- `leader_ended`

### `game.rematch_requested`

Emitido quando grupo decide jogar novamente.

Payload:

```json
{
  "roomId": "uuid",
  "requestedByPlayerId": "uuid",
  "previousGameSessionId": "uuid"
}
```

### `seeker.selected`

Emitido quando líder escolhe manualmente o próximo procurador.

Payload:

```json
{
  "roomId": "uuid",
  "selectedSeekerPlayerId": "uuid",
  "selectedByPlayerId": "uuid"
}
```

## Eventos de Localização

Localização deve ser tratada com cuidado. O app pode enviar leituras para cálculo de jogo, mas a interface do procurador deve receber apenas sinais derivados.

### `location.updated`

Evento interno ou escrita em tabela temporária.

Payload interno:

```json
{
  "gameSessionId": "uuid",
  "playerId": "uuid",
  "lat": -23.0,
  "lng": -46.0,
  "accuracyMeters": 8,
  "headingDegrees": 120,
  "createdAt": "timestamp"
}
```

Regras:

- Não transmitir esse payload bruto para outros jogadores.
- Usar para calcular distância, radar e captura.
- Expirar/apagar após a partida.

## Estados de Erro

### `location.denied`

Jogador negou localização.

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "canPlayActive": false
}
```

### `room.full`

Sala atingiu limite de 8 jogadores.

```json
{
  "roomId": "uuid",
  "maxPlayers": 8
}
```

### `room.expired`

Sala expirou.

```json
{
  "roomId": "uuid",
  "expiredAt": "timestamp",
  "reason": "inactivity"
}
```

### `connection.unstable`

Aviso local ou realtime para instabilidade.

```json
{
  "playerId": "uuid",
  "lastSeenAt": "timestamp"
}
```

## Retenção

- Eventos de debug: até 24 horas no MVP.
- Localização bruta: apenas durante partida ativa.
- Cards sociais: sem GPS, mapa, rota, endereço ou coordenadas.

