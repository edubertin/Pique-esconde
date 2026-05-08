import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type PrototypeScreenProps = {
  children: ReactNode;
  kicker?: string;
  subtitle?: string;
  title: string;
};

export function PrototypeScreen({ children, kicker, subtitle, title }: PrototypeScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        gap: 20,
        padding: 20,
        paddingBottom: 40,
      }}>
      <View style={{ gap: 8 }}>
        {kicker ? (
          <Text selectable style={{ color: colors.pink, fontSize: 13, fontWeight: '900' }}>
            {kicker.toUpperCase()}
          </Text>
        ) : null}
        <Text selectable style={{ color: colors.ink, fontSize: 34, fontWeight: '900' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderRadius: 18,
        borderWidth: 1,
        gap: 14,
        padding: 16,
      }}>
      {children}
    </View>
  );
}
