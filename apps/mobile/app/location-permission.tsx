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
import { enableDevGps, isDevGpsAvailable } from '@/src/utils/dev-gps';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { activePlayer, addDevTargetPlayer, leaveRoom, room } = useRoom();
  const [error, setError] = useState<string>();
  const [isDevRequesting, setIsDevRequesting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const canUseDevGps = isDevGpsAvailable();

  const handleLeaveRoom = async (destination: '/' | '/create-room') => {
    if (room) await leaveRoom().catch(() => undefined);
    router.replace(destination);
  };

  const handleAllow = async () => {
    setError(undefined);
    setIsRequesting(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setIsRequesting(false);
        if (permission.status === Location.PermissionStatus.DENIED && !permission.canAskAgain && room) {
          await leaveRoom().catch(() => undefined);
          router.replace('/');
          return;
        }
        setError(permission.canAskAgain ? 'Toque novamente para permitir a localizacao.' : t('location.denied'));
        return;
      }

      router.push(room ? '/lobby' : '/create-room');
    } catch {
      setIsRequesting(false);
      setError(t('location.denied'));
    }
  };

  const handleUseDevGps = async () => {
    setError(undefined);
    setIsDevRequesting(true);

    try {
      enableDevGps();

      if (room && activePlayer?.isLeader && room.players.length < 2) {
        await addDevTargetPlayer();
      }

      router.push(room ? '/lobby' : '/create-room');
    } catch {
      setError('Nao foi possivel preparar o ambiente DEV GPS.');
    } finally {
      setIsDevRequesting(false);
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        onBack={() => handleLeaveRoom('/create-room')}
        title={t('location.title')}
        actions={
          <>
            <GameButton label={isRequesting ? t('location.requesting') : t('location.allow')} onPress={handleAllow} />
            {canUseDevGps ? (
              <GameButton
                disabled={isDevRequesting}
                label={isDevRequesting ? 'Preparando DEV...' : 'Usar GPS DEV'}
                onPress={handleUseDevGps}
                variant="secondary"
              />
            ) : null}
            <GameButton label={t('common.cancel')} onPress={() => handleLeaveRoom('/')} variant="danger" />
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
          <Text selectable style={{ color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>
            {t('location.safety')}
          </Text>
          {canUseDevGps ? (
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', lineHeight: 18, textAlign: 'center' }}>
              DEV: libera o lobby sem GPS real e cria um alvo pronto para calibrar radar/captura.
            </Text>
          ) : null}
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
