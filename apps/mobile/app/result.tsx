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
  const seeker = players.find((player) => player.isLeader) ?? players[0];
  const hiders = players.filter((player) => player.id !== seeker?.id);
  const fallbackHighlight = hiders[0] ?? seeker;
  const highlightPlayer = players.find((player) => player.id === room?.result?.highlightPlayerId) ?? fallbackHighlight;
  const highlightAvatar = avatars.find((avatar) => avatar.id === highlightPlayer?.avatarId) ?? avatars[0];
  const winner = room?.result?.winner ?? 'hiders';
  const survivorCount = room?.result?.survivorPlayerIds.length ?? Math.max(1, hiders.length - 2);
  const capturedCount = room?.result?.capturedPlayerIds.length ?? Math.min(2, hiders.length);
  const resultTitle = winner === 'seeker' ? t('result.seekerWon') : t('result.hidersWon');
  const highlightReason = winner === 'seeker' ? t('result.highlightSeeker') : t('result.highlightHiders');
  const summary =
    winner === 'seeker'
      ? t('result.summarySeeker', { name: highlightPlayer?.nickname ?? t('player.roleSeeker') })
      : t('result.summaryHiders', { name: highlightPlayer?.nickname ?? t('social.placeholder') });

  const handleRematch = () => {
    rematch();
    router.push('/lobby');
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/seeker-radar"
        title={t('result.title')}
        meta={<Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: '800' }}>{t('result.finalMeta')}</Text>}
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
              backgroundColor: highlightAvatar.color,
              borderColor: colors.esconde,
              borderRadius: 64,
              borderWidth: 5,
              height: 128,
              justifyContent: 'center',
              overflow: 'hidden',
              width: 128,
            }}>
            <Image contentFit="contain" source={highlightAvatar.celebrateImage} style={{ height: 118, width: 118 }} />
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
          <ResultStat label={t('result.time')} value={room?.result?.durationLabel ?? '3min'} />
          <ResultStat label={t('result.players')} value={`${players.length || 4}`} />
          <ResultStat label={t('result.captured')} value={`${capturedCount}`} />
          <ResultStat
            label={winner === 'seeker' ? t('result.seeker') : t('result.survived')}
            value={winner === 'seeker' ? (highlightPlayer?.nickname ?? '-') : `${survivorCount}`}
          />
        </View>

        <View
          style={{
            ...surfaces.warningTile,
            borderRadius: 16,
            padding: 14,
          }}>
          <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 21, textAlign: 'center' }}>
            {t('result.summary', { summary })}
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
