import { Text, TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

const inputStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.line,
  borderRadius: 16,
  borderWidth: 2,
  color: colors.ink,
  fontSize: 16,
  minHeight: 56,
  padding: 14,
};

export default function JoinRoomScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        title="Entrar na sala"
        actions={<GameButton href="/location-permission" label="Entrar" />}>
        <Badge label="Sala temporária" tone="neutral" />
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
          Código da sala
        </Text>
        <TextInput
          placeholder="Código da sala"
          placeholderTextColor={colors.muted}
          value="ABCD"
          style={{
            ...inputStyle,
            fontSize: 22,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            textAlign: 'center',
          }}
        />
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
          Seu apelido
        </Text>
        <TextInput placeholder="Seu apelido" placeholderTextColor={colors.muted} value="Ana" style={inputStyle} />
        <AvatarChoice selectedId="avatar_02" />
      </MenuPanel>
    </PrototypeScreen>
  );
}
