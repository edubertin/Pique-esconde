import { TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function CreateRoomScreen() {
  return (
    <PrototypeScreen
      title="Criar sala"
      subtitle="Defina seu apelido e avatar. Quem cria a sala começa como procurador.">
      <Panel>
        <TextInput
          placeholder="Seu apelido"
          placeholderTextColor={colors.muted}
          value="Dudu"
          style={{
            borderColor: colors.line,
            borderRadius: 14,
            borderWidth: 1,
            color: colors.ink,
            fontSize: 16,
            padding: 14,
          }}
        />
        <AvatarChoice selectedId="avatar_01" />
        <GameButton href="/location-permission" label="Criar sala" />
      </Panel>
    </PrototypeScreen>
  );
}
