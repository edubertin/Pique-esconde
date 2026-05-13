const storageKey = 'pique-esconde:room-session:v1';
const ignoreStoredSessionOnceKey = 'pique-esconde:ignore-stored-session-once:v1';

export type StoredRoomSession = {
  activePlayerId: string;
  activePlayerToken: string;
  roomCode: string;
  roomId: string;
  savedAt: number;
};

function getWebStorage() {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function getWebSessionStorage() {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function clearStoredRoomSession() {
  try {
    getWebStorage()?.removeItem(storageKey);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}

export function ignoreStoredRoomSessionOnce() {
  try {
    getWebSessionStorage()?.setItem(ignoreStoredSessionOnceKey, 'true');
  } catch {
    // Session restore is a convenience; room RPCs remain the source of truth.
  }
}

export function loadStoredRoomSession(): StoredRoomSession | undefined {
  const sessionStorage = getWebSessionStorage();
  if (sessionStorage?.getItem(ignoreStoredSessionOnceKey) === 'true') {
    sessionStorage.removeItem(ignoreStoredSessionOnceKey);
    return undefined;
  }

  const rawSession = getWebStorage()?.getItem(storageKey);
  if (!rawSession) return undefined;

  try {
    const session = JSON.parse(rawSession) as Partial<StoredRoomSession>;
    if (!session.roomId || !session.roomCode || !session.activePlayerId || !session.activePlayerToken) {
      clearStoredRoomSession();
      return undefined;
    }

    return {
      activePlayerId: session.activePlayerId,
      activePlayerToken: session.activePlayerToken,
      roomCode: session.roomCode,
      roomId: session.roomId,
      savedAt: typeof session.savedAt === 'number' ? session.savedAt : Date.now(),
    };
  } catch {
    clearStoredRoomSession();
    return undefined;
  }
}

export function saveStoredRoomSession(session: Omit<StoredRoomSession, 'savedAt'>) {
  try {
    getWebStorage()?.setItem(storageKey, JSON.stringify({ ...session, savedAt: Date.now() }));
  } catch {
    // Session restore is a convenience; room RPCs remain the source of truth.
  }
}
