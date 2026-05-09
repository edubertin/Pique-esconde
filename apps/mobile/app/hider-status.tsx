import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function HiderStatusScreen() {
  const router = useRouter();
  const { activePlayer, room } = useRoom();

  useEffect(() => {
    if (!room) {
      router.replace('/');
      return;
    }

    if (activePlayer?.status === 'Capturado') {
      router.replace('/capture');
      return;
    }

    if (room.phase === 'finished') {
      router.replace('/result');
      return;
    }

    if (activePlayer?.isLeader) {
      router.replace('/seeker-radar');
    }
  }, [activePlayer?.isLeader, activePlayer?.status, room, router]);

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/hide-phase"
        title={t('hiderStatus.title')}
        actions={<GameButton href="/lobby" label={t('common.exit')} variant="danger" />}>
        <Badge label={t('hiderStatus.released')} tone="waiting" />
        <Text selectable style={{ color: colors.ink, fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
          {t('hiderStatus.timer')}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          {t('hiderStatus.radarIncreasing')}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          {t('hiderStatus.surviveText')}
        </Text>
      </MenuPanel>
    </PrototypeScreen>
  );
}
