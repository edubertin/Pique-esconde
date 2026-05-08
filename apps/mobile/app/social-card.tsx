import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function SocialCardScreen() {
  return (
    <PrototypeScreen title="Card social" subtitle="Divulgação sem GPS, mapa real, rota, endereço ou coordenadas.">
      <Panel tone="strong">
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.pink,
            borderRadius: 24,
            borderWidth: 3,
            gap: 14,
            padding: 18,
          }}>
          <BrandLogo />
          <Text selectable style={{ color: colors.navy, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>
            Sobrevivi ao rush final
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 16, textAlign: 'center' }}>
            Placar: 1 sobrevivente · Tempo: 3min
          </Text>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.navy,
              borderColor: colors.lime,
              borderRadius: 16,
              borderWidth: 3,
              height: 88,
              justifyContent: 'center',
              width: 88,
            }}>
            <Text style={{ color: colors.surface, fontWeight: '900', textAlign: 'center' }}>QR</Text>
          </View>
        </View>
        <GameButton href="/lobby" label="Voltar para sala" />
      </Panel>
    </PrototypeScreen>
  );
}
