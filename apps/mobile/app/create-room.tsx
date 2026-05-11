import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { GameButton, GameLinkButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    minHeight: 52,
    padding: 14,
  },
});

export default function CreateRoomScreen() {
  const router = useRouter();
  const { createRoom, error, isLoading } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_01');
  const [isFocused, setIsFocused] = useState(false);
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
        tone="glass"
        title={t('create.title')}
        actions={
          <>
            <GameButton label={isLoading ? t('create.creating') : t('create.createRoom')} onPress={handleCreateRoom} />
            <GameLinkButton href="/join-room" label={t('create.joinWithCode')} variant="secondary" />
          </>
        }>
        <View style={{ gap: 10, width: '100%' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
            {t('create.nickname')}
          </Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            onBlur={() => setIsFocused(false)}
            onChangeText={setNickname}
            onFocus={() => setIsFocused(true)}
            placeholder={t('create.nickname')}
            placeholderTextColor="rgba(7, 26, 61, 0.40)"
            returnKeyType="done"
            selectTextOnFocus
            value={nickname}
            style={[
              styles.input,
              isFocused && {
                borderColor: colors.pink,
                borderWidth: 2,
                ...(Platform.OS === 'web' ? { boxShadow: '0 0 0 3px rgba(255, 45, 141, 0.18)' } : {}),
              },
            ]}
          />
        </View>

        <AvatarChoice onSelect={handleSelectAvatar} selectedId={avatarId} />

        <Text selectable style={{ color: 'rgba(7, 26, 61, 0.70)', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
          {t('common.playersRange')}
        </Text>
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
