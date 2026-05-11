import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/src/components/badge';
import { avatars } from '@/src/constants/game';
import { t } from '@/src/i18n';
import type { RoomPlayer } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

function getAvatar(avatarId: string) {
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

function getDuplicateCounts(players: RoomPlayer[]) {
  return players.reduce<Record<string, number>>((counts, player) => {
    counts[player.nickname] = (counts[player.nickname] ?? 0) + 1;
    return counts;
  }, {});
}

function getNameIndexes(players: RoomPlayer[]) {
  const seen: Record<string, number> = {};

  return players.reduce<Record<string, number>>((indexes, player) => {
    seen[player.nickname] = (seen[player.nickname] ?? 0) + 1;
    indexes[player.id] = seen[player.nickname];
    return indexes;
  }, {});
}

function getPlayerLabel(player: RoomPlayer, duplicateCounts: Record<string, number>, nameIndexes: Record<string, number>) {
  if ((duplicateCounts[player.nickname] ?? 0) <= 1) return player.nickname;
  return `${player.nickname} #${nameIndexes[player.id] ?? 1}`;
}

type PlayerListProps = {
  activePlayerId?: string;
  canRemove?: boolean;
  onPromote?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
  players: RoomPlayer[];
};

export function PlayerList({ activePlayerId, canRemove, onPromote, onRemove, players }: PlayerListProps) {
  const orderedPlayers = [...players].sort((firstPlayer, secondPlayer) => {
    if (firstPlayer.isLeader === secondPlayer.isLeader) return 0;
    return firstPlayer.isLeader ? -1 : 1;
  });
  const duplicateCounts = getDuplicateCounts(orderedPlayers);
  const nameIndexes = getNameIndexes(orderedPlayers);

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
        backgroundColor: 'rgba(255, 45, 141, 0.16)',
        borderColor: 'rgba(255, 45, 141, 0.48)',
        borderRadius: 18,
        borderWidth: 2,
        maxHeight: 272,
        overflow: 'hidden',
        padding: 4,
      }}>
      <ScrollView
        contentContainerStyle={{ gap: 8 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        testID="player-list-scroll"
        style={{ maxHeight: 264 }}>
        {orderedPlayers.map((player) => {
          const avatar = getAvatar(player.avatarId);
          const canRemovePlayer = canRemove && player.id !== activePlayerId;
          const canPromotePlayer = Boolean(onPromote && player.id !== activePlayerId && !player.isLeader);
          const playerLabel = getPlayerLabel(player, duplicateCounts, nameIndexes);
          const content = (
            <>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: avatar.color,
                  borderColor: colors.surface,
                  borderRadius: 20,
                  borderWidth: 2,
                  height: 36,
                  justifyContent: 'center',
                  overflow: 'hidden',
                  width: 36,
                }}>
                <Image contentFit="cover" source={avatar.faceImage} style={{ height: 36, width: 36 }} />
              </View>
              <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 15, fontWeight: '800' }}>
                  {playerLabel}
                </Text>
                <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>
                  {player.isLeader ? t('player.roleLeaderSeeker') : player.id === activePlayerId ? t('player.roleYou') : t('player.rolePlayer')}
                </Text>
              </View>
              <Badge label={player.isLeader ? t('player.leader') : player.status} tone={getTone(player)} />
            </>
          );

          return (
            <View
              key={player.id}
              style={{
                alignItems: 'center',
                ...(player.isLeader ? surfaces.highlightTile : surfaces.glassTile),
                borderRadius: 18,
                borderWidth: player.isLeader ? 2 : surfaces.glassTile.borderWidth,
                boxShadow: player.isLeader ? '0 5px 0 rgba(255, 45, 141, 0.16)' : surfaces.glassTile.boxShadow,
                flexDirection: 'row',
                gap: 8,
                height: 58,
                padding: 8,
              }}>
              {canPromotePlayer ? (
                <Pressable
                  accessibilityLabel={`${player.nickname} - ${player.status}`}
                  accessibilityRole="button"
                  onPress={() => {
                    onPromote?.(player.id);
                  }}
                  style={{
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    gap: 8,
                    minWidth: 0,
                  }}>
                  {content}
                </Pressable>
              ) : (
                <View
                  accessibilityLabel={`${player.nickname} - ${player.isLeader ? t('player.leader') : player.status}`}
                  accessibilityRole="text"
                  style={{
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    gap: 8,
                    minWidth: 0,
                  }}>
                  {content}
                </View>
              )}
              {canRemovePlayer ? (
                <Pressable
                  accessibilityLabel={t('player.remove', { name: player.nickname })}
                  accessibilityRole="button"
                  onPress={() => {
                    onRemove?.(player.id);
                  }}
                  style={{
                    alignItems: 'center',
                    backgroundColor: colors.dangerSoft,
                    borderColor: colors.danger,
                    borderRadius: 14,
                    borderWidth: 2,
                    height: 34,
                    justifyContent: 'center',
                    width: 34,
                  }}>
                  <Ionicons color={colors.danger} name="person-remove-outline" size={18} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
