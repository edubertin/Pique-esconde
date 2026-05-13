const activeSessionPrefix = 'pique-esconde:active-session-tab:v1';
const tabIdKey = 'pique-esconde:tab-id:v1';
const activeSessionTtlMs = 15000;
let memoryTabId: string | undefined;

type ActiveSessionClaim = {
  tabId: string;
  updatedAt: number;
};

function getSessionStorage() {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

function getLocalStorage() {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function createTabId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getActiveSessionKey(roomId: string, activePlayerId: string) {
  return `${activeSessionPrefix}:${roomId}:${activePlayerId}`;
}

function readClaim(key: string): ActiveSessionClaim | undefined {
  const rawClaim = getLocalStorage()?.getItem(key);
  if (!rawClaim) return undefined;

  try {
    const claim = JSON.parse(rawClaim) as Partial<ActiveSessionClaim>;
    if (typeof claim.tabId !== 'string' || typeof claim.updatedAt !== 'number') return undefined;
    return { tabId: claim.tabId, updatedAt: claim.updatedAt };
  } catch {
    return undefined;
  }
}

export function getCurrentTabId() {
  const storage = getSessionStorage();
  const existingTabId = storage?.getItem(tabIdKey);
  if (existingTabId) return existingTabId;
  if (memoryTabId) return memoryTabId;

  const nextTabId = createTabId();
  memoryTabId = nextTabId;

  try {
    storage?.setItem(tabIdKey, nextTabId);
  } catch {
    // sessionStorage can be unavailable in restricted browser modes.
  }

  return nextTabId;
}

export function claimActiveSession(roomId: string, activePlayerId: string) {
  const key = getActiveSessionKey(roomId, activePlayerId);
  const tabId = getCurrentTabId();
  const existingClaim = readClaim(key);
  const now = Date.now();

  if (existingClaim && existingClaim.tabId !== tabId && now - existingClaim.updatedAt < activeSessionTtlMs) {
    return false;
  }

  try {
    getLocalStorage()?.setItem(key, JSON.stringify({ tabId, updatedAt: now }));
  } catch {
    return true;
  }

  return true;
}

export function releaseActiveSessionClaim(roomId: string, activePlayerId: string) {
  const key = getActiveSessionKey(roomId, activePlayerId);
  const claim = readClaim(key);

  if (claim?.tabId === getCurrentTabId()) {
    try {
      getLocalStorage()?.removeItem(key);
    } catch {
      // localStorage can be unavailable in restricted browser modes.
    }
  }
}
