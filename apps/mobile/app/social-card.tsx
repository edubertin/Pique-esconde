import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { avatars } from '@/src/constants/game';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function SocialCardScreen() {
  const { room } = useRoom();
  const players = room?.players ?? [];
  const seeker = players.find((player) => player.isLeader) ?? players[0];
  const hiders = players.filter((player) => player.id !== seeker?.id);
  const fallbackHighlight = hiders[0] ?? seeker;
  const highlightPlayer = players.find((player) => player.id === room?.result?.highlightPlayerId) ?? fallbackHighlight;
  const highlightAvatar = avatars.find((avatar) => avatar.id === highlightPlayer?.avatarId) ?? avatars[0];
  const winner = room?.result?.winner ?? 'hiders';
  const survivorCount = room?.result?.survivorPlayerIds.length ?? Math.max(1, hiders.length - 2);
  const seekerName = seeker?.nickname ?? t('player.roleLeaderSeeker');
  const title = winner === 'seeker' ? t('social.titleSeeker', { name: seekerName }) : t('social.titleHiders');
  const highlightLabel = winner === 'seeker' ? t('social.highlightSeeker') : t('social.highlightHiders');
  const time = room?.result?.durationLabel ?? '3min';
  const score =
    winner === 'seeker'
      ? t('social.scoreSeeker', { name: seekerName, time })
      : t('social.scoreHiders', { count: survivorCount, suffix: survivorCount === 1 ? '' : 's', time });

  return (
    <PrototypeScreen>
      <MenuPanel backHref="/result" title={t('social.title')} actions={<GameButton href="/lobby" label={t('social.backToRoom')} />}>
        <View
          style={{
            alignItems: 'center',
            ...surfaces.highlightTile,
            borderRadius: 24,
            gap: 14,
            padding: 18,
          }}>
          <BrandLogo />
          <Text selectable style={{ color: colors.navy, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>
            {title}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: '800', textAlign: 'center' }}>
            {highlightPlayer?.nickname ?? t('social.placeholder')} - {highlightLabel}
          </Text>
          <Image contentFit="contain" source={highlightAvatar.celebrateImage} style={{ height: 132, width: 132 }} />
          <Text selectable style={{ color: colors.muted, fontSize: 16, textAlign: 'center' }}>
            {score}
          </Text>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.esconde,
              borderColor: colors.pink,
              borderRadius: 16,
              borderWidth: 3,
              height: 88,
              justifyContent: 'center',
              width: 88,
            }}>
            <Text style={{ color: colors.navy, fontWeight: '900', textAlign: 'center' }}>QR</Text>
          </View>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
