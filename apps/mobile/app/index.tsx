import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  return (
    <PrototypeScreen
      kicker="MVP navegável"
      title="Vamos brincar lá fora"
      subtitle="Crie uma sala, chame a galera e use o celular para voltar ao mundo físico.">
      <Panel tone="strong">
        <View style={{ alignItems: 'center', gap: 14, paddingVertical: 10 }}>
          <BrandLogo />
          <Text selectable style={{ color: colors.surface, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>
            Protótipo navegável para validar menu, lobby e radar antes do GPS real.
          </Text>
        </View>
      </Panel>
      <Panel>
        <GameButton href="/create-room" label="Criar sala" />
        <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
