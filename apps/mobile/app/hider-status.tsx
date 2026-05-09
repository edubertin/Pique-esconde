import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { formatTimer } from '@/src/utils/format-timer';

export default function HiderStatusScreen() {
  const router = useRouter();
  const { activePlayer, leaveRoom, room, tickGameSession } = useRoom();
  const [now, setNow] = useState(Date.now());
  const tickRequestedRef = useRef(false);
  const seekEndsAt = room?.gameSession?.seekEndsAt;
  const seekerName =
    room?.players.find((player) => player.id === room.gameSession?.seekerPlayerId)?.nickname ??
    room?.players.find((player) => player.isLeader)?.nickname ??
    t('player.roleLeaderSeeker');
  const remainingSeconds = seekEndsAt ? (seekEndsAt - now) / 1000 : 0;
  const timerLabel = seekEndsAt ? formatTimer(remainingSeconds) : t('hiderStatus.timerEnded');
  usePlayerLocationSync(Boolean(room?.phase === 'seeking' && activePlayer));

  useEffect(() => {
    if (!room) {
      router.replace('/');
      return;
    }

    if (activePlayer?.status === 'Capturado') {
      router.replace('/capture');
      return;
    }

    if (room.phase === 'finished') {
      router.replace('/result');
      return;
    }

    if (activePlayer?.isLeader) {
      router.replace('/seeker-radar');
    }
  }, [activePlayer?.isLeader, activePlayer?.status, room, router]);

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
        title={t('hiderStatus.title')}
        actions={<GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />}>
        <Badge label={t('hiderStatus.released', { name: seekerName })} tone="waiting" />
        <Text selectable style={{ color: colors.ink, fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
          {timerLabel}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          {t('hiderStatus.radarIncreasing')}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          {t('hiderStatus.surviveText', { name: seekerName })}
        </Text>
      </MenuPanel>
    </PrototypeScreen>
  );
}
