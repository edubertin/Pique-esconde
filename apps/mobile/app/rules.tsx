import { Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { gameRules } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
        borderBottomColor: colors.line,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
      }}>
      <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
        {value}
      </Text>
    </View>
  );
}

export default function RulesScreen() {
  return (
    <PrototypeScreen title="Regras" subtitle="Padrões simples para a primeira rodada.">
      <Panel>
        <RuleRow label="Tempo para esconder" value={`${gameRules.hideSeconds}s`} />
        <RuleRow label="Tempo para procurar" value="3min" />
        <RuleRow label="Ambiente" value="Padrão" />
        <RuleRow label="Captura" value={`${gameRules.captureRadiusMeters}m / ${gameRules.captureConfirmSeconds}s`} />
        <GameButton href="/lobby" label="Salvar regras" />
      </Panel>
    </PrototypeScreen>
  );
}
