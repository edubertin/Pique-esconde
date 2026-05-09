import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function HidePhaseScreen() {
  const router = useRouter();
  const { activePlayer, error, isLoading, leaveRoom, markHidden, releaseSeeker, room } = useRoom();
  const isSeeker = Boolean(activePlayer?.isLeader || activePlayer?.id === room?.gameSession?.seekerPlayerId);
  const hiddenCount = room?.players.filter((player) => !player.isLeader && player.status === 'Escondido').length ?? 0;
  const totalHiders = room?.players.filter((player) => !player.isLeader).length ?? 0;

  useEffect(() => {
    if (!room) {
      router.replace('/');
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

  const handleMarkHidden = async () => {
    try {
      await markHidden();
      router.push('/hider-status');
    } catch {
      // Error is shown from room store state.
    }
  };

  const handleReleaseSeeker = async () => {
    try {
      await releaseSeeker();
      router.push('/seeker-radar');
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
        title={t('hide.title')}
        actions={
          <>
            {isSeeker ? (
              <GameButton label={isLoading ? 'Liberando...' : t('hide.releaseSimulation')} onPress={handleReleaseSeeker} variant="secondary" />
            ) : (
              <GameButton label={isLoading ? 'Marcando...' : t('hide.ready')} onPress={handleMarkHidden} />
            )}
            <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
          </>
        }>
        <Badge label={t('hide.badge')} tone="rush" />
        <Text
          selectable
          style={{
            color: colors.navy,
            fontSize: 60,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            textAlign: 'center',
          }}>
          {t('hide.timer')}
        </Text>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            {isSeeker ? t('hide.seekerWaiting') : t('hide.ready')}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
            {t('hide.statusText', { hidden: hiddenCount, total: totalHiders })}
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
