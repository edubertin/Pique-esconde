import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function HomeScreen() {
  const { roomNotice } = useRoom();

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
            <GameButton href="/create-room" label={t('home.createRoom')} />
            <GameButton href="/join-room" label={t('home.joinWithCode')} variant="secondary" />
          </View>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {t('common.playersRange')}
          </Text>
          {roomNotice === 'removed' ? (
            <View
              style={{
                ...surfaces.warningTile,
                borderRadius: 16,
                gap: 4,
                padding: 12,
                width: '100%',
              }}>
              <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
                {t('home.removedTitle')}
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' }}>
                {t('home.removedBody')}
              </Text>
            </View>
          ) : null}
        </View>
      </Panel>
    </PrototypeScreen>
  );
}
