# Apps

Applications for the Pique Esconde project.

## Mobile

The mobile app lives in [`mobile`](mobile/).

Current status:

- Expo Router app with TypeScript strict mode.
- Navigable MVP flow for web and mobile.
- Supabase-backed temporary rooms, lobby realtime and atomic room snapshots.
- Real round flow: ready gate, hiding phase, seeking phase, capture, result and rematch.
- GPS/radar foundation implemented with temporary location, derived hints and backend capture validation.
- Web static export for Vercel and native build profiles for EAS.

The project is in MVP technical stabilization / Phase 0. The main remaining gate is field validation on real phones, especially GPS, radar, capture, invite/QR/share, session restore and rematch.
