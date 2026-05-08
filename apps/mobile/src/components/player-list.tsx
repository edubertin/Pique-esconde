import { Text, View } from 'react-native';

import { avatars, players } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

function getAvatar(avatarId: string) {
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

export function PlayerList() {
  return (
    <View style={{ gap: 10 }}>
      {players.map((player) => {
        const avatar = getAvatar(player.avatarId);

        return (
          <View
            key={player.id}
            style={{
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.line,
              borderRadius: 18,
              borderWidth: 1,
              flexDirection: 'row',
              gap: 12,
              padding: 12,
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: avatar.color,
                borderRadius: 20,
                height: 40,
                justifyContent: 'center',
                width: 40,
              }}>
              <Text style={{ color: colors.surface, fontWeight: '900' }}>{avatar.label}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>{player.nickname}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{player.status}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
