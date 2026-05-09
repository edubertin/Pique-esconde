import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import {
  devGpsDistanceStorageKey,
  disableDevGps,
  type DevGpsDirection,
  devGpsStorageKey,
  getBearingForDevDirection,
  getStoredDevGpsDirection,
  isDevGpsAvailable,
  setStoredDevGpsScenario,
} from '@/src/utils/dev-gps';

const maxDistanceMeters = 40;
const presets = [0, 4, 5, 10, 20, 30, 40];
const directions: { label: string; value: DevGpsDirection }[] = [
  { label: 'N', value: 'N' },
  { label: 'S', value: 'S' },
  { label: 'L', value: 'E' },
  { label: 'O', value: 'W' },
];
type SyncStatus = 'idle' | 'active' | 'error';

export function DevGpsControl({ defaultDistance = 0 }: { defaultDistance?: number }) {
  const { clearDevTestDistance, updateDevTestDistance } = useRoom();
  const activeRef = useRef(false);
  const clearDevTestDistanceRef = useRef(clearDevTestDistance);
  const directionRef = useRef<DevGpsDirection>('N');
  const distanceRef = useRef(defaultDistance);
  const operationIdRef = useRef(0);
  const updateDevTestDistanceRef = useRef(updateDevTestDistance);
  const enabled = isDevGpsAvailable();
  const [active, setActive] = useState(() => (
    enabled && typeof window !== 'undefined' && window.sessionStorage.getItem(devGpsStorageKey) === 'true'
  ));
  const [direction, setDirection] = useState<DevGpsDirection>(() => getStoredDevGpsDirection('N'));
  const [distance, setDistance] = useState(() => {
    if (!enabled || typeof window === 'undefined') return defaultDistance;

    const storedDistance = Number(window.sessionStorage.getItem(devGpsDistanceStorageKey));
    return Number.isFinite(storedDistance) ? Math.min(Math.max(storedDistance, 0), maxDistanceMeters) : defaultDistance;
  });
  const [isClearing, setIsClearing] = useState(false);
  const [, setSyncStatus] = useState<SyncStatus>('idle');
  const percent = Math.min(100, Math.max(0, (distance / maxDistanceMeters) * 100));

  useEffect(() => {
    clearDevTestDistanceRef.current = clearDevTestDistance;
    updateDevTestDistanceRef.current = updateDevTestDistance;
  }, [clearDevTestDistance, updateDevTestDistance]);

  useEffect(() => {
    activeRef.current = active;
    directionRef.current = direction;
    distanceRef.current = distance;
  }, [active, direction, distance]);

  useEffect(() => {
    if (!enabled) return undefined;

    if (active) {
      setStoredDevGpsScenario(distance, direction);
    } else {
      disableDevGps();
    }

    return undefined;
  }, [active, direction, distance, enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!active) return undefined;

    let cancelled = false;
    const sync = async (showError = false) => {
      try {
        await updateDevTestDistanceRef.current(distance, getBearingForDevDirection(direction), direction);
        if (!cancelled) setSyncStatus('active');
      } catch {
        if (!cancelled && showError) setSyncStatus('error');
      }
    };

    sync(true);
    const interval = setInterval(() => {
      if (!cancelled) sync(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [active, direction, distance, enabled]);

  if (!enabled) return null;

  const setPreset = async (nextDistance: number) => {
    operationIdRef.current += 1;
    const safeDistance = Math.min(Math.max(nextDistance, 0), maxDistanceMeters);

    setIsClearing(false);
    setStoredDevGpsScenario(safeDistance, direction);
    setDistance(safeDistance);
    setActive(true);

    try {
      await updateDevTestDistanceRef.current(safeDistance, getBearingForDevDirection(direction), direction);
      setSyncStatus('active');
    } catch {
      setSyncStatus('error');
    }
  };

  const setNextDirection = async (nextDirection: DevGpsDirection) => {
    operationIdRef.current += 1;
    setIsClearing(false);
    setStoredDevGpsScenario(distance, nextDirection);
    setDirection(nextDirection);
    setActive(true);

    try {
      await updateDevTestDistanceRef.current(distance, getBearingForDevDirection(nextDirection), nextDirection);
      setSyncStatus('active');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleUseRealGps = async () => {
    operationIdRef.current += 1;
    const clearOperationId = operationIdRef.current;

    setActive(false);
    setIsClearing(true);
    setSyncStatus('idle');

    try {
      await clearDevTestDistanceRef.current();
      if (operationIdRef.current === clearOperationId) {
        setSyncStatus('idle');
        return;
      }

      if (activeRef.current) {
        await updateDevTestDistanceRef.current(
          distanceRef.current,
          getBearingForDevDirection(directionRef.current),
          directionRef.current,
        );
      }
    } catch {
      if (operationIdRef.current === clearOperationId) setSyncStatus('error');
    } finally {
      if (operationIdRef.current === clearOperationId) setIsClearing(false);
    }
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
          DEV GPS: alvo sintetico
        </Text>
        <View
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
            {active ? 'Simulando' : 'Escolha metros'}
          </Text>
        </View>
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
            disabled={isClearing}
            onPress={() => {
              setPreset(preset).catch(() => undefined);
            }}
            style={{
              backgroundColor: distance === preset ? colors.navy : colors.surface,
              borderColor: colors.navy,
              borderRadius: 999,
              borderWidth: 1,
              minHeight: 38,
              minWidth: 58,
              opacity: isClearing ? 0.55 : 1,
              paddingHorizontal: 10,
              paddingVertical: 9,
            }}>
            <Text style={{ color: distance === preset ? colors.surface : colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
              {preset}m
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {directions.map((item) => (
          <Pressable
            key={item.value}
            disabled={isClearing}
            hitSlop={6}
            onPress={() => {
              setNextDirection(item.value).catch(() => undefined);
            }}
            style={{
              backgroundColor: direction === item.value ? colors.navy : colors.surface,
              borderColor: colors.navy,
              borderRadius: 999,
              borderWidth: 1,
              minHeight: 38,
              minWidth: 58,
              opacity: isClearing ? 0.55 : 1,
              paddingHorizontal: 10,
              paddingVertical: 9,
            }}>
            <Text style={{ color: direction === item.value ? colors.surface : colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          disabled={isClearing}
          hitSlop={6}
          onPress={() => {
            handleUseRealGps().catch(() => undefined);
          }}
          style={{
            backgroundColor: active ? colors.surface : colors.navy,
            borderColor: colors.navy,
            borderRadius: 999,
            borderWidth: 1,
            minHeight: 38,
            minWidth: 98,
            opacity: isClearing ? 0.55 : 1,
            paddingHorizontal: 10,
            paddingVertical: 9,
          }}>
          <Text style={{ color: active ? colors.ink : colors.surface, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
            {isClearing ? 'Limpando...' : 'GPS real'}
          </Text>
        </Pressable>
      </View>

      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' }}>
        {isClearing
          ? 'Limpando override no servidor...'
          : active ? `Simulando ${distance}m / ${direction}.` : `Toque em metro/direcao para ligar. Atual: ${distance}m / ${direction}.`} O alvo DEV fica ancorado no teste.
      </Text>
    </View>
  );
}
