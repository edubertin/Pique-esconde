import { Text } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';

export default function HiderStatusScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/hide-phase"
        title={t('hiderStatus.title')}
        actions={<GameButton href="/capture" label={t('hiderStatus.foundSimulation')} variant="secondary" />}>
        <Badge label={t('hiderStatus.released')} tone="waiting" />
        <Text selectable style={{ color: colors.ink, fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
          {t('hiderStatus.timer')}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          {t('hiderStatus.radarIncreasing')}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          {t('hiderStatus.surviveText')}
        </Text>
      </MenuPanel>
    </PrototypeScreen>
  );
}
