import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type DeviceHeadingState = {
  accuracy: number;
  headingDegrees?: number;
  status: 'idle' | 'active' | 'unavailable';
};

type HeadingSubscriptionLike = {
  remove?: () => void;
  unsubscribe?: () => void;
};

export function useDeviceHeading(enabled: boolean): DeviceHeadingState {
  const [state, setState] = useState<DeviceHeadingState>({ accuracy: 0, status: 'idle' });

  useEffect(() => {
    let isMounted = true;
    let subscription: HeadingSubscriptionLike | undefined;

    async function startHeading() {
      if (!enabled || Platform.OS === 'web') {
        setState({ accuracy: 0, status: enabled ? 'unavailable' : 'idle' });
        return;
      }

      try {
        subscription = await Location.watchHeadingAsync((heading) => {
          const headingDegrees = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;

          if (!isMounted || headingDegrees < 0) return;

          setState({
            accuracy: heading.accuracy,
            headingDegrees,
            status: 'active',
          });
        });
      } catch {
        if (isMounted) {
          setState({ accuracy: 0, status: 'unavailable' });
        }
      }
    }

    startHeading();

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
