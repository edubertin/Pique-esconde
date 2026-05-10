import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { GameButton, GameLinkButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { SocialShareCard } from '@/src/components/social-share-card';
import { avatars } from '@/src/constants/game';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function SocialCardScreen() {
  const { finalResultSnapshot, room } = useRoom();
  const cardRef = useRef<View>(null);
  const [shareError, setShareError] = useState<string>();
  const [isSharing, setIsSharing] = useState(false);
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
  const survivorCount = result?.survivorPlayerIds.length ?? Math.max(1, hiders.length - 2);
  const capturedCount = result?.capturedPlayerIds.length ?? Math.min(2, hiders.length);
  const playerCount = result?.playerCount ?? players.length;
  const seekerName = result?.seekerNickname ?? seeker?.nickname;
  const title = winner === 'seeker' ? t('social.titleSeeker', { name: seekerName ?? t('player.roleLeaderSeeker') }) : t('social.titleHiders');
  const highlightLabel = winner === 'seeker' ? t('social.highlightSeeker') : t('social.highlightHiders');
  const time = result?.durationLabel ?? '3min';
  const score =
    winner === 'seeker'
      ? t('social.scoreSeeker', { name: seekerName ?? t('player.roleLeaderSeeker'), time })
      : t('social.scoreHiders', { count: survivorCount, suffix: survivorCount === 1 ? '' : 's', time });

  const handleShareImage = async () => {
    if (!cardRef.current || isSharing) return;

    setIsSharing(true);
    setShareError(undefined);

    try {
      if (process.env.EXPO_OS === 'web') {
        throw new Error(t('social.shareUnavailable'));
      }

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        throw new Error(t('social.shareUnavailable'));
      }

      const imageUri = await captureRef(cardRef, {
        format: 'png',
        height: 1920,
        quality: 1,
        result: 'tmpfile',
        width: 1080,
      });

      await Sharing.shareAsync(imageUri, {
        dialogTitle: t('social.shareImage'),
        mimeType: 'image/png',
      });
    } catch (error) {
      setShareError(error instanceof Error ? error.message : t('social.shareError'));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/result"
        title={t('social.title')}
        actions={
          <>
            <GameButton disabled={isSharing} label={isSharing ? t('social.sharing') : t('social.shareImage')} onPress={handleShareImage} />
            <GameLinkButton href="/result" label={t('social.backToResult')} replace variant="ghost" />
          </>
        }>
        <View ref={cardRef} collapsable={false} style={{ alignSelf: 'center', maxWidth: 360, width: '100%' }}>
          <SocialShareCard
            capturedCount={capturedCount}
            highlightAvatar={highlightAvatar.celebrateImage}
            highlightLabel={highlightLabel}
            highlightName={highlightName}
            playerCount={playerCount}
            score={score}
            time={time}
            title={title}
            winnerLabel={t('result.winner')}
          />
        </View>

        {shareError ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '900', textAlign: 'center' }}>
            {shareError}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
