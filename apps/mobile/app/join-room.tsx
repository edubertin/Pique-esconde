import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const inputStyle = {
  backgroundColor: 'rgba(221, 244, 255, 0.78)',
  borderColor: colors.navy,
  borderRadius: 16,
  borderWidth: 2,
  boxShadow: '0 5px 0 rgba(7, 26, 61, 0.10)',
  color: colors.ink,
  fontSize: 16,
  fontWeight: '800' as const,
  minHeight: 56,
  padding: 14,
};

export default function JoinRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { error, isLoading, joinRoom } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_02');
  const [code, setCode] = useState(params.code?.toUpperCase() ?? 'ABCD');
  const [nickname, setNickname] = useState('Ana');

  useEffect(() => {
    if (params.code) {
      setCode(params.code.toUpperCase());
    }
  }, [params.code]);

  const handleSelectAvatar = (nextAvatarId: string) => {
    setAvatarId(nextAvatarId);
  };

  const handleJoinRoom = async () => {
    try {
      await joinRoom({ avatarId, code, nickname });
      router.push('/location-permission');
    } catch {
      // Error is shown from room store state.
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel title={t('join.title')} actions={<GameButton label={isLoading ? 'Entrando...' : t('join.enter')} onPress={handleJoinRoom} />}>
        <Badge label={t('join.badge')} tone="neutral" />
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
          {t('join.code')}
        </Text>
        <TextInput
          placeholder={t('join.code')}
          placeholderTextColor={colors.muted}
          onChangeText={(nextCode) => setCode(nextCode.toUpperCase())}
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
          {t('create.nickname')}
        </Text>
        <TextInput
          onChangeText={setNickname}
          placeholder={t('create.nickname')}
          placeholderTextColor={colors.muted}
          value={nickname}
          style={inputStyle}
        />
        <AvatarChoice onSelect={handleSelectAvatar} selectedId={avatarId} />
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
