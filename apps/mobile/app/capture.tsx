import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function CaptureScreen() {
  return (
    <PrototypeScreen title="Captura!">
      <Panel tone="strong">
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Badge label="Encontrado" tone="rush" />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.yellow,
              borderColor: colors.surface,
              borderRadius: 42,
              borderWidth: 4,
              height: 84,
              justifyContent: 'center',
              width: 84,
            }}>
            <Text style={{ color: colors.navy, fontSize: 24, fontWeight: '900' }}>A3</Text>
          </View>
          <Text selectable style={{ color: colors.surface, fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
            Rafa foi encontrado
          </Text>
          <Text selectable style={{ color: colors.backgroundDeep, fontSize: 16, textAlign: 'center' }}>
            Restam 2 escondidos na rodada.
          </Text>
        </View>
        <GameButton href="/seeker-radar" label="Continuar procurando" />
        <GameButton href="/result" label="Encerrar rodada" variant="ghost" />
      </Panel>
    </PrototypeScreen>
  );
}
