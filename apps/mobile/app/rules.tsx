import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameLinkButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { gameRules } from '@/src/constants/game';
import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

function RuleRow({ label, value, tone }: { label: string; tone?: 'ready' | 'waiting' | 'leader'; value: string }) {
  return (
    <View
      style={{
        ...surfaces.glassTile,
        alignItems: 'center',
        borderRadius: 16,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        padding: 14,
      }}>
      <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 15, fontWeight: '700' }}>
        {label}
      </Text>
      <Badge label={value} tone={tone ?? 'neutral'} />
    </View>
  );
}

export default function RulesScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel backHref="/lobby" title={t('rules.title')} actions={<GameLinkButton href="/lobby" label={t('common.save')} />}>
        <RuleRow label={t('rules.hideTime')} value={`${gameRules.hideSeconds}s`} tone="waiting" />
        <RuleRow label={t('rules.seekTime')} value="3min" tone="leader" />
        <RuleRow label={t('rules.environment')} value={t('rules.standard')} />
        <RuleRow label={t('rules.capture')} value={`${gameRules.captureRadiusMeters}m / ${gameRules.captureConfirmSeconds}s`} tone="ready" />
        <RuleRow label={t('rules.hiddenAnchor')} value={`${gameRules.hiddenAnchorRadiusMeters}m`} tone="waiting" />
        <RuleRow label={t('rules.gpsGrace')} value={`${gameRules.locationWarningSeconds}s / ${gameRules.locationEliminationSeconds}s`} />
      </MenuPanel>
    </PrototypeScreen>
  );
}
