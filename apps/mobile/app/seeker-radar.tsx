import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { t } from '@/src/i18n';
import { type RadarHint, useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { formatTimer } from '@/src/utils/format-timer';

export default function SeekerRadarScreen() {
  const router = useRouter();
  const { error, finishRound, getRadarHint, isLoading, leaveRoom, room, tickGameSession, tryCaptureNearest } = useRoom();
  const [captureMessage, setCaptureMessage] = useState<string>();
  const [radarHint, setRadarHint] = useState<RadarHint>();
  const [now, setNow] = useState(Date.now());
  const tickRequestedRef = useRef(false);
  const remainingHiders =
    room?.players.filter((player) => !player.isLeader && player.status !== 'Capturado').length ?? 0;
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

  const handleSimulateCapture = async () => {
    try {
      setCaptureMessage(undefined);
      const capturedPlayerId = await tryCaptureNearest();
      if (capturedPlayerId) {
        router.push('/capture');
        return;
      }

      const hint = await getRadarHint();
      if (hint) setRadarHint(hint);
      setCaptureMessage(hint?.canCapture ? t('radar.confirmingCapture') : t('radar.noCaptureSignal'));
    } catch {
      // Error is shown from room store state.
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
      <MenuPanel
        backHref="/hide-phase"
        title={t('radar.title')}
        actions={
          <>
            <GameButton label={isLoading ? 'Capturando...' : t('radar.capture')} onPress={handleSimulateCapture} />
            <GameButton label={t('radar.finishHiders')} onPress={handleFinishWithHiders} variant="secondary" />
            <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
          </>
        }>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 24, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
            {timerLabel}
          </Text>
          <Badge label={t('radar.remaining', { count: remainingHiders })} tone="rush" />
        </View>
        <RadarView hint={radarHint} />
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
      </MenuPanel>
    </PrototypeScreen>
  );
}
