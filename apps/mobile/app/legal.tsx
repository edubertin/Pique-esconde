import { View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameLinkButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';

export default function LegalScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel title={t('legal.title')}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Badge label={t('legal.badge')} tone="neutral" />
        </View>
        <View style={{ gap: 10, width: '100%' }}>
          <GameLinkButton href="/privacy" label={t('legal.privacy')} variant="secondary" />
          <GameLinkButton href="/terms" label={t('legal.terms')} variant="secondary" />
          <GameLinkButton href="/support" label={t('legal.support')} variant="secondary" />
          <GameLinkButton href="/data-deletion" label={t('legal.dataDeletion')} variant="ghost" />
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
