import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { RadarView } from '@/src/components/radar-view';
import { colors } from '@/src/theme/colors';

export default function SeekerRadarScreen() {
  return (
    <PrototypeScreen title="Procurando" subtitle="Radar simulado sem mapa exato dos escondidos.">
      <Panel>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 24, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
            02:18
          </Text>
          <Badge label="Restam 3" tone="rush" />
        </View>
        <RadarView />
        <GameButton href="/capture" label="Simular captura" />
        <GameButton href="/result" label="Ir para rush final" variant="secondary" />
      </Panel>
    </PrototypeScreen>
  );
}
