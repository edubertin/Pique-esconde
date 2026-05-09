import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const baseLocation = {
  lat: -23.55052,
  lng: -46.633308,
};

const maxDistanceMeters = 60;
const metersPerDegreeLatitude = 111_320;
const devGpsStorageKey = 'pe-dev-gps-active';
const presets = [0, 4, 8, 15, 35, 60];

function offsetLocation(distanceMeters: number) {
  return {
    accuracyMeters: 1,
    headingDegrees: 0,
    lat: baseLocation.lat + distanceMeters / metersPerDegreeLatitude,
    lng: baseLocation.lng,
    speedMetersPerSecond: 0,
  };
}

export function DevGpsControl({ defaultDistance = 0, label }: { defaultDistance?: number; label: string }) {
  const { updatePlayerLocation } = useRoom();
  const [active, setActive] = useState(false);
  const [distance, setDistance] = useState(defaultDistance);

  const enabled = __DEV__ && Platform.OS === 'web';
  const percent = Math.min(100, Math.max(0, (distance / maxDistanceMeters) * 100));

  useEffect(() => {
    if (!enabled) return undefined;

    if (active) {
      window.sessionStorage.setItem(devGpsStorageKey, 'true');
    } else {
      window.sessionStorage.removeItem(devGpsStorageKey);
    }

    if (!active) return undefined;

    let cancelled = false;
    const sync = () => {
      updatePlayerLocation(offsetLocation(distance)).catch(() => undefined);
    };

    sync();
    const interval = setInterval(() => {
      if (!cancelled) sync();
    }, 900);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.sessionStorage.removeItem(devGpsStorageKey);
    };
  }, [active, distance, enabled, updatePlayerLocation]);

  if (!enabled) return null;

  const setPreset = (nextDistance: number) => {
    setDistance(nextDistance);
    setActive(true);
  };

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderColor: active ? colors.green : 'rgba(255,255,255,0.82)',
        borderRadius: 18,
        borderWidth: 2,
        gap: 8,
        padding: 10,
        width: '100%',
      }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: colors.ink, flex: 1, fontSize: 12, fontWeight: '900' }}>
          DEV GPS: {label}
        </Text>
        <Pressable
          onPress={() => setActive((current) => !current)}
          hitSlop={8}
          style={{
            backgroundColor: active ? colors.green : colors.surface,
            borderColor: colors.navy,
            borderRadius: 999,
            borderWidth: 1,
            minWidth: 96,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}>
          <Text style={{ color: active ? colors.surface : colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
            {active ? 'Ligado' : 'Desligado'}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(7,26,61,0.12)',
          borderColor: colors.navy,
          borderRadius: 999,
          borderWidth: 1,
          height: 28,
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        }}>
        <View style={{ backgroundColor: colors.yellow, height: '100%', width: `${percent}%` }} />
        <View
          style={{
            backgroundColor: colors.pink,
            borderColor: colors.surface,
            borderRadius: 999,
            borderWidth: 2,
            height: 28,
            left: `${percent}%`,
            marginLeft: -14,
            position: 'absolute',
            width: 28,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {presets.map((preset) => (
          <Pressable
            key={preset}
            hitSlop={6}
            onPress={() => setPreset(preset)}
            style={{
              backgroundColor: distance === preset ? colors.navy : colors.surface,
              borderColor: colors.navy,
              borderRadius: 999,
              borderWidth: 1,
              minHeight: 38,
              minWidth: 58,
              paddingHorizontal: 10,
              paddingVertical: 9,
            }}>
            <Text style={{ color: distance === preset ? colors.surface : colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
              {preset}m
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' }}>
        {active ? `Simulando ${distance}m.` : `Toque em um metro para ligar. Atual: ${distance}m.`} Escondido 0m, procurador 4m.
      </Text>
    </View>
  );
}
