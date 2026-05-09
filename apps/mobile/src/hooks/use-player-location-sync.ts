import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

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

export function usePlayerLocationSync(enabled: boolean): PlayerLocationSyncState {
  const { updatePlayerLocation } = useRoom();
  const updatePlayerLocationRef = useRef(updatePlayerLocation);
  const [state, setState] = useState<PlayerLocationSyncState>({ status: 'idle' });

  useEffect(() => {
    updatePlayerLocationRef.current = updatePlayerLocation;
  }, [updatePlayerLocation]);

  useEffect(() => {
    let isMounted = true;
    let subscription: LocationSubscriptionLike | undefined;

    async function startLocationSync() {
      if (!enabled) {
        setState({ status: 'idle' });
        return;
      }

      setState({ status: 'requesting' });

      try {
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
            const { accuracy, heading, latitude, longitude, speed } = position.coords;

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
          },
        );
      } catch (error) {
        if (isMounted) {
          setState({
            error: error instanceof Error ? error.message : 'Nao foi possivel iniciar o GPS.',
            status: 'error',
          });
        }
      }
    }

    startLocationSync();

    return () => {
      isMounted = false;
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else if (typeof subscription?.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [enabled]);

  return state;
}
