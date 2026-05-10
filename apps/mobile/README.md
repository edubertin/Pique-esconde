# Pique Esconde Mobile

Expo/React Native prototype for the Pique Esconde MVP.

## Running

From this folder:

```bash
npm install
npm run web:local
```

The recommended local web URL is printed by Expo, normally:

```txt
http://localhost:8086
```

`web:local` starts Expo Web on a fixed port and clears the Metro cache. Use it when developing the web version locally so old dev-server state does not keep serving stale routes.

For Expo Go:

```bash
npm start
```

Then scan the QR code with Expo Go.

## Local Web Troubleshooting

If the browser shows `Unmatched Route` at `http://localhost:8086`, the app route is usually not missing. Most of the time the browser is connected to an old Expo server or stale cache.

1. Stop the running Expo server with `Ctrl+C`.
2. Close old `localhost:8086` tabs.
3. Start again with `npm run web:local`.
4. Hard refresh the browser.

For a production-like static web check:

```bash
npm run build:web
npx serve dist
```

## Current Prototype

The current version is a playable web/mobile prototype with Supabase-backed room flow, invite links, QR sharing, legal pages and GPS/radar gameplay screens:

- Home
- Create room
- Join room
- Location permission
- Lobby
- Rules
- Hide phase
- Seeker radar
- Hider status
- Capture
- Result
- Social card
- Legal pages

## Current Design Direction

- Clean home menu with logo, aligned actions and short specs.
- Arcade-style buttons with strong borders and large tap targets.
- Reusable cards/panels with responsive max width.
- Badges for player and game status.
- Store cover banner at the top of the lobby.
- Radar component as the main gameplay visual.
- Minimal copy during gameplay screens.

## Structure

```txt
app/          Expo Router screens
src/
  assets/     Project assets
  components/ Shared prototype components
  constants/  Mock data and rules
  features/   Future feature modules
  services/   Future backend/realtime/location adapters
  theme/      Visual tokens
  types/      Shared TypeScript types
```
