import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useRoom } from '@/src/state/room-store';

type LocationSyncStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';
type LocationSubscriptionLike = {
  remove?: () => void;
  unsubscribe?: () => void;
};

export type PlayerLocationSyncState = {
  error?: string;
  lastUpdateAt?: number;
  status: LocationSyncStatus;
};

function getLocationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : undefined;

  if (message?.toLowerCase().includes('timeout')) {
    return 'GPS demorando para responder. Tente ficar em area aberta.';
  }

  return message || 'Nao foi possivel iniciar o GPS.';
}

export function usePlayerLocationSync(enabled: boolean): PlayerLocationSyncState {
  const { updatePlayerLocation } = useRoom();
  const lastSyncAttemptAtRef = useRef(0);
  const updatePlayerLocationRef = useRef(updatePlayerLocation);
  const [state, setState] = useState<PlayerLocationSyncState>({ status: 'idle' });

  useEffect(() => {
    updatePlayerLocationRef.current = updatePlayerLocation;
  }, [updatePlayerLocation]);

  useEffect(() => {
    let isMounted = true;
    let subscription: LocationSubscriptionLike | undefined;
    let webWatchId: number | undefined;

    const syncCoords = (coords: {
      accuracy?: number | null;
      heading?: number | null;
      latitude: number;
      longitude: number;
      speed?: number | null;
    }) => {
      if (
        Platform.OS === 'web'
        && typeof window !== 'undefined'
        && (
          window.sessionStorage.getItem('pe-dev-gps-v3-active') === 'true'
          || window.sessionStorage.getItem('pe-dev-gps-v2-active') === 'true'
          || window.sessionStorage.getItem('pe-dev-gps-active') === 'true'
        )
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastSyncAttemptAtRef.current < 2500) return;
      lastSyncAttemptAtRef.current = now;

      const { accuracy, heading, latitude, longitude, speed } = coords;

      updatePlayerLocationRef.current({
        accuracyMeters: accuracy ?? undefined,
        headingDegrees: heading ?? undefined,
        lat: latitude,
        lng: longitude,
        speedMetersPerSecond: speed ?? undefined,
      })
        .then(() => {
          if (isMounted) {
            setState({ lastUpdateAt: Date.now(), status: 'active' });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              error: error instanceof Error ? error.message : 'Nao foi possivel sincronizar o GPS.',
              status: 'error',
            });
          }
        });
    };

    async function startLocationSync() {
      if (!enabled) {
        setState({ status: 'idle' });
        return;
      }

      setState({ status: 'requesting' });

      try {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
          webWatchId = navigator.geolocation.watchPosition(
            (position) => {
              syncCoords(position.coords);
            },
            (error) => {
              if (isMounted) {
                setState({
                  error: getLocationErrorMessage(error),
                  status: error.code === error.PERMISSION_DENIED ? 'denied' : 'error',
                });
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: 1000,
              timeout: 10000,
            },
          );
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          if (isMounted) setState({ status: 'unavailable' });
          return;
        }

        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          if (isMounted) setState({ status: 'denied' });
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1,
            mayShowUserSettingsDialog: true,
            timeInterval: 2000,
          },
          (position) => {
            syncCoords(position.coords);
          },
        );
      } catch (error) {
        if (isMounted) {
          setState({
            error: getLocationErrorMessage(error),
            status: 'error',
          });
        }
      }
    }

    startLocationSync();

    return () => {
      isMounted = false;
      if (webWatchId !== undefined && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchId);
      } else if (typeof subscription?.remove === 'function' && Platform.OS !== 'web') {
        subscription.remove();
      } else if (typeof subscription?.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [enabled]);

  return state;
}
