import * as Sharing from 'expo-sharing';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { GameButton, GameLinkButton } from '@/src/components/game-button';
import { PrototypeScreen } from '@/src/components/prototype-screen';
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
  const seekerName = result?.seekerNickname ?? seeker?.nickname;
  const winnerName = winner === 'seeker' ? (seekerName ?? t('player.roleLeaderSeeker')) : highlightName;
  const title = t('social.winnerTitle');

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
      <View style={{ alignItems: 'center', gap: 10, maxWidth: 390, width: '100%' }}>
        <View ref={cardRef} collapsable={false} style={{ alignItems: 'center', gap: 10, width: '100%' }}>
          <Image
            contentFit="contain"
            source={require('@/assets/images/logo.png')}
            style={{ height: 238, width: 238 }}
          />
          <SocialShareCard
            highlightAvatar={highlightAvatar.celebrateImage}
            title={title}
            winnerName={winnerName}
          />
        </View>

        {shareError ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '900', textAlign: 'center' }}>
            {shareError}
          </Text>
        ) : null}

        <View style={{ gap: 10, maxWidth: 360, width: '100%' }}>
          <GameButton disabled={isSharing} label={isSharing ? t('social.sharing') : t('social.shareImage')} onPress={handleShareImage} />
          <GameLinkButton href="/result" label={t('social.backToResult')} replace variant="secondary" />
        </View>
      </View>
    </PrototypeScreen>
  );
}
