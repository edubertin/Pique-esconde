import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton, GameLinkButton } from '@/src/components/game-button';
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

export default function CreateRoomScreen() {
  const router = useRouter();
  const { createRoom, error, isLoading } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_01');
  const [nickname, setNickname] = useState('Dudu');

  const handleSelectAvatar = (nextAvatarId: string) => {
    setAvatarId(nextAvatarId);
  };

  const handleCreateRoom = async () => {
    try {
      await createRoom({ avatarId, nickname });
      router.push('/location-permission');
    } catch {
      // Error is shown from room store state.
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        title={t('create.title')}
        actions={
          <>
            <GameButton label={isLoading ? 'Criando...' : t('create.createRoom')} onPress={handleCreateRoom} />
            <GameLinkButton href="/join-room" label={t('create.joinWithCode')} variant="secondary" />
          </>
        }>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Badge label={t('create.badge')} tone="rush" />
        </View>

        <View style={{ gap: 10, width: '100%' }}>
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
        </View>

        <AvatarChoice onSelect={handleSelectAvatar} selectedId={avatarId} />

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
            {t('common.playersRange')}
          </Text>
        </View>
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
