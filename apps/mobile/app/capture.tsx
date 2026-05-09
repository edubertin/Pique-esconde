import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function CaptureScreen() {
  const router = useRouter();
  const { activePlayer, finishRound, leaveRoom, room } = useRoom();
  const capturedPlayer = room?.players.find((player) => player.status === 'Capturado');
  const remainingHiders = room?.players.filter((player) => !player.isLeader && player.status !== 'Capturado').length ?? 0;
  const isSeeker = Boolean(activePlayer?.isLeader || activePlayer?.id === room?.gameSession?.seekerPlayerId);

  const handleFinishWithSeeker = async () => {
    try {
      await finishRound('seeker');
      router.push('/result');
    } catch {
      // Keep the player on the capture screen if the room cannot sync.
    }
  };

  const handleContinue = () => {
    router.push(room?.phase === 'finished' ? '/result' : '/seeker-radar');
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
        backHref="/seeker-radar"
        title={t('capture.title')}
        actions={
          isSeeker ? (
            <>
              <GameButton label={room?.phase === 'finished' ? t('result.title') : t('capture.continue')} onPress={handleContinue} />
              <GameButton label={t('capture.finish')} onPress={handleFinishWithSeeker} variant="ghost" />
              <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
            </>
          ) : (
            <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
          )
        }>
        <View
          style={{
            ...surfaces.highlightTile,
            alignItems: 'center',
            borderRadius: 22,
            gap: 14,
            padding: 18,
          }}>
          <Badge label={t('capture.captured')} tone="rush" />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.yellow,
              borderColor: colors.surface,
              borderRadius: 42,
              borderWidth: 4,
              height: 84,
              justifyContent: 'center',
              width: 84,
            }}>
            <Text style={{ color: colors.navy, fontSize: 24, fontWeight: '900' }}>{capturedPlayer?.nickname?.slice(0, 2).toUpperCase() ?? 'OK'}</Text>
          </View>
          <Text selectable style={{ color: colors.navy, fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
            {t('capture.playerFound', { name: capturedPlayer?.nickname ?? 'Jogador' })}
          </Text>
          <Text selectable style={{ color: colors.ink, fontSize: 16, textAlign: 'center' }}>
            {t('capture.remaining', { count: remainingHiders })}
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
