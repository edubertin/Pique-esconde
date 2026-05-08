# Pique Esconde Mobile

Expo/React Native prototype for the Pique Esconde MVP.

## Running

From this folder:

```bash
npm install
npm run web
```

For Expo Go:

```bash
npm start
```

Then scan the QR code with Expo Go.

## Current Prototype

The first version is a navigable prototype with mocked state and the initial Arcade Card UI direction:

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

No Supabase, realtime or GPS is wired yet. Those will be added after the flow is validated.

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
