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

The first version is a navigable prototype with mocked state:

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

