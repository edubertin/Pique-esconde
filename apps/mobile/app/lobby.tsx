import { Text, View } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { PlayerList } from '@/src/components/player-list';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { gameRules } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

export default function LobbyScreen() {
  return (
    <PrototypeScreen title="Sala ABCD" subtitle="Ate 8 jogadores. Prepare o grupo e inicie a rodada.">
      <Panel>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            Código {gameRules.roomCode}
          </Text>
          <Text selectable style={{ color: colors.pink, fontSize: 16, fontWeight: '900' }}>
            4/{gameRules.maxPlayers}
          </Text>
        </View>
        <GameButton label="Compartilhar link" variant="secondary" />
      </Panel>
      <Panel>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
          Jogadores
        </Text>
        <PlayerList />
      </Panel>
      <Panel>
        <GameButton label="Preparado" />
        <GameButton href="/rules" label="Regras" variant="secondary" />
        <GameButton href="/hide-phase" label="Iniciar partida" variant="ghost" />
      </Panel>
    </PrototypeScreen>
  );
}
