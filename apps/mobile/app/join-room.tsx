import { TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function JoinRoomScreen() {
  return (
    <PrototypeScreen title="Entrar na sala" subtitle="Use o código ou abra pelo link enviado pelo grupo.">
      <Panel>
        <TextInput
          placeholder="Código da sala"
          placeholderTextColor={colors.muted}
          value="ABCD"
          style={{
            borderColor: colors.line,
            borderRadius: 14,
            borderWidth: 1,
            color: colors.ink,
            fontSize: 18,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            letterSpacing: 0,
            padding: 14,
            textAlign: 'center',
          }}
        />
        <TextInput
          placeholder="Seu apelido"
          placeholderTextColor={colors.muted}
          value="Ana"
          style={{
            borderColor: colors.line,
            borderRadius: 14,
            borderWidth: 1,
            color: colors.ink,
            fontSize: 16,
            padding: 14,
          }}
        />
        <AvatarChoice selectedId="avatar_02" />
        <GameButton href="/location-permission" label="Entrar" />
      </Panel>
    </PrototypeScreen>
  );
}
