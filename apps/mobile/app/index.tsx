import { Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
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
        </View>
      </Panel>
    </PrototypeScreen>
  );
}
