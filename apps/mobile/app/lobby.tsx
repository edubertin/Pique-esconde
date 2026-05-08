import { Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { CoverBanner } from '@/src/components/cover-banner';
import { GameButton } from '@/src/components/game-button';
import { PlayerList } from '@/src/components/player-list';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { gameRules } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

export default function LobbyScreen() {
  return (
    <PrototypeScreen title="Sala ABCD">
      <Panel>
        <CoverBanner />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800' }}>
              Código
            </Text>
            <Text
              selectable
              style={{ color: colors.ink, fontSize: 30, fontVariant: ['tabular-nums'], fontWeight: '900' }}>
              {gameRules.roomCode}
            </Text>
          </View>
          <Badge label={`4/${gameRules.maxPlayers}`} tone="rush" />
        </View>
        <GameButton label="Compartilhar link" variant="primary" />
      </Panel>

      <Panel>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            Jogadores
          </Text>
          <Badge label="Lobby" tone="neutral" />
        </View>
        <PlayerList />
      </Panel>

      <Panel>
        <GameButton label="Preparado" />
        <GameButton href="/hide-phase" label="Iniciar partida" variant="secondary" />
        <GameButton href="/rules" label="Editar regras" variant="ghost" />
        <GameButton href="/" label="Sair da sala" variant="danger" />
      </Panel>
    </PrototypeScreen>
  );
}
