import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  return (
    <PrototypeScreen>
      <Panel tone="strong">
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.pink,
            borderRadius: 24,
            borderWidth: 3,
            gap: 12,
            padding: 16,
          }}>
          <BrandLogo />
          <Text selectable style={{ color: colors.navy, fontSize: 15, fontWeight: '800', textAlign: 'center' }}>
            Chame a galera e transforme o celular em brincadeira de rua.
          </Text>
        </View>
        <GameButton href="/create-room" label="Criar sala" />
        <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
        <Text selectable style={{ color: colors.backgroundDeep, fontSize: 14, fontWeight: '800', textAlign: 'center' }}>
          2-8 jogadores · sala temporária · GPS só na partida
        </Text>
      </Panel>
    </PrototypeScreen>
  );
}
