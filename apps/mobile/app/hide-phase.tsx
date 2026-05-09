import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { useSafeRouter } from '@/src/hooks/use-safe-router';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { formatTimer } from '@/src/utils/format-timer';

export default function HidePhaseScreen() {
  const router = useSafeRouter();
  const { activePlayer, error, isLoading, leaveRoom, markHidden, room, tickGameSession } = useRoom();
  const [now, setNow] = useState(Date.now());
  const tickRequestedRef = useRef(false);
  const isSeeker = Boolean(activePlayer?.isLeader || activePlayer?.id === room?.gameSession?.seekerPlayerId);
  const seekerPlayer = room?.players.find((player) => player.id === room.gameSession?.seekerPlayerId) ?? room?.players.find((player) => player.isLeader);
  const seekerPlayerId = room?.gameSession?.seekerPlayerId ?? seekerPlayer?.id;
  const seekerName = seekerPlayer?.nickname ?? activePlayer?.nickname ?? t('player.roleLeaderSeeker');
  const hiddenCount = room?.players.filter((player) => player.id !== seekerPlayerId && player.status === 'Escondido').length ?? 0;
  const totalHiders = room?.players.filter((player) => player.id !== seekerPlayerId).length ?? 0;
  const hideEndsAt = room?.gameSession?.hideEndsAt;
  const remainingSeconds = hideEndsAt ? (hideEndsAt - now) / 1000 : 0;
  const timerLabel = hideEndsAt ? formatTimer(remainingSeconds) : t('hide.timerEnded');
  const phaseTitle = isSeeker ? t('hide.seekerTitle') : t('hide.title');
  const phaseBadge = isSeeker ? seekerName : t('hide.badge');
  const phaseHeading = isSeeker ? t('hide.seekerHeading') : t('hide.ready');
  const phaseBody = isSeeker
    ? t('hide.seekerStatusText', { hidden: hiddenCount, total: totalHiders })
    : t('hide.statusText', { hidden: hiddenCount, name: seekerName, total: totalHiders });
  const locationSync = usePlayerLocationSync(Boolean(room?.phase === 'hiding' && activePlayer));
  const canMarkHidden = isSeeker || locationSync.status === 'active';
  const gpsStatusText =
    locationSync.status === 'active'
      ? 'GPS pronto para salvar seu esconderijo.'
      : locationSync.status === 'denied'
        ? 'Permita a localizacao para salvar seu esconderijo.'
        : locationSync.status === 'error'
          ? locationSync.error ?? 'Nao foi possivel iniciar o GPS.'
          : 'Buscando GPS para salvar seu esconderijo...';

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
              <GameButton
                disabled={!canMarkHidden || isLoading}
                label={isLoading ? 'Marcando...' : canMarkHidden ? t('hide.ready') : 'Aguardando GPS'}
                onPress={handleMarkHidden}
              />
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
        {!isSeeker ? (
          <Text
            selectable
            style={{
              color: locationSync.status === 'active' ? colors.green : colors.danger,
              fontSize: 13,
              fontWeight: '900',
              textAlign: 'center',
            }}>
            {gpsStatusText}
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
