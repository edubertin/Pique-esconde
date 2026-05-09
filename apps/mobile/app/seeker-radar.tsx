import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { DevGpsControl } from '@/src/components/dev-gps-control';
import { GameButton } from '@/src/components/game-button';
import { PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { t } from '@/src/i18n';
import { type RadarHint, useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { formatTimer } from '@/src/utils/format-timer';

export default function SeekerRadarScreen() {
  const router = useRouter();
  const { error, finishRound, getRadarHint, leaveRoom, room, tickGameSession, tryCaptureNearest } = useRoom();
  const [captureMessage, setCaptureMessage] = useState<string>();
  const [manualCapturePending, setManualCapturePending] = useState(false);
  const [radarHint, setRadarHint] = useState<RadarHint>();
  const [now, setNow] = useState(Date.now());
  const captureRequestedRef = useRef(false);
  const tickRequestedRef = useRef(false);
  const seekerPlayerId = room?.gameSession?.seekerPlayerId ?? room?.players.find((player) => player.isLeader)?.id;
  const remainingHiders = room?.players.filter((player) => player.id !== seekerPlayerId && player.status !== 'Capturado').length ?? 0;
  const seekEndsAt = room?.gameSession?.seekEndsAt;
  const remainingSeconds = seekEndsAt ? (seekEndsAt - now) / 1000 : 0;
  const timerLabel = seekEndsAt ? formatTimer(remainingSeconds) : t('radar.timerEnded');
  usePlayerLocationSync(room?.phase === 'seeking');

  useEffect(() => {
    if (!room) {
      router.replace('/');
      return;
    }

    if (room.phase === 'finished') {
      router.replace('/result');
      return;
    }
  }, [room, router]);

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
    if (room?.phase !== 'seeking') return undefined;

    let cancelled = false;

    const refreshHint = () => {
      getRadarHint()
        .then((hint) => {
          if (!cancelled && hint) setRadarHint(hint);
        })
        .catch(() => undefined);
    };

    refreshHint();
    const interval = setInterval(refreshHint, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [getRadarHint, room?.phase]);

  useEffect(() => {
    if (room?.phase !== 'seeking' || !radarHint?.canCapture || captureRequestedRef.current) return undefined;

    let cancelled = false;

    const attemptCapture = () => {
      captureRequestedRef.current = true;
      tryCaptureNearest()
        .then((payload) => {
          if (cancelled) return;

          if (payload?.capturedPlayerId) {
            router.push('/capture');
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
  }, [radarHint?.canCapture, room?.phase, router, tryCaptureNearest]);

  const handleSimulateCapture = async () => {
    try {
      setCaptureMessage(undefined);
      setManualCapturePending(true);
      const payload = await tryCaptureNearest();
      if (payload?.capturedPlayerId) {
        router.push('/capture');
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
          backgroundColor: 'rgba(18, 30, 45, 0.22)',
          borderRadius: 28,
          gap: 12,
          maxWidth: 430,
          minHeight: '100%',
          padding: 10,
          width: '100%',
        }}>
        <View style={{ alignItems: 'center', width: 118 }}>
          <Image contentFit="contain" source={require('@/assets/images/pique-esconde-logo.png')} style={{ aspectRatio: 1.14, width: '100%' }} />
        </View>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'center',
            width: '100%',
          }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.84)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text selectable style={{ color: colors.ink, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
              {timerLabel}
            </Text>
          </View>
          <View style={{ backgroundColor: colors.pink, borderColor: colors.navy, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text selectable style={{ color: colors.surface, fontSize: 13, fontWeight: '900' }}>
              {t('radar.remaining', { count: remainingHiders })}
            </Text>
          </View>
        </View>

        <RadarView hint={radarHint} />

        <DevGpsControl defaultDistance={60} label="procurador" />

        <View style={{ gap: 10, width: '100%' }}>
          <GameButton label={manualCapturePending ? 'Capturando...' : t('radar.capture')} onPress={handleSimulateCapture} variant="capture" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <GameButton label={t('radar.finishHiders')} onPress={handleFinishWithHiders} size="compact" variant="rush" />
            </View>
            <View style={{ flex: 1 }}>
              <GameButton label={t('common.exit')} onPress={handleLeaveRoom} size="compact" variant="ghost" />
            </View>
          </View>
        </View>

        {captureMessage ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {captureMessage}
          </Text>
        ) : null}
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </View>
    </PrototypeScreen>
  );
}
