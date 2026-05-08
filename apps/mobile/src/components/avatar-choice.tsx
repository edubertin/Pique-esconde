import { Pressable, Text, View } from 'react-native';

import { avatars } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

type AvatarChoiceProps = {
  selectedId?: string;
};

export function AvatarChoice({ selectedId = 'avatar_01' }: AvatarChoiceProps) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>Escolha seu avatar</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {avatars.map((avatar) => {
          const selected = avatar.id === selectedId;

          return (
            <Pressable
              key={avatar.id}
              style={{
                alignItems: 'center',
                backgroundColor: selected ? '#EEF7FF' : colors.surface,
                borderColor: selected ? avatar.color : colors.line,
                borderRadius: 18,
                borderWidth: selected ? 3 : 1,
                boxShadow: selected ? '0 5px 0 rgba(7, 26, 61, 0.12)' : '0 3px 0 rgba(7, 26, 61, 0.06)',
                gap: 8,
                padding: 10,
                width: 76,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: avatar.color,
                  borderColor: colors.surface,
                  borderRadius: 24,
                  borderWidth: 2,
                  height: 48,
                  justifyContent: 'center',
                  width: 48,
                }}>
                <Text style={{ color: colors.surface, fontSize: 17, fontWeight: '900' }}>
                  {avatar.label}
                </Text>
              </View>
              <Text style={{ color: colors.ink, fontSize: 12, fontWeight: '700' }}>{avatar.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
