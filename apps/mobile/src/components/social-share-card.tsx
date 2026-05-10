import { Image } from 'expo-image';
import { Text, View, type ImageSourcePropType } from 'react-native';

import { colors } from '@/src/theme/colors';

type SocialShareCardProps = {
  highlightAvatar: ImageSourcePropType;
  title: string;
  winnerName: string;
};

export function SocialShareCard({
  highlightAvatar,
  title,
  winnerName,
}: SocialShareCardProps) {
  return (
    <View
      collapsable={false}
      style={{
        backgroundColor: colors.backgroundDeep,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}>
      <Image
        contentFit="cover"
        source={require('@/assets/images/pique-esconde-background.png')}
        style={{
          bottom: 0,
          left: 0,
          opacity: 0.82,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.68)',
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      <View
        style={{
          alignItems: 'center',
          gap: 18,
          justifyContent: 'flex-start',
          paddingBottom: 26,
          paddingHorizontal: 30,
          paddingTop: 42,
        }}>
        <View style={{ alignItems: 'center', paddingTop: 8, width: '100%' }}>
          <Text
            selectable
            style={{
              color: colors.pink,
              fontFamily: 'serif',
              fontSize: 58,
              fontWeight: '900',
              lineHeight: 62,
              textAlign: 'center',
              textShadowColor: 'rgba(7, 26, 61, 0.16)',
              textShadowOffset: { height: 4, width: 0 },
              textShadowRadius: 0,
            }}>
            {title}
          </Text>
        </View>

        <View style={{ alignItems: 'center', gap: 8, paddingTop: 0, width: '100%' }}>
          <Image contentFit="contain" source={highlightAvatar} style={{ height: 246, width: 246 }} />

          <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: '900', lineHeight: 30, textAlign: 'center' }}>
            {winnerName} venceu
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: '900', lineHeight: 24, textAlign: 'center' }}>
            no Pique-Esconde
          </Text>
        </View>
      </View>
    </View>
  );
}
