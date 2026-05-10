# ADR-007 - Atomic Room Snapshot

## Status

Accepted.

## Context

The mobile client rebuilt room state with separate reads for room, players, latest game session and exit notices. During fast transitions, such as finished result, rematch, cron tick or delayed Realtime, those reads could observe slightly different moments of the database.

That made a transient mixed state possible, for example `room.phase = lobby` while one player still appeared as `Escondido` in the client snapshot.

## Decision

Add `pe_get_room_snapshot(target_room_id, actor_player_id, player_session_token)` as the single read path for the room store.

The RPC returns:

- `room`
- `players`
- `gameSession`
- `activePlayer`
- `activePlayerExitReason`
- `activePlayerToken`

When the room is back in `lobby`, the returned player statuses are defensively normalized for lobby display:

- leader becomes `Entrou`;
- `Alvo DEV` stays `Preparado`;
- other non-leaders become `Aguardando`.

The normalization is a presentation guard in the snapshot response. The canonical backend transitions still happen through round, rematch and maintenance functions.

## Consequences

Positive:

- The app reads one coherent snapshot instead of assembling one from parallel queries.
- Result/rematch/lobby transitions are less likely to flicker with stale player tags.
- The snapshot does not expose raw GPS fields.
- Realtime remains useful as a trigger to refresh, while the RPC is the source of truth for current screen state.

Care:

- New fields needed by lobby/result must be added to the RPC contract.
- The client should keep clearing stale global errors when entering terminal or lobby phases.
