import { Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HidePhaseScreen() {
  return (
    <PrototypeScreen title="Vá se esconder" subtitle="O botão acelera o jogo, mas o tempo também libera o procurador.">
      <Panel>
        <Text
          selectable
          style={{
            color: colors.ink,
            fontSize: 56,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            textAlign: 'center',
          }}>
          00:42
        </Text>
        <GameButton href="/hider-status" label="Estou escondido" />
      </Panel>
      <Panel>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            Visão do procurador
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
            3 de 4 escondidos prontos. Quando todos marcarem ou o tempo acabar, a busca começa.
          </Text>
        </View>
        <GameButton href="/seeker-radar" label="Simular liberação" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
