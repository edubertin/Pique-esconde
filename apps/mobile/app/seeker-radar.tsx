import { useRouter } from 'expo-router';
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
  const { finishRound } = useRoom();

  const handleFinishWithHiders = () => {
    finishRound('hiders');
    router.push('/result');
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/hide-phase"
        title={t('radar.title')}
        actions={
          <>
            <GameButton href="/capture" label={t('radar.captureSimulation')} />
            <GameButton label={t('radar.finishHiders')} onPress={handleFinishWithHiders} variant="secondary" />
          </>
        }>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 24, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
            {t('radar.timer')}
          </Text>
          <Badge label={t('radar.remaining')} tone="rush" />
        </View>
        <RadarView />
      </MenuPanel>
    </PrototypeScreen>
  );
}
