# E6-H3 Exit / Drop / Refresh — QA Test Run

**Date:** 2026-05-11
**Story:** E6-H3 — As a group, I want exit/drop/refresh to not freeze the match.
**Branch:** codex/final-snapshot-cleanup

---

## Audit Findings

### Gap 1 — `signal_lost` roomNotice for GPS-eliminated hiders

**Finding:** Already handled correctly. No fix required.

`applySnapshot` in `room-store.tsx` (line 301) sets:

```
setRoomNotice(leavingRoomRef.current || suppressRemovalNoticeRef.current
  ? undefined
  : snapshot.activePlayerExitReason ?? 'removed');
```

`activePlayerExitReason` from the backend can be `'signal_lost'`, `'not_hidden_in_time'`, or `'left_hide_area'`. When the backend returns `signal_lost`, the store sets `roomNotice = 'signal_lost'`. The home screen renders `home.signalLostTitle` / `home.signalLostBody` for this value. Full path is correct end-to-end.

---

### Gap 2 — Seeker gets a notice when their room drops back to lobby

**Finding:** Voluntary leave is handled. Forced maintenance removal shows a generic notice. No additional client fix is viable.

- When the seeker calls `leaveRoom()`, `leavingRoomRef.current = true` and the code explicitly sets `roomNotice = 'left_match'` before clearing the room. The home screen shows the correct "you left the match" banner.
- When the seeker disconnects and the backend's maintenance tick removes them (network drop scenario), the next snapshot has `activePlayer = null` with `activePlayerExitReason = null` (maintenance removal has no exit reason from the DB). The client falls back to `roomNotice = 'removed'`, showing "The leader removed your entry." This is slightly misleading but is the correct safe-default; fixing it would require a new backend `exit_reason` value for maintenance ejection, which is out of scope for this story.
- Remaining players already see the `closedReason = 'seeker_left'` banner in `lobby.tsx` via the `roomWarning` derived value. RoomRouteGuard correctly redirects them to `/lobby` when `room.phase` returns to `'lobby'`.

---

### Gap 3 — AppState resume refresh missing from `hider-status.tsx`

**Finding:** Confirmed gap. No `AppState` change handler existed anywhere in the codebase.

When a player backgrounds the app during the seeking phase and returns, the Supabase realtime WebSocket may have dropped. Without a refresh on foreground, the screen can remain stale — the phase may have already transitioned (seeker left, round finished) but the hider still sees the old seeking UI instead of being routed to lobby or result.

**Fix:** Added an `AppState` listener in `room-store.tsx` that calls `refreshRoomSoft()` whenever `AppState` transitions to `'active'` while a room is active. This is guarded by `room?.id` so it only fires during an active room session. `RoomRouteGuard` then reacts to the refreshed snapshot and navigates if the phase has changed.

---

### Gap 4 — AppState resume refresh missing from `seeker-radar.tsx`

**Finding:** Confirmed gap. Same root cause as Gap 3.

**Fix:** Covered by the same room-store fix as Gap 3.

---

## Changes Made

### `apps/mobile/src/state/room-store.tsx`

- Added `import { AppState } from 'react-native'` at the top.
- Added a `useEffect` after the realtime subscription effect:

```tsx
useEffect(() => {
  if (!room?.id) return undefined;

  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      refreshRoomSoft();
    }
  });

  return () => {
    subscription.remove();
  };
}, [refreshRoomSoft, room?.id]);
```

This single location covers all in-room screens (hide-phase, hider-status, seeker-radar, capture) without needing per-screen handlers.

---

## Manual Test Checklist

- [ ] Hider is on `hider-status`. Background app for 15s, seeker leaves during that time. Foreground — player is routed to `/lobby`, `closedReason = 'seeker_left'` banner is shown.
- [ ] Seeker is on `seeker-radar`. Background app for 15s, round finishes (time expires) during that time. Foreground — player is routed to `/result`.
- [ ] Player is on `hide-phase`. Background app, GPS signal_lost tick fires. Foreground — player is routed to `/` with `home.signalLostTitle` banner shown.
- [ ] Voluntary exit from `seeker-radar` via the Leave button — routed to `/`, `home.matchEndedTitle` banner shown.
- [ ] No crash or double-subscription when room phase changes mid-subscription cycle.

---

## Verdict

**GO** — Confirmed gap (no AppState refresh) has been fixed in the store layer. Signal_lost and voluntary leave paths were already correct. Seeker forced-removal notice falls back to `'removed'` which is acceptable pending a future backend exit-reason addition.
