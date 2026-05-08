import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type PrototypeScreenProps = {
  children: ReactNode;
  kicker?: string;
  subtitle?: string;
  title?: string;
};

export function PrototypeScreen({ children, kicker, subtitle, title }: PrototypeScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.navy }}
      contentContainerStyle={{
        alignItems: 'center',
        gap: 18,
        minHeight: '100%',
        padding: 20,
        paddingBottom: 40,
      }}>
      <Image
        source={require('@/assets/images/pique-esconde-background.png')}
        contentFit="cover"
        style={{
          height: 1220,
          left: 0,
          opacity: 0.58,
          position: 'absolute',
          right: 0,
          top: -70,
        }}
      />
      <View
        style={{
          backgroundColor: 'rgba(7, 26, 61, 0.30)',
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View style={{ gap: 8, maxWidth: 520, width: '100%' }}>
        {kicker ? (
          <Text selectable style={{ color: colors.pink, fontSize: 12, fontWeight: '900' }}>
            {kicker.toUpperCase()}
          </Text>
        ) : null}
        {title ? (
          <Text selectable style={{ color: colors.surface, fontSize: 32, fontWeight: '900', lineHeight: 36 }}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text selectable style={{ color: colors.backgroundDeep, fontSize: 16, lineHeight: 23 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

type PanelProps = {
  children: ReactNode;
  tone?: 'default' | 'strong' | 'sunny';
};

export function Panel({ children, tone = 'default' }: PanelProps) {
  const isStrong = tone === 'strong';
  const isSunny = tone === 'sunny';

  return (
    <View
      style={{
        backgroundColor: isStrong ? colors.navy : isSunny ? colors.warningSoft : colors.surface,
        borderColor: isStrong ? colors.pink : isSunny ? colors.yellow : colors.line,
        borderRadius: 20,
        borderWidth: isStrong ? 3 : 2,
        boxShadow: '0 8px 0 rgba(7, 26, 61, 0.10)',
        gap: 14,
        maxWidth: 520,
        padding: 16,
        width: '100%',
      }}>
      {children}
    </View>
  );
}
