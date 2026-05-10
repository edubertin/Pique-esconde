import { Image } from 'expo-image';
import { Text, View, type ImageSourcePropType } from 'react-native';

import { colors } from '@/src/theme/colors';

type SocialShareCardProps = {
  capturedCount: number;
  highlightAvatar: ImageSourcePropType;
  highlightLabel: string;
  highlightName: string;
  playerCount: number;
  score: string;
  time: string;
  title: string;
  winnerLabel: string;
};

export function SocialShareCard({
  capturedCount,
  highlightAvatar,
  highlightLabel,
  highlightName,
  playerCount,
  score,
  time,
  title,
  winnerLabel,
}: SocialShareCardProps) {
  return (
    <View
      collapsable={false}
      style={{
        aspectRatio: 9 / 16,
        backgroundColor: colors.backgroundDeep,
        borderRadius: 28,
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
          gap: 16,
          height: '100%',
          justifyContent: 'space-between',
          paddingBottom: 96,
          paddingHorizontal: 34,
          paddingTop: 104,
        }}>
        <View style={{ alignItems: 'center', gap: 16, width: '100%' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.navy,
              borderRadius: 999,
              borderWidth: 3,
              paddingHorizontal: 18,
              paddingVertical: 8,
            }}>
            <Text selectable style={{ color: colors.navy, fontSize: 16, fontWeight: '900', textAlign: 'center' }}>
              {winnerLabel}
            </Text>
          </View>

          <Text
            selectable
            style={{
              color: colors.ink,
              fontSize: 42,
              fontWeight: '900',
              lineHeight: 46,
              textAlign: 'center',
            }}>
            {title}
          </Text>
        </View>

        <View style={{ alignItems: 'center', gap: 14, width: '100%' }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.pink,
              borderRadius: 999,
              borderWidth: 5,
              height: 226,
              justifyContent: 'center',
              width: 226,
            }}>
            <Image contentFit="contain" source={highlightAvatar} style={{ height: 198, width: 198 }} />
          </View>

          <Text selectable style={{ color: colors.ink, fontSize: 30, fontWeight: '900', textAlign: 'center' }}>
            {highlightName}
          </Text>
          <View
            style={{
              backgroundColor: colors.successSoft,
              borderColor: colors.green,
              borderRadius: 999,
              borderWidth: 2,
              paddingHorizontal: 16,
              paddingVertical: 7,
            }}>
            <Text selectable style={{ color: colors.limeDark, fontSize: 15, fontWeight: '900', textAlign: 'center' }}>
              {highlightLabel}
            </Text>
          </View>
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: '800', lineHeight: 24, textAlign: 'center' }}>
            {score}
          </Text>
        </View>

        <View style={{ gap: 14, width: '100%' }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ShareStat label="Tempo" value={time} />
            <ShareStat label="Jogadores" value={`${playerCount}`} />
            <ShareStat label="Achados" value={`${capturedCount}`} />
          </View>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.navy,
              borderColor: colors.pink,
              borderRadius: 22,
              borderWidth: 3,
              flexDirection: 'row',
              gap: 12,
              justifyContent: 'space-between',
              paddingHorizontal: 18,
              paddingVertical: 14,
            }}>
            <Image
              contentFit="contain"
              source={require('@/assets/images/pique-esconde-logo.png')}
              style={{ height: 42, width: 132 }}
            />
            <Text selectable style={{ color: colors.surface, flex: 1, fontSize: 16, fontWeight: '900', textAlign: 'right' }}>
              Jogue com sua turma
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 16,
        borderWidth: 2,
        flex: 1,
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 10,
      }}>
      <Text selectable style={{ color: colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center' }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
        {value}
      </Text>
    </View>
  );
}
