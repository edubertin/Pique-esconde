import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { patterns } from '@/src/theme/patterns';

type PrototypeScreenProps = {
  children: ReactNode;
  centered?: boolean;
};

export function PrototypeScreen({ centered = false, children }: PrototypeScreenProps) {
  const { height, width } = useWindowDimensions();

  return (
    <View style={{ backgroundColor: patterns.screen.baseBackground, minHeight: height }}>
      <Image
        source={require('@/assets/images/pique-esconde-background.png')}
        contentFit="cover"
        style={{
          height,
          left: 0,
          opacity: 1,
          position: 'absolute',
          right: 0,
          top: 0,
          width,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ height }}
        contentContainerStyle={{
          alignItems: 'center',
          gap: 18,
          justifyContent: centered ? 'center' : 'flex-start',
          minHeight: height,
          padding: 20,
          paddingBottom: 40,
        }}>
        {children}
      </ScrollView>
    </View>
  );
}

type PanelProps = {
  children: ReactNode;
  tone?: 'default' | 'strong' | 'sunny' | 'glass';
};

export function Panel({ children, tone = 'default' }: PanelProps) {
  const pattern = patterns.panel[tone];

  return (
    <View
      style={{
        backgroundColor: pattern.backgroundColor,
        borderColor: pattern.borderColor,
        borderRadius: pattern.radius,
        borderWidth: pattern.borderWidth,
        boxShadow: pattern.shadow,
        gap: 14,
        maxWidth: patterns.layout.panelMaxWidth,
        padding: 16,
        width: '100%',
      }}>
      {children}
    </View>
  );
}

type MenuPanelProps = {
  actions?: ReactNode;
  backHref?: Href;
  children: ReactNode;
  meta?: ReactNode;
  title: string;
};

export function MenuPanel({ actions, backHref = '/', children, meta, title }: MenuPanelProps) {
  return (
    <Panel>
      <View
        style={{
          alignItems: 'center',
          borderBottomColor: 'rgba(7, 26, 61, 0.10)',
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 10,
          minHeight: 48,
          paddingBottom: 12,
        }}>
        <Link href={backHref} asChild>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            style={{
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.pink,
              borderRadius: 14,
              borderWidth: 2,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}>
            <Ionicons color={colors.navy} name="chevron-back" size={24} />
          </Pressable>
        </Link>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            numberOfLines={2}
            selectable
            style={{ color: colors.ink, fontSize: 22, fontWeight: '900', lineHeight: 26 }}>
            {title}
          </Text>
          {meta ? <View>{meta}</View> : null}
        </View>
      </View>

      <View style={{ gap: 14, width: '100%' }}>{children}</View>

      {actions ? (
        <View
          style={{
            borderTopColor: 'rgba(7, 26, 61, 0.10)',
            borderTopWidth: 1,
            gap: 12,
            paddingTop: 14,
            width: '100%',
          }}>
          {actions}
        </View>
      ) : null}
    </Panel>
  );
}
