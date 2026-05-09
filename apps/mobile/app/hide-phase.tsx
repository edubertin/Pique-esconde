import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { formatTimer } from '@/src/utils/format-timer';

export default function HidePhaseScreen() {
  const router = useRouter();
  const { activePlayer, error, isLoading, leaveRoom, markHidden, room, tickGameSession } = useRoom();
  const [now, setNow] = useState(Date.now());
  const tickRequestedRef = useRef(false);
  const isSeeker = Boolean(activePlayer?.isLeader || activePlayer?.id === room?.gameSession?.seekerPlayerId);
  const hiddenCount = room?.players.filter((player) => !player.isLeader && player.status === 'Escondido').length ?? 0;
  const totalHiders = room?.players.filter((player) => !player.isLeader).length ?? 0;
  const hideEndsAt = room?.gameSession?.hideEndsAt;
  const remainingSeconds = hideEndsAt ? (hideEndsAt - now) / 1000 : 0;
  const timerLabel = hideEndsAt ? formatTimer(remainingSeconds) : t('hide.timerEnded');
  const phaseTitle = isSeeker ? t('hide.seekerTitle') : t('hide.title');
  const phaseBadge = isSeeker ? t('hide.seekerBadge') : t('hide.badge');
  const phaseHeading = isSeeker ? t('hide.seekerHeading') : t('hide.ready');
  const phaseBody = isSeeker
    ? t('hide.seekerStatusText', { hidden: hiddenCount, total: totalHiders })
    : t('hide.statusText', { hidden: hiddenCount, total: totalHiders });

  useEffect(() => {
    if (!room) {
      router.replace('/');
      return;
    }

    if (room.players.length < 2) {
      router.replace('/lobby');
      return;
    }

    if (room.phase === 'seeking') {
      router.replace(isSeeker ? '/seeker-radar' : '/hider-status');
      return;
    }

    if (room.phase === 'finished') {
      router.replace('/result');
    }
  }, [isSeeker, room, router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (room?.phase !== 'hiding' || !hideEndsAt || remainingSeconds > 0 || tickRequestedRef.current) return;

    tickRequestedRef.current = true;
    tickGameSession().catch(() => {
      tickRequestedRef.current = false;
    });
  }, [hideEndsAt, remainingSeconds, room?.phase, tickGameSession]);

  const handleMarkHidden = async () => {
    try {
      await markHidden();
      router.push('/hider-status');
    } catch {
      // Error is shown from room store state.
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
        backHref="/lobby"
        title={phaseTitle}
        actions={
          <>
            {!isSeeker ? (
              <GameButton label={isLoading ? 'Marcando...' : t('hide.ready')} onPress={handleMarkHidden} />
            ) : null}
            <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
          </>
        }>
        <Badge label={phaseBadge} tone="rush" />
        <Text
          selectable
          style={{
            color: colors.navy,
            fontSize: 60,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            textAlign: 'center',
          }}>
          {timerLabel}
        </Text>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            {phaseHeading}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
            {phaseBody}
          </Text>
        </View>
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
