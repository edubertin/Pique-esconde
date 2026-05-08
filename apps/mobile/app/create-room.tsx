import { Text, TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
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

export default function CreateRoomScreen() {
  return (
    <PrototypeScreen
      title="Criar sala"
      subtitle="Defina sua identidade na rodada. Quem cria a sala começa como procurador.">
      <Panel>
        <Badge label="Você será o procurador" tone="leader" />
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
          Seu apelido
        </Text>
        <TextInput placeholder="Seu apelido" placeholderTextColor={colors.muted} value="Dudu" style={inputStyle} />
        <AvatarChoice selectedId="avatar_01" />
        <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
          A localização será solicitada antes de entrar como jogador ativo.
        </Text>
        <GameButton href="/location-permission" label="Criar sala" />
      </Panel>
    </PrototypeScreen>
  );
}
