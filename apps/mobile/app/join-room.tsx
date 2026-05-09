import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { useRoom } from '@/src/state/room-store';
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
  const router = useRouter();
  const { joinRoom } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_02');
  const [code, setCode] = useState('ABCD');
  const [nickname, setNickname] = useState('Ana');

  const handleSelectAvatar = (nextAvatarId: string) => {
    setAvatarId(nextAvatarId);
  };

  const handleJoinRoom = () => {
    joinRoom({ avatarId, code, nickname });
    router.push('/location-permission');
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        title="Entrar na sala"
        actions={<GameButton label="Entrar" onPress={handleJoinRoom} />}>
        <Badge label="Sala temporária" tone="neutral" />
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
          Código da sala
        </Text>
        <TextInput
          placeholder="Código da sala"
          placeholderTextColor={colors.muted}
          onChangeText={setCode}
          value={code}
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
        <TextInput
          onChangeText={setNickname}
          placeholder="Seu apelido"
          placeholderTextColor={colors.muted}
          value={nickname}
          style={inputStyle}
        />
        <AvatarChoice onSelect={handleSelectAvatar} selectedId={avatarId} />
      </MenuPanel>
    </PrototypeScreen>
  );
}
