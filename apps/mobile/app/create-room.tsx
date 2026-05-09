import { Text, TextInput, View } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

const inputStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.navy,
  borderRadius: 16,
  borderWidth: 2,
  color: colors.ink,
  fontSize: 16,
  minHeight: 56,
  padding: 14,
};

export default function CreateRoomScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        title="Criar partida"
        actions={
          <>
            <GameButton href="/location-permission" label="Criar sala" />
            <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
          </>
        }>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Badge label="Nova sala" tone="rush" />
        </View>

        <View style={{ gap: 10, width: '100%' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
            Seu apelido
          </Text>
          <TextInput placeholder="Seu apelido" placeholderTextColor={colors.muted} value="Dudu" style={inputStyle} />
        </View>

        <AvatarChoice selectedId="avatar_01" />

        <View
          style={{
            backgroundColor: colors.esconde,
            borderColor: colors.lime,
            borderRadius: 16,
            borderWidth: 2,
            gap: 8,
            padding: 12,
            width: '100%',
          }}>
          <Text selectable style={{ color: colors.navy, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
            2-8 jogadores
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
