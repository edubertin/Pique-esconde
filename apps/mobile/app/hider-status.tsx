import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { PrototypeScreen } from '@/src/components/prototype-screen';
import { usePlayerLocationSync } from '@/src/hooks/use-player-location-sync';
import { useSafeRouter } from '@/src/hooks/use-safe-router';
import { t } from '@/src/i18n';
import { type HiderDangerHint, useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';
import { formatTimer } from '@/src/utils/format-timer';

export default function HiderStatusScreen() {
  const router = useSafeRouter();
  const { activePlayer, getHiderDangerHint, leaveRoom, room, tickGameSession } = useRoom();
  const [dangerHint, setDangerHint] = useState<HiderDangerHint>();
  const [now, setNow] = useState(Date.now());
  const pulse = useRef(new Animated.Value(1)).current;
  const tickRequestedRef = useRef(false);
  const seekEndsAt = room?.gameSession?.seekEndsAt;
  const seekerName =
    room?.players.find((player) => player.id === room.gameSession?.seekerPlayerId)?.nickname ??
    room?.players.find((player) => player.isLeader)?.nickname ??
    t('player.roleLeaderSeeker');
  const remainingSeconds = seekEndsAt ? (seekEndsAt - now) / 1000 : 0;
  const timerLabel = seekEndsAt ? formatTimer(remainingSeconds) : t('hiderStatus.timerEnded');
  const dangerLevel = dangerHint?.signalStatus === 'fresh' ? dangerHint.level : 'calm';
  const heartColor = dangerLevel === 'danger' ? colors.pink : dangerLevel === 'near' ? colors.yellow : colors.blue;
  const heartLabel = dangerLevel === 'danger' ? t('hiderStatus.danger') : dangerLevel === 'near' ? t('hiderStatus.near') : t('hiderStatus.calm');
  usePlayerLocationSync(Boolean(room?.phase === 'seeking' && activePlayer));

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (room?.phase !== 'seeking' || !seekEndsAt || remainingSeconds > 0 || tickRequestedRef.current) return;

    tickRequestedRef.current = true;
    tickGameSession().catch(() => {
      tickRequestedRef.current = false;
    });
  }, [remainingSeconds, room?.phase, seekEndsAt, tickGameSession]);

  useEffect(() => {
    if (room?.phase !== 'seeking') return undefined;

    let cancelled = false;
    const refreshDanger = () => {
      getHiderDangerHint()
        .then((hint) => {
          if (!cancelled && hint) setDangerHint(hint);
        })
        .catch(() => undefined);
    };

    refreshDanger();
    const interval = setInterval(refreshDanger, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [getHiderDangerHint, room?.phase]);

  useEffect(() => {
    const duration = dangerLevel === 'danger' ? 360 : dangerLevel === 'near' ? 620 : 950;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration, toValue: dangerLevel === 'calm' ? 1.08 : 1.18, useNativeDriver: true }),
        Animated.timing(pulse, { duration, toValue: 1, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [dangerLevel, pulse]);

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      router.replace('/');
    } catch {
      // Error is shown from room store state.
    }
  };

  return (
    <PrototypeScreen>
      <View style={{ alignItems: 'center', gap: 18, maxWidth: 430, minHeight: '100%', width: '100%' }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 28, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
            {timerLabel}
          </Text>
          <Badge label={t('hiderStatus.title')} tone="waiting" />
        </View>

        <View
          style={{
            ...surfaces.glassTile,
            alignItems: 'center',
            borderRadius: 28,
            gap: 14,
            justifyContent: 'center',
            minHeight: 420,
            padding: 22,
            width: '100%',
          }}>
          <Animated.View
            style={{
              alignItems: 'center',
              backgroundColor: `${heartColor}22`,
              borderColor: heartColor,
              borderRadius: 999,
              borderWidth: 4,
              height: 220,
              justifyContent: 'center',
              transform: [{ scale: pulse }],
              width: 220,
            }}>
            <Ionicons color={heartColor} name="heart" size={132} />
          </Animated.View>
          <Text selectable style={{ color: colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
            {heartLabel}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, fontWeight: '800', lineHeight: 22, textAlign: 'center' }}>
            {t('hiderStatus.surviveText', { name: seekerName })}
          </Text>
        </View>

        <Badge label={t('hiderStatus.released', { name: seekerName })} tone="waiting" />
        <GameButton label={t('common.exit')} onPress={handleLeaveRoom} variant="danger" />
      </View>
    </PrototypeScreen>
  );
}
