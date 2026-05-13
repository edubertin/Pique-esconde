# Changelog

All notable changes to Pique Esconde will be documented in this file.

This project follows a simple human-readable changelog format inspired by Keep a Changelog.

## Unreleased

### Added

- Public GitHub documentation structure.
- Repository community documents.
- Basic mobile CI workflow.

### Changed

- GitHub documentation refresh with updated Play Internal Test status and current visual assets.

## 2026-05-12 - 1.0.2

### Changed

- Android app version updated to `1.0.2`.
- Android `versionCode` updated to `5` for Google Play.
- README and release docs now identify the current Play testing status.

### Fixed

- Stabilized the flow after creating a room, allowing GPS, entering the lobby and leaving the room.
- Reduced stale lobby refresh errors around `Room not found` and `Invalid room session` during room exit.

### Verified

- EAS production AAB generated successfully.
- AAB validated with bundletool.
- Google Play installation confirmed in emulator with `installerPackageName=com.android.vending`.
- App opened on Home from the Play-installed build.

## 2026-05-10

### Added

- Legal pages for privacy, terms, support and data deletion.
- Invite link and QR code flow.
- Radar UI polish with animated scan and heading-aware behavior where available.
- Vercel static web export configuration.

### Fixed

- Web export layout issues around first load and static rendering.
- Local web development workflow with fixed port and cache clearing.
