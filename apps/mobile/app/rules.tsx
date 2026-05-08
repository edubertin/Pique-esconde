import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { gameRules } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

function RuleRow({ label, value, tone }: { label: string; tone?: 'ready' | 'waiting' | 'leader'; value: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderRadius: 16,
        borderWidth: 1,
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
    <PrototypeScreen title="Regras" subtitle="Padrões rápidos para não travar o grupo antes da brincadeira.">
      <Panel tone="sunny">
        <RuleRow label="Tempo para esconder" value={`${gameRules.hideSeconds}s`} tone="waiting" />
        <RuleRow label="Tempo para procurar" value="3min" tone="leader" />
        <RuleRow label="Ambiente" value="Padrão" />
        <RuleRow
          label="Captura automática"
          value={`${gameRules.captureRadiusMeters}m / ${gameRules.captureConfirmSeconds}s`}
          tone="ready"
        />
        <GameButton href="/lobby" label="Salvar regras" />
      </Panel>
    </PrototypeScreen>
  );
}
