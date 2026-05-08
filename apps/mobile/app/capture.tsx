import { Text } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function CaptureScreen() {
  return (
    <PrototypeScreen title="Captura!" subtitle="Feedback automatico quando a proximidade e confirmada.">
      <Panel>
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>
          Rafa foi encontrado
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 16, textAlign: 'center' }}>
          Restam 2 escondidos na rodada.
        </Text>
        <GameButton href="/seeker-radar" label="Continuar procurando" />
        <GameButton href="/result" label="Encerrar rodada" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
