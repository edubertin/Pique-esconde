# Pique Esconde

Pique Esconde is a mobile-first MVP for a physical-digital hide-and-seek game. The app uses temporary rooms, realtime state, GPS-based proximity, sound and haptics to bring groups back into the physical world using the phone as a playful tool.

## Product Thesis

The problem is not the lack of a new game. Hide-and-seek is already familiar across generations. The problem is that the physical world has been abandoned by digital habits.

Pique Esconde uses digital interaction to improve physical play: create a room, invite friends, hide, run, search with radar, and play again.

## MVP Scope

Core MVP features:

- Temporary rooms with invite link and code.
- 2 to 8 players per room.
- Simple nickname and prebuilt avatar selection.
- Creator starts as the first seeker.
- Manual seeker selection for new rounds.
- Lobby with player statuses.
- Configurable match duration.
- Default timing: 60 seconds to hide and 3 minutes to seek.
- GPS permission required for active players.
- Radar/proximity experience without exact map visibility.
- Automatic capture by proximity.
- Rush final with increased radar range.
- Same-room rematch flow.
- Social result card without GPS, map, route, address or coordinates.

## Technical Direction

Initial stack decisions:

- App: Expo, React Native, Expo Router and TypeScript.
- Realtime: Supabase Realtime.
- Database: Supabase Postgres.
- Auth: temporary room session for MVP, no full account required.
- Location: `expo-location`.
- Feedback: sound, haptics/vibration and animation.

## Privacy Position

Location is a temporary game mechanic, not a monitoring product.

The MVP should:

- Use location only during active matches.
- Avoid showing exact maps of hidden players.
- Avoid storing permanent route history.
- Stop location usage when a match ends.
- Never include GPS, real maps, routes, addresses or coordinates in social cards.
- Keep only short-lived technical events for debugging and anonymous aggregate metrics.

## Documentation

The project is currently in product/specification phase.

- [Mobile App](apps/mobile/README.md)
- [Presentation](docs/apresentacao/README.md)
- [Specs](docs/specs/README.md)
- [Data Model](docs/technical/data-model.md)
- [Realtime Events](docs/technical/realtime-events.md)
- [Architecture Decisions](docs/technical/decisions/README.md)
- [Visual References](docs/design/referencias-visuais.md)
- [Wireframes](docs/design/wireframes.md)
- [Game UI Design Report](docs/design/game-ui-design-report.md)
- [Agents](docs/agents/README.md)

## Current Status

The MVP is now in implementation.

Done:

- Expo app scaffold with navigable game flow.
- Polished prototype UI for home, room creation, lobby, hiding, seeking, capture, result and social card.
- Supabase project connected through local environment variables.
- Realtime temporary rooms with room code, player list, ready state, leader promotion and leader removal.
- Real game session layer without GPS yet: start round, hide phase, seek phase, simulated capture, result and rematch.
- Match-exit rules in Supabase:
  - if a regular hider leaves and at least 2 players remain, the match continues;
  - if the seeker leaves, the round returns to lobby and a new leader is promoted;
  - if fewer than 2 players remain, the round returns to lobby with a warning.
- QA reports and a Playwright web smoke test for the room flow.

Next implementation slice:

- Real match timer stored/synchronized by the backend.
- Then GPS/location permission, temporary position updates, approximate radar and proximity capture.
