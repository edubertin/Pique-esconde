import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { ignoreStoredRoomSessionOnce } from '@/src/utils/room-session-storage';
import { claimActiveSession, releaseActiveSessionClaim } from '@/src/utils/session-tab-lock';

export function SessionConflictGuard() {
  const router = useRouter();
  const { abandonLocalSession, activePlayer, room } = useRoom();
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || !room?.id || !activePlayer?.id) {
      setHasConflict(false);
      return undefined;
    }

    const checkClaim = () => {
      setHasConflict(!claimActiveSession(room.id, activePlayer.id));
    };

    checkClaim();
    const interval = setInterval(checkClaim, 2000);
    const releaseClaim = () => releaseActiveSessionClaim(room.id, activePlayer.id);

    window.addEventListener('beforeunload', releaseClaim);
    window.addEventListener('pagehide', releaseClaim);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', releaseClaim);
      window.removeEventListener('pagehide', releaseClaim);
      releaseClaim();
    };
  }, [activePlayer?.id, room?.id]);

  const handleEnterAsAnotherPlayer = () => {
    const roomCode = room?.code;
    if (room?.id && activePlayer?.id) {
      releaseActiveSessionClaim(room.id, activePlayer.id);
    }
    ignoreStoredRoomSessionOnce();
    abandonLocalSession();

    if (typeof window !== 'undefined') {
      window.location.assign(roomCode ? `/join-room?code=${encodeURIComponent(roomCode)}` : '/join-room');
      return;
    }

    router.replace(roomCode ? { pathname: '/join-room', params: { code: roomCode } } : '/join-room');
  };

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
      return;
    }

    setHasConflict(false);
  };

  if (!hasConflict) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(7, 26, 61, 0.68)',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        padding: 20,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 20,
      }}>
      <Panel tone="strong">
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
          {t('sessionConflict.title')}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: '700', lineHeight: 20, textAlign: 'center' }}>
          {t('sessionConflict.body')}
        </Text>
        <View style={{ gap: 10, width: '100%' }}>
          <GameButton label={t('sessionConflict.enterAsAnother')} onPress={handleEnterAsAnotherPlayer} variant="secondary" />
          <GameButton label={t('sessionConflict.refresh')} onPress={handleRefresh} variant="ghost" />
        </View>
      </Panel>
    </View>
  );
}
