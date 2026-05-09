import { Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/src/components/badge';
import { avatars } from '@/src/constants/game';
import type { RoomPlayer } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

function getAvatar(avatarId: string) {
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

type PlayerListProps = {
  activePlayerId?: string;
  onPromote?: (playerId: string) => void;
  players: RoomPlayer[];
};

export function PlayerList({ activePlayerId, onPromote, players }: PlayerListProps) {
  const orderedPlayers = [...players].sort((firstPlayer, secondPlayer) => {
    if (firstPlayer.isLeader === secondPlayer.isLeader) return 0;
    return firstPlayer.isLeader ? -1 : 1;
  });

  const getTone = (player: RoomPlayer): BadgeTone => {
    if (player.isLeader) return 'leader';
    if (player.status === 'Preparado') return 'ready';
    if (player.status === 'Aguardando') return 'waiting';
    return 'neutral';
  };

  return (
    <View
      testID="player-list-frame"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.36)',
        borderColor: 'rgba(255, 255, 255, 0.74)',
        borderRadius: 20,
        borderWidth: 1,
        maxHeight: 310,
        overflow: 'hidden',
        padding: 4,
      }}>
      <ScrollView
        contentContainerStyle={{ gap: 10 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        testID="player-list-scroll"
        style={{ maxHeight: 302 }}>
        {orderedPlayers.map((player) => {
          const avatar = getAvatar(player.avatarId);

          return (
            <Pressable
              accessibilityLabel={`${player.nickname} - ${player.isLeader ? 'Líder' : player.status}`}
              accessibilityRole="button"
              key={player.id}
              onPress={() => onPromote?.(player.id)}
              style={{
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderColor: player.isLeader ? colors.pink : colors.line,
                borderRadius: 18,
                borderWidth: player.isLeader ? 2 : 1,
                flexDirection: 'row',
                gap: 12,
                height: 66,
                padding: 12,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: avatar.color,
                  borderColor: colors.surface,
                  borderRadius: 20,
                  borderWidth: 2,
                  height: 40,
                  justifyContent: 'center',
                  width: 40,
                }}>
                <Text style={{ color: colors.surface, fontWeight: '900' }}>{avatar.label}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>
                  {player.nickname}
                </Text>
                <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 13 }}>
                  {player.isLeader ? 'Procurador' : player.id === activePlayerId ? 'Você' : 'Jogador'}
                </Text>
              </View>
              <Badge label={player.isLeader ? 'Líder' : player.status} tone={getTone(player)} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
