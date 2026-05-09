import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameLinkButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function HomeScreen() {
  const { roomNotice } = useRoom();
  const noticeText =
    roomNotice === 'removed'
      ? { body: t('home.removedBody'), title: t('home.removedTitle') }
      : roomNotice === 'left_match'
        ? { body: t('home.leftMatchBody'), title: t('home.matchEndedTitle') }
        : roomNotice === 'not_hidden_in_time'
          ? { body: t('home.notHiddenInTimeBody'), title: t('home.notHiddenInTimeTitle') }
          : roomNotice === 'signal_lost'
            ? { body: t('home.signalLostBody'), title: t('home.signalLostTitle') }
            : roomNotice === 'left_hide_area'
              ? { body: t('home.leftHideAreaBody'), title: t('home.leftHideAreaTitle') }
              : undefined;

  return (
    <PrototypeScreen centered>
      <Panel tone="glass">
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            gap: 18,
            maxWidth: 330,
            width: '100%',
          }}>
          <BrandLogo />
          <View style={{ gap: 12, width: '100%' }}>
            <GameLinkButton href="/create-room" label={t('home.createRoom')} />
            <GameLinkButton href="/join-room" label={t('home.joinWithCode')} variant="secondary" />
          </View>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {t('common.playersRange')}
          </Text>
          {noticeText ? (
            <View
              style={{
                ...surfaces.warningTile,
                borderRadius: 16,
                gap: 4,
                padding: 12,
                width: '100%',
              }}>
              <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
                {noticeText.title}
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' }}>
                {noticeText.body}
              </Text>
            </View>
          ) : null}
        </View>
      </Panel>
    </PrototypeScreen>
  );
}
