import { Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  return (
    <PrototypeScreen
      kicker="MVP navegável"
      title="Pique Esconde"
      subtitle="Crie uma sala, chame a galera e use o celular para voltar ao mundo físico.">
      <Panel>
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 16 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: '900' }}>
            Esconda. Marque. Corra.
          </Text>
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
