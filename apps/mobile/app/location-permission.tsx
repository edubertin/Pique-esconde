import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function LocationPermissionScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/create-room"
        title="Localização"
        actions={
          <>
            <GameButton href="/lobby" label="Permitir localização" />
            <GameButton href="/" label="Agora não" variant="danger" />
          </>
        }>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Badge label="Só durante a partida" tone="ready" />
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900', lineHeight: 25, textAlign: 'center' }}>
            Usamos sua localização para calcular radar e capturas.
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>
            Não mostramos seu ponto exato para outros jogadores e não compartilhamos GPS em redes sociais.
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
