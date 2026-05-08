import { Text } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HiderStatusScreen() {
  return (
    <PrototypeScreen title="Continue escondido" subtitle="O escondido recebe status, mas não vê o procurador no mapa.">
      <Panel>
        <Text selectable style={{ color: colors.ink, fontSize: 40, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
          02:18
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          Procurador liberado
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          Alerta: radar aumentando. Você vence se não for pego até o fim do tempo.
        </Text>
        <GameButton href="/capture" label="Simular fui encontrado" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
