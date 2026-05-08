import { Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function SocialCardScreen() {
  return (
    <PrototypeScreen title="Card social" subtitle="Divulgação sem GPS, mapa real, rota, endereço ou coordenadas.">
      <Panel>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.navy,
            borderRadius: 20,
            gap: 12,
            padding: 22,
          }}>
          <Text selectable style={{ color: colors.surface, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
            PIQUE ESCONDE
          </Text>
          <Text selectable style={{ color: colors.lime, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
            Sobrevivi ao rush final
          </Text>
          <Text selectable style={{ color: colors.surface, fontSize: 16, textAlign: 'center' }}>
            Placar: 1 sobrevivente · Tempo: 3min
          </Text>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 14,
              height: 86,
              justifyContent: 'center',
              width: 86,
            }}>
            <Text style={{ color: colors.ink, fontWeight: '900', textAlign: 'center' }}>QR</Text>
          </View>
        </View>
        <GameButton href="/lobby" label="Voltar para sala" />
      </Panel>
    </PrototypeScreen>
  );
}
