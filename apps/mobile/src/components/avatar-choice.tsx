import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { avatars } from '@/src/constants/game';
import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

type AvatarChoiceProps = {
  onSelect?: (avatarId: string) => void;
  selectedId?: string;
};

export function AvatarChoice({ onSelect, selectedId = 'avatar_01' }: AvatarChoiceProps) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>{t('avatar.choose')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {avatars.map((avatar) => {
          const selected = avatar.id === selectedId;

          return (
            <Pressable
              accessibilityLabel={t('avatar.chooseOption', { name: avatar.name })}
              accessibilityRole="button"
              key={avatar.id}
              onPress={() => onSelect?.(avatar.id)}
              style={{
                alignItems: 'center',
                ...(selected ? surfaces.highlightTile : surfaces.glassTile),
                backgroundColor: selected ? `${avatar.color}24` : surfaces.glassTile.backgroundColor,
                borderRadius: 20,
                boxShadow: selected ? '0 7px 0 rgba(255, 45, 141, 0.20)' : surfaces.glassTile.boxShadow,
                flexBasis: '48%',
                flexGrow: 1,
                height: 126,
                justifyContent: 'center',
                minWidth: 134,
                overflow: 'hidden',
                padding: 8,
              }}>
              {selected ? (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: colors.pink,
                    borderColor: colors.surface,
                    borderRadius: 14,
                    borderWidth: 2,
                    height: 28,
                    justifyContent: 'center',
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    width: 28,
                    zIndex: 2,
                  }}>
                  <Ionicons color={colors.surface} name="checkmark" size={17} />
                </View>
              ) : null}
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  height: 106,
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <Image contentFit="contain" source={avatar.faceImage} style={{ height: 112, width: 112 }} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
