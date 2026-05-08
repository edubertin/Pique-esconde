import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  return (
    <PrototypeScreen>
      <Panel>
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            gap: 18,
            maxWidth: 330,
            width: '100%',
          }}>
          <BrandLogo />
          <View style={{ gap: 12, width: '100%' }}>
            <GameButton href="/create-room" label="Criar sala" />
            <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
          </View>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            2-8 jogadores · sala temporária · GPS só na partida
          </Text>
        </View>
      </Panel>
    </PrototypeScreen>
  );
}
