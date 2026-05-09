import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActionGrid } from '@/src/components/action-grid';
import { Badge } from '@/src/components/badge';
import { CoverBanner } from '@/src/components/cover-banner';
import { GameButton } from '@/src/components/game-button';
import { PlayerList } from '@/src/components/player-list';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

export default function LobbyScreen() {
  const router = useRouter();
  const { activePlayer, addDemoPlayer, leaveRoom, promoteLeader, room, startRound, toggleReady } = useRoom();
  const [copied, setCopied] = useState(false);
  const players = room?.players ?? [];
  const readyLabel = activePlayer?.status === 'Preparado' ? 'Pronto' : 'Preparado';

  const handleCopyCode = async () => {
    if (!room?.code) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(room.code);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.replace('/');
  };

  const handleStartRound = () => {
    if (players.length < 2) {
      return;
    }

    startRound();
    router.push('/hide-phase');
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        title={`Lobby: ${room?.code ?? '----'}`}
        meta={
          copied ? (
            <Text selectable style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>
              Código copiado
            </Text>
          ) : null
        }
        headerAction={
          <Pressable
            accessibilityLabel="Copiar código da sala"
            accessibilityRole="button"
            onPress={handleCopyCode}
            style={{
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: copied ? colors.green : colors.pink,
              borderRadius: 14,
              borderWidth: 2,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}>
            <Ionicons color={copied ? colors.green : colors.navy} name={copied ? 'checkmark' : 'copy-outline'} size={21} />
          </Pressable>
        }
        actions={
          <>
            <GameButton label="Iniciar partida" onPress={handleStartRound} variant="secondary" />
            <ActionGrid
              actions={[
                { label: readyLabel, onPress: toggleReady },
                { href: '/rules', label: 'Regras', variant: 'ghost' },
                { label: 'Convidar', onPress: addDemoPlayer, variant: 'ghost' },
                { label: 'Sair', onPress: handleLeaveRoom, variant: 'danger' },
              ]}
            />
          </>
        }>
        <CoverBanner />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            Jogadores
          </Text>
          <Badge label={`${players.length}/${room?.maxPlayers ?? 8}`} tone="rush" />
        </View>
        {room?.expiresAt ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            Aguardando mais jogadores. Toque em Convidar para adicionar amigos demo. Com 1 jogador, a sala expira em 6 min.
          </Text>
        ) : null}
        {activePlayer?.isLeader && players.length > 1 ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            Líder: toque em um jogador para promover como próximo procurador.
          </Text>
        ) : null}
        <PlayerList activePlayerId={activePlayer?.id} onPromote={promoteLeader} players={players} />
      </MenuPanel>
    </PrototypeScreen>
  );
}
