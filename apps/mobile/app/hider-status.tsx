import { Text } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HiderStatusScreen() {
  return (
    <PrototypeScreen title="Continue escondido">
      <Panel>
        <Badge label="Procurador liberado" tone="waiting" />
        <Text selectable style={{ color: colors.ink, fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
          02:18
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          Radar aumentando
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          Você vence se não for pego até o fim do tempo.
        </Text>
        <GameButton href="/capture" label="Simular fui encontrado" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
