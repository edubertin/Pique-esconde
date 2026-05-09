import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';

export default function HidePhaseScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/lobby"
        title={t('hide.title')}
        actions={<GameButton href="/seeker-radar" label={t('hide.releaseSimulation')} variant="secondary" />}>
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
        <GameButton href="/hider-status" label={t('hide.ready')} />

        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            {t('hide.seekerWaiting')}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
            {t('hide.statusText')}
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
