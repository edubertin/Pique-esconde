import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
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
    backgroundColor: 'rgba(221, 244, 255, 0.78)',
    borderColor: colors.navy,
    borderRadius: 16,
    borderWidth: 2,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    minHeight: 56,
    padding: 14,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 5px 0 rgba(7, 26, 61, 0.10)' }
      : {
          elevation: 2,
          shadowColor: colors.navy,
          shadowOffset: { height: 3, width: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }),
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
  const { error, isLoading, joinRoom } = useRoom();
  const [avatarId, setAvatarId] = useState('avatar_02');
  const [code, setCode] = useState(normalizeRoomCode(params.code ?? 'ABCD'));
  const [nickname, setNickname] = useState('Ana');

  useEffect(() => {
    if (params.code) {
      setCode(normalizeRoomCode(params.code));
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
        </View>
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
