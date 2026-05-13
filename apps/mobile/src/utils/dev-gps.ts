import { Platform } from 'react-native';

export type DevGpsDirection = 'E' | 'N' | 'S' | 'W';

export const devGpsStorageKey = 'pe-dev-gps-v3-active';
export const devGpsDistanceStorageKey = 'pe-dev-gps-v3-distance';
export const devGpsDirectionStorageKey = 'pe-dev-gps-v3-direction';

export function isDevGpsAvailable() {
  return __DEV__ && Platform.OS === 'web';
}

export function isDevGpsEnabled() {
  return isDevGpsAvailable() && typeof window !== 'undefined' && window.sessionStorage.getItem(devGpsStorageKey) === 'true';
}

export function enableDevGps() {
  if (!isDevGpsAvailable() || typeof window === 'undefined') return;
  window.sessionStorage.setItem(devGpsStorageKey, 'true');
}

export function disableDevGps() {
  if (!isDevGpsAvailable() || typeof window === 'undefined') return;

  window.sessionStorage.removeItem(devGpsStorageKey);
  window.sessionStorage.removeItem(devGpsDistanceStorageKey);
  window.sessionStorage.removeItem(devGpsDirectionStorageKey);
}

export function getStoredDevGpsDirection(defaultDirection: DevGpsDirection = 'N'): DevGpsDirection {
  if (!isDevGpsAvailable() || typeof window === 'undefined') return defaultDirection;

  const direction = window.sessionStorage.getItem(devGpsDirectionStorageKey);
  return direction === 'N' || direction === 'S' || direction === 'E' || direction === 'W' ? direction : defaultDirection;
}

export function getStoredDevGpsDistance(defaultDistance = 40) {
  if (!isDevGpsAvailable() || typeof window === 'undefined') return defaultDistance;

  const distance = Number(window.sessionStorage.getItem(devGpsDistanceStorageKey));
  return Number.isFinite(distance) ? distance : defaultDistance;
}

export function setStoredDevGpsScenario(distanceMeters: number, direction: DevGpsDirection) {
  if (!isDevGpsAvailable() || typeof window === 'undefined') return;

  window.sessionStorage.setItem(devGpsStorageKey, 'true');
  window.sessionStorage.setItem(devGpsDistanceStorageKey, String(distanceMeters));
  window.sessionStorage.setItem(devGpsDirectionStorageKey, direction);
}

export function getBearingForDevDirection(direction: DevGpsDirection) {
  if (direction === 'E') return 90;
  if (direction === 'S') return 180;
  if (direction === 'W') return 270;
  return 0;
}
