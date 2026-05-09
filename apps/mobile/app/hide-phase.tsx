import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HidePhaseScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/lobby"
        title="Vá se esconder"
        actions={<GameButton href="/seeker-radar" label="Simular liberação" variant="secondary" />}>
        <Badge label="Esconder" tone="rush" />
        <Text
          selectable
          style={{
            color: colors.navy,
            fontSize: 60,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            textAlign: 'center',
          }}>
          00:42
        </Text>
        <GameButton href="/hider-status" label="Estou escondido" />

        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            Procurador aguardando
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
            3 de 4 escondidos prontos. Quando todos marcarem ou o tempo acabar, a busca começa.
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
