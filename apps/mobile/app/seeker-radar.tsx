import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function SeekerRadarScreen() {
  const router = useRouter();
  const { error, finishRound, isLoading, leaveRoom, room, simulateCapture } = useRoom();
  const remainingHiders =
    room?.players.filter((player) => !player.isLeader && player.status !== 'Capturado').length ?? 0;

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

  const handleSimulateCapture = async () => {
    try {
      await simulateCapture();
      router.push('/capture');
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
            <GameButton label={isLoading ? 'Capturando...' : t('radar.captureSimulation')} onPress={handleSimulateCapture} />
            <GameButton label={t('radar.finishHiders')} onPress={handleFinishWithHiders} variant="secondary" />
            <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
          </>
        }>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 24, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
            {t('radar.timer')}
          </Text>
          <Badge label={t('radar.remaining', { count: remainingHiders })} tone="rush" />
        </View>
        <RadarView />
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
