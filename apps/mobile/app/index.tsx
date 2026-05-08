import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  return (
    <PrototypeScreen
      subtitle="Crie uma sala, chame a galera e use o celular para voltar ao mundo físico.">
      <View style={{ alignItems: 'center', gap: 16, maxWidth: 520, width: '100%' }}>
        <BrandLogo />
      </View>
      <Panel>
        <GameButton href="/create-room" label="Criar sala" />
        <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
        <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
          2-8 jogadores · sala temporária · GPS só na partida
        </Text>
      </Panel>
    </PrototypeScreen>
  );
}
