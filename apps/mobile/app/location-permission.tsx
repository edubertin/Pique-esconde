import { Text } from 'react-native';

import { GameButton } from '@/src/components/game-button';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { colors } from '@/src/theme/colors';

export default function LocationPermissionScreen() {
  return (
    <PrototypeScreen
      title="Localização da partida"
      subtitle="Para jogar como participante ativo, precisamos da localização durante esta rodada.">
      <Panel>
        <Text selectable style={{ color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 24 }}>
          O Pique Esconde usa sua localização apenas durante a partida para calcular o radar e as
          capturas.
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          Não mostramos seu ponto exato para outros jogadores e não compartilhamos GPS em redes
          sociais.
        </Text>
        <GameButton href="/lobby" label="Permitir localização" />
        <GameButton href="/" label="Agora não" variant="ghost" />
      </Panel>
    </PrototypeScreen>
  );
}
