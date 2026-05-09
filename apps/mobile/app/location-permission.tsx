import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { room } = useRoom();
  const [error, setError] = useState<string>();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    setError(undefined);
    setIsRequesting(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setIsRequesting(false);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setError(t('location.denied'));
        return;
      }

      router.push(room ? '/lobby' : '/create-room');
    } catch {
      setIsRequesting(false);
      setError(t('location.denied'));
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/create-room"
        title={t('location.title')}
        actions={
          <>
            <GameButton label={isRequesting ? t('location.requesting') : t('location.allow')} onPress={handleAllow} />
            <GameButton href="/" label={t('common.cancel')} variant="danger" />
          </>
        }>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Badge label={t('location.badge')} tone="ready" />
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900', lineHeight: 25, textAlign: 'center' }}>
            {t('location.summary')}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>
            {t('location.body')}
          </Text>
          {error ? (
            <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
