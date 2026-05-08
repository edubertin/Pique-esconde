import { Text } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { colors } from '@/src/theme/colors';

export default function ResultScreen() {
  return (
    <PrototypeScreen title="Resultado" subtitle="Feche a rodada e incentive o grupo a jogar de novo.">
      <Panel>
        <RadarView rush />
        <Text selectable style={{ color: colors.ink, fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
          Escondidos venceram
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 16, textAlign: 'center' }}>
          Ana sobreviveu ao rush final. Capturados: Rafa e Bia.
        </Text>
        <GameButton href="/hide-phase" label="Jogar novamente" />
        <GameButton href="/lobby" label="Trocar procurador" variant="secondary" />
        <GameButton href="/social-card" label="Compartilhar resultado" variant="ghost" />
      </Panel>
    </PrototypeScreen>
  );
}
