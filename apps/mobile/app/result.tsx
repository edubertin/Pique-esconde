import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { ActionGrid } from '@/src/components/action-grid';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { avatars } from '@/src/constants/game';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        ...surfaces.glassTile,
        borderRadius: 16,
        flex: 1,
        gap: 4,
        minWidth: 132,
        padding: 12,
      }}>
      <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: '800' }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
        {value}
      </Text>
    </View>
  );
}

export default function ResultScreen() {
  const { error, finalResultSnapshot, leaveRoom, rematch, room } = useRoom();
  const [pendingAction, setPendingAction] = useState<'leave' | 'rematch'>();
  const rematchStartedRef = useRef(false);
  const leaveStartedRef = useRef(false);
  const players = finalResultSnapshot?.players ?? room?.players ?? [];
  const result = finalResultSnapshot?.result ?? room?.result;
  const hasClosedResult = Boolean(result);
  const seeker =
    players.find((player) => player.id === result?.seekerPlayerId) ??
    players.find((player) => player.id === room?.gameSession?.seekerPlayerId) ??
    (!hasClosedResult ? players.find((player) => player.isLeader) : undefined) ??
    (!hasClosedResult ? players[0] : undefined);
  const seekerId = result?.seekerPlayerId ?? seeker?.id;
  const hiders = players.filter((player) => player.id !== seekerId);
  const fallbackHighlight = !hasClosedResult ? (hiders[0] ?? seeker) : undefined;
  const highlightPlayer = players.find((player) => player.id === result?.highlightPlayerId) ?? fallbackHighlight;
  const highlightAvatarId = result?.highlightAvatarId ?? highlightPlayer?.avatarId;
  const highlightAvatar = avatars.find((avatar) => avatar.id === highlightAvatarId) ?? avatars[0];
  const highlightName = result?.highlightNickname ?? highlightPlayer?.nickname ?? t('social.placeholder');
  const winner = result?.winner ?? 'hiders';
  const capturedCount = result?.capturedPlayerIds.length ?? Math.min(2, hiders.length);
  const playerCount = result?.playerCount ?? players.length;
  const seekerName = result?.seekerNickname ?? seeker?.nickname;
  const resultTitle = winner === 'seeker' && seekerName ? t('result.seekerWonBy', { name: seekerName }) : winner === 'seeker' ? t('result.seekerWon') : t('result.hidersWon');
  const highlightReason = winner === 'seeker' ? t('result.highlightSeeker') : t('result.highlightHiders');
  const summary =
    winner === 'seeker'
      ? t('result.summarySeeker', { name: seekerName ?? t('player.roleLeaderSeeker') })
      : t('result.summaryHiders', { name: highlightName });

  if ((!room || room.phase !== 'finished') && !finalResultSnapshot) {
    return null;
  }

  if (!result) {
    return (
      <PrototypeScreen>
        <MenuPanel showBack={false} title={t('result.title')}>
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: '900', textAlign: 'center' }}>
            Fechando resultado...
          </Text>
        </MenuPanel>
      </PrototypeScreen>
    );
  }

  const handleRematch = () => {
    if (rematchStartedRef.current) return;

    rematchStartedRef.current = true;
    setPendingAction('rematch');
    rematch()
      .catch(() => {
        // The room store surfaces the error if cleanup fails.
      })
      .finally(() => {
        rematchStartedRef.current = false;
        setPendingAction(undefined);
      });
  };

  const handleLeaveRoom = () => {
    if (leaveStartedRef.current) return;

    leaveStartedRef.current = true;
    setPendingAction('leave');
    leaveRoom()
      .catch(() => {
        // The room store surfaces the error if cleanup fails.
      })
      .finally(() => {
        leaveStartedRef.current = false;
        setPendingAction(undefined);
      });
  }

  return (
    <PrototypeScreen>
      <MenuPanel
        showBack={false}
        title={t('result.title')}
        actions={
          <>
            <GameButton
              disabled={Boolean(pendingAction)}
              label={pendingAction === 'rematch' ? 'Sincronizando...' : t('result.playAgain')}
              onPress={handleRematch}
            />
            <ActionGrid
              actions={[
                {
                  disabled: Boolean(pendingAction),
                  label: pendingAction === 'leave' ? 'Saindo...' : t('common.exit'),
                  onPress: handleLeaveRoom,
                  variant: 'danger',
                },
                { disabled: Boolean(pendingAction), href: '/social-card', label: t('common.share'), variant: 'ghost' },
              ]}
            />
          </>
        }>
        <View
          style={{
            alignItems: 'center',
            ...surfaces.highlightTile,
            borderRadius: 22,
            gap: 12,
            padding: 18,
          }}>
          <Badge label={t('result.winner')} tone="leader" />
          <View
            style={{
              alignItems: 'center',
              height: 144,
              justifyContent: 'center',
              width: 144,
            }}>
            <Image contentFit="contain" source={highlightAvatar.celebrateImage} style={{ height: 142, width: 142 }} />
          </View>
          <Text selectable style={{ color: colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
            {resultTitle}
          </Text>
          <Badge label={highlightReason} tone="ready" />
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: '700', lineHeight: 22, textAlign: 'center' }}>
            {summary}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <ResultStat label={t('result.time')} value={result?.durationLabel ?? '3min'} />
          <ResultStat label={t('result.players')} value={`${playerCount || 4}`} />
          <ResultStat label={t('result.captured')} value={`${capturedCount}`} />
          <ResultStat
            label={winner === 'seeker' ? t('result.seeker') : t('result.highlight')}
            value={winner === 'seeker' ? (seekerName ?? t('player.roleLeaderSeeker')) : highlightName}
          />
        </View>

        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '900', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
