import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const codeLength = 4;

const styles = StyleSheet.create({
  field: {
    gap: 10,
    width: '100%',
  },
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
  codeInput: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
});

function normalizeRoomCode(nextCode: string) {
  return nextCode.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, codeLength);
}

export default function JoinRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { error, isLoading, joinRoom, leaveRoom, room } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_02');
  const [code, setCode] = useState(normalizeRoomCode(params.code ?? 'ABCD'));
  const [nickname, setNickname] = useState('Ana');

  useEffect(() => {
    if (params.code) {
      setCode(normalizeRoomCode(params.code));
    }
  }, [params.code]);

  const handleBack = async () => {
    if (room) await leaveRoom().catch(() => undefined);
    router.replace('/');
  };

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
      <MenuPanel tone="glass" onBack={handleBack} title={t('join.title')} actions={<GameButton label={isLoading ? 'Entrando...' : t('join.enter')} onPress={handleJoinRoom} />}>
        <View style={styles.field}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
            {t('join.code')}
          </Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={codeLength}
            onChangeText={(nextCode) => setCode(normalizeRoomCode(nextCode))}
            placeholder={t('join.code')}
            placeholderTextColor={colors.muted}
            returnKeyType="next"
            selectTextOnFocus
            textContentType="none"
            value={code}
            style={[styles.input, styles.codeInput]}
          />
        </View>
        <View style={styles.field}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
            {t('create.nickname')}
          </Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setNickname}
            placeholder={t('create.nickname')}
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            selectTextOnFocus
            value={nickname}
            style={styles.input}
          />
          {error ? (
            <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
        </View>
        <AvatarChoice onSelect={handleSelectAvatar} selectedId={avatarId} />
      </MenuPanel>
    </PrototypeScreen>
  );
}
