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
      <Panel>
        <View style={{ alignItems: 'center', gap: 16, paddingVertical: 16 }}>
          <BrandLogo />
          <Text selectable style={{ color: colors.muted, fontSize: 15, textAlign: 'center' }}>
            Protótipo sem GPS real para validar o fluxo antes do realtime.
          </Text>
        </View>
        <GameButton href="/create-room" label="Criar sala" />
        <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
