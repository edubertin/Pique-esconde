import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const { leaveRoom, rematch, room } = useRoom();
  const players = room?.players ?? [];
  const result = room?.result;
  const seeker =
    players.find((player) => player.id === result?.seekerPlayerId) ??
    players.find((player) => player.id === room?.gameSession?.seekerPlayerId) ??
    players.find((player) => player.isLeader) ??
    players[0];
  const seekerId = result?.seekerPlayerId ?? seeker?.id;
  const hiders = players.filter((player) => player.id !== seekerId);
  const fallbackHighlight = hiders[0] ?? seeker;
  const highlightPlayer = players.find((player) => player.id === result?.highlightPlayerId) ?? fallbackHighlight;
  const highlightAvatarId = result?.highlightAvatarId ?? highlightPlayer?.avatarId;
  const highlightAvatar = avatars.find((avatar) => avatar.id === highlightAvatarId) ?? avatars[0];
  const highlightName = result?.highlightNickname ?? highlightPlayer?.nickname ?? t('social.placeholder');
  const winner = result?.winner ?? 'hiders';
  const capturedCount = result?.capturedPlayerIds.length ?? Math.min(2, hiders.length);
  const seekerName = result?.seekerNickname ?? seeker?.nickname ?? t('player.roleLeaderSeeker');
  const resultTitle = winner === 'seeker' ? t('result.seekerWonBy', { name: seekerName }) : t('result.hidersWon');
  const highlightReason = winner === 'seeker' ? t('result.highlightSeeker') : t('result.highlightHiders');
  const summary =
    winner === 'seeker'
      ? t('result.summarySeeker', { name: seekerName })
      : t('result.summaryHiders', { name: highlightName });

  const handleRematch = async () => {
    try {
      await rematch();
      router.push('/lobby');
    } catch {
      // Keep result visible if the room cannot sync.
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      router.replace('/');
    } catch {
      // Keep result visible if the room cannot sync.
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        showBack={false}
        title={t('result.title')}
        actions={
          <>
            <GameButton label={t('result.playAgain')} onPress={handleRematch} />
            <ActionGrid
              actions={[
                { label: t('common.exit'), onPress: handleLeaveRoom, variant: 'danger' },
                { href: '/social-card', label: t('common.share'), variant: 'ghost' },
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
              height: 176,
              justifyContent: 'center',
              width: 176,
            }}>
            <Image contentFit="contain" source={highlightAvatar.celebrateImage} style={{ height: 174, width: 174 }} />
          </View>
          <Text selectable style={{ color: colors.ink, fontSize: 30, fontWeight: '900', textAlign: 'center' }}>
            {resultTitle}
          </Text>
          <Badge label={highlightReason} tone="ready" />
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: '700', lineHeight: 22, textAlign: 'center' }}>
            {summary}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <ResultStat label={t('result.time')} value={result?.durationLabel ?? '3min'} />
          <ResultStat label={t('result.players')} value={`${players.length || 4}`} />
          <ResultStat label={t('result.captured')} value={`${capturedCount}`} />
          <ResultStat
            label={winner === 'seeker' ? t('result.seeker') : t('result.highlight')}
            value={winner === 'seeker' ? seekerName : highlightName}
          />
        </View>

      </MenuPanel>
    </PrototypeScreen>
  );
}
