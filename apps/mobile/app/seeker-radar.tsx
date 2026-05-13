import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DevGpsControl } from '@/src/components/dev-gps-control';
import { GameButton } from '@/src/components/game-button';
import { LeaderDebugDrawer } from '@/src/components/leader-debug-drawer';
import { PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { useDeviceHeading } from '@/src/hooks/use-device-heading';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { useSafeRouter } from '@/src/hooks/use-safe-router';
import { t } from '@/src/i18n';
import { type RadarHint, useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { getBearingForDevDirection, getStoredDevGpsDirection, getStoredDevGpsDistance, isDevGpsEnabled } from '@/src/utils/dev-gps';
import { formatTimer } from '@/src/utils/format-timer';

export default function SeekerRadarScreen() {
  const router = useSafeRouter();
  const { error, finishRound, getRadarHint, leaveRoom, room, tickGameSession, tryCaptureNearest, updateDevTestDistance } = useRoom();
  const [captureMessage, setCaptureMessage] = useState<string>();
  const [devGpsPanelOpen, setDevGpsPanelOpen] = useState(false);
  const [manualCapturePending, setManualCapturePending] = useState(false);
  const [radarHint, setRadarHint] = useState<RadarHint>();
  const [now, setNow] = useState(Date.now());
  const captureRequestedRef = useRef(false);
  const lastStableHintAtRef = useRef(0);
  const tickRequestedRef = useRef(false);
  const seekerPlayerId = room?.gameSession?.seekerPlayerId ?? room?.players.find((player) => player.isLeader)?.id;
  const remainingHiders = room?.players.filter((player) => player.id !== seekerPlayerId && player.status !== 'Capturado').length ?? 0;
  const seekEndsAt = room?.gameSession?.seekEndsAt;
  const remainingSeconds = seekEndsAt ? (seekEndsAt - now) / 1000 : 0;
  const timerLabel = seekEndsAt ? formatTimer(remainingSeconds) : t('radar.timerEnded');
  const autoCaptureEnabled = !__DEV__;
  const deviceHeading = useDeviceHeading(room?.phase === 'seeking');
  usePlayerLocationSync(room?.phase === 'seeking');

  const syncDevRadarOverride = useCallback(async () => {
    if (room?.phase !== 'seeking' || !isDevGpsEnabled()) return;

    const direction = getStoredDevGpsDirection('N');
    const distance = Math.min(Math.max(getStoredDevGpsDistance(40), 0), 40);
    await updateDevTestDistance(distance, getBearingForDevDirection(direction), direction);
  }, [room?.phase, updateDevTestDistance]);

  useEffect(() => {
    if (room?.phase !== 'seeking' || remainingHiders > 0 || tickRequestedRef.current) return;

    tickRequestedRef.current = true;
    tickGameSession()
      .then(() => {
        if ((room.players.length ?? 0) <= 1) {
          router.replace('/lobby');
        } else {
          router.replace('/result');
        }
      })
      .catch(() => {
        tickRequestedRef.current = false;
      });
  }, [remainingHiders, room?.phase, room?.players.length, router, tickGameSession]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (room?.phase !== 'seeking' || !seekEndsAt || remainingSeconds > 0 || tickRequestedRef.current) return;

    tickRequestedRef.current = true;
    tickGameSession().catch(() => {
      tickRequestedRef.current = false;
    });
  }, [remainingSeconds, room?.phase, seekEndsAt, tickGameSession]);

  useEffect(() => {
    if (room?.phase !== 'seeking' || remainingHiders <= 0) return undefined;

    let cancelled = false;
    const stableHintGraceMs = 8000;

    const refreshHint = () => {
      syncDevRadarOverride()
        .then(() => getRadarHint())
        .then((hint) => {
          if (cancelled || !hint) return;

          if (isDevGpsEnabled() && !hint.devOverride) {
            return;
          }

          const isFreshHint = hint.signalStatus === 'fresh';
          if (isFreshHint) {
            lastStableHintAtRef.current = Date.now();
            setRadarHint(hint);
            return;
          }

          if (!lastStableHintAtRef.current || Date.now() - lastStableHintAtRef.current > stableHintGraceMs) {
            setRadarHint(hint);
          }
        })
        .catch(() => undefined);
    };

    refreshHint();
    const interval = setInterval(refreshHint, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [getRadarHint, remainingHiders, room?.phase, syncDevRadarOverride]);

  useEffect(() => {
    if (!autoCaptureEnabled || room?.phase !== 'seeking' || !radarHint?.canCapture || captureRequestedRef.current) return undefined;

    let cancelled = false;

    const attemptCapture = () => {
      captureRequestedRef.current = true;
      tryCaptureNearest()
        .then((payload) => {
          if (cancelled) return;

          if (payload?.capturedPlayerId) {
            if (payload.finalSnapshot || payload.remainingHiders === 0) {
              router.replace('/result');
            } else {
              router.push({ pathname: '/capture', params: { capturedPlayerId: payload.capturedPlayerId } });
            }
            return;
          }

          if (payload?.reason === 'confirming') {
            setCaptureMessage(t('radar.confirmingCapture'));
          } else {
            setCaptureMessage(t('radar.noCaptureSignal'));
          }
        })
        .catch(() => undefined)
        .finally(() => {
          captureRequestedRef.current = false;
        });
    };

    attemptCapture();
    const interval = setInterval(attemptCapture, 900);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [autoCaptureEnabled, radarHint?.canCapture, room?.phase, router, tryCaptureNearest]);

  useEffect(() => {
    if (radarHint?.signalStatus !== 'fresh' || radarHint.band !== 'hot') return;

    import('expo-haptics')
      .then((Haptics) => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
      .catch(() => undefined);
  }, [radarHint?.band, radarHint?.signalStatus, radarHint?.targetPlayerId]);

  const handleSimulateCapture = async () => {
    try {
      setCaptureMessage(undefined);
      setManualCapturePending(true);
      await syncDevRadarOverride();

      if (isDevGpsEnabled() && getStoredDevGpsDistance() > 5) {
        const hint = await getRadarHint();
        if (hint) setRadarHint(hint);
        setCaptureMessage(t('radar.noCaptureSignal'));
        return;
      }

      let payload = await tryCaptureNearest();
      if (isDevGpsEnabled() && payload?.reason === 'confirming') {
        await new Promise((resolve) => setTimeout(resolve, 120));
        payload = await tryCaptureNearest();
      }

      if (payload?.capturedPlayerId) {
        if (payload.finalSnapshot || payload.remainingHiders === 0) {
          router.replace('/result');
        } else {
          router.push('/capture');
        }
        return;
      }

      const hint = await getRadarHint();
      if (hint) setRadarHint(hint);
      setCaptureMessage(payload?.reason === 'confirming' || hint?.canCapture ? t('radar.confirmingCapture') : t('radar.noCaptureSignal'));
    } catch {
      // Error is shown from room store state.
    } finally {
      setManualCapturePending(false);
    }
  };

  const handleFinishWithHiders = async () => {
    try {
      await finishRound('hiders');
      router.push('/result');
    } catch {
      // Keep the player on the radar if the room cannot sync.
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      router.replace('/');
    } catch {
      // Error is shown from room store state.
    }
  };

  return (
    <PrototypeScreen>
      <View
        style={{
          alignItems: 'center',
          gap: 8,
          maxWidth: 430,
          minHeight: '100%',
          padding: 10,
          width: '100%',
        }}>
        <LeaderDebugDrawer radarHint={radarHint} />

        {__DEV__ ? (
          <View style={{ left: -14, pointerEvents: 'box-none', position: 'absolute', top: 166, zIndex: 29 }}>
            <Pressable
              accessibilityLabel={devGpsPanelOpen ? 'Fechar painel DEV GPS' : 'Abrir painel DEV GPS'}
              accessibilityRole="button"
              onPress={() => setDevGpsPanelOpen((current) => !current)}
              style={{
                alignItems: 'center',
                backgroundColor: devGpsPanelOpen ? colors.pink : colors.navy,
                borderColor: colors.esconde,
                borderRadius: 999,
                borderWidth: 2,
                height: 46,
                justifyContent: 'center',
                width: 46,
              }}>
              <Ionicons color={colors.surface} name={devGpsPanelOpen ? 'close' : 'flask-outline'} size={22} />
            </Pressable>
          </View>
        ) : null}

        <View style={{ alignItems: 'center', marginTop: -37, width: 248 }}>
          <Image contentFit="contain" source={require('@/assets/images/logo.png')} style={{ aspectRatio: 1, width: '100%' }} />
        </View>

        <RadarView deviceHeading={deviceHeading} hint={radarHint} remainingCount={remainingHiders} timerLabel={timerLabel} />

        {devGpsPanelOpen ? <DevGpsControl defaultDistance={40} /> : null}

        <View style={{ gap: 10, width: '100%' }}>
          <GameButton label={manualCapturePending ? 'Capturando...' : t('radar.capture')} onPress={handleSimulateCapture} variant="primary" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <GameButton label={t('radar.finishHiders')} onPress={handleFinishWithHiders} size="compact" variant="secondary" />
            </View>
            <View style={{ flex: 1 }}>
              <GameButton label={t('common.exit')} onPress={handleLeaveRoom} size="compact" variant="dangerStrong" />
            </View>
          </View>
        </View>

        {captureMessage ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {captureMessage}
          </Text>
        ) : null}
        {error && error !== 'Conexao instavel. Tente novamente em alguns segundos.' && !error.toLowerCase().includes('failed to fetch') ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </View>
    </PrototypeScreen>
  );
}
