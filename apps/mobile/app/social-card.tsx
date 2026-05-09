import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function SocialCardScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel backHref="/result" title="Card social" actions={<GameButton href="/lobby" label="Voltar para sala" />}>
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
              backgroundColor: colors.esconde,
              borderColor: colors.pink,
              borderRadius: 16,
              borderWidth: 3,
              height: 88,
              justifyContent: 'center',
              width: 88,
            }}>
            <Text style={{ color: colors.navy, fontWeight: '900', textAlign: 'center' }}>QR</Text>
          </View>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
