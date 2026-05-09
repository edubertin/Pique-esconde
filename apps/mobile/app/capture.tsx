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
  const { finishRound } = useRoom();

  const handleFinishWithSeeker = () => {
    finishRound('seeker');
    router.push('/result');
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/seeker-radar"
        title={t('capture.title')}
        actions={
          <>
            <GameButton href="/seeker-radar" label={t('capture.continue')} />
            <GameButton label={t('capture.finish')} onPress={handleFinishWithSeeker} variant="ghost" />
          </>
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
            <Text style={{ color: colors.navy, fontSize: 24, fontWeight: '900' }}>A3</Text>
          </View>
          <Text selectable style={{ color: colors.navy, fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
            {t('capture.playerFound')}
          </Text>
          <Text selectable style={{ color: colors.ink, fontSize: 16, textAlign: 'center' }}>
            {t('capture.remaining')}
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
