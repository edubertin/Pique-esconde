import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, type Href } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors } from '@/src/theme/colors';
import { t } from '@/src/i18n';
import { patterns } from '@/src/theme/patterns';
import { surfaces } from '@/src/theme/surfaces';

type PrototypeScreenProps = {
  children: ReactNode;
  centered?: boolean;
};

export function PrototypeScreen({ centered = false, children }: PrototypeScreenProps) {
  const { height } = useWindowDimensions();
  const minScreenHeight = (height || '100vh') as ViewStyle['minHeight'];

  return (
    <View style={{ backgroundColor: patterns.screen.baseBackground, flex: 1, minHeight: minScreenHeight, position: 'relative' }}>
      <Image
        source={require('@/assets/images/pique-esconde-background.png')}
        contentFit="cover"
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 1,
          zIndex: 0,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={{ flex: 1, minHeight: minScreenHeight, zIndex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, minHeight: minScreenHeight }}
          contentContainerStyle={{
            alignItems: 'center',
            gap: 18,
            justifyContent: centered ? 'center' : 'flex-start',
            minHeight: minScreenHeight,
            padding: 20,
            paddingBottom: 96,
          }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type PanelProps = {
  children: ReactNode;
  tone?: 'default' | 'strong' | 'sunny' | 'glass';
};

const glassPanelInnerStyle = {
  borderRadius: 24,
  gap: 14,
  overflow: 'hidden',
  padding: 16,
  width: '100%',
} as const;

export function Panel({ children, tone = 'default' }: PanelProps) {
  const pattern = patterns.panel[tone];

  if (tone === 'glass') {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,1.0)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={{ borderRadius: 25, maxWidth: patterns.layout.panelMaxWidth, padding: 1, width: '100%' }}>
        {Platform.OS === 'web' ? (
          <View
            style={[
              glassPanelInnerStyle,
              {
                backgroundColor: pattern.backgroundColor,
                boxShadow: pattern.shadow,
                backdropFilter: 'blur(20px)',
                // @ts-expect-error webkit vendor prefix not in RN ViewStyle but forwarded on web
                WebkitBackdropFilter: 'blur(20px)',
              },
            ]}>
            {children}
          </View>
        ) : (
          <View style={{ borderRadius: 24, boxShadow: pattern.shadow, width: '100%' }}>
            <BlurView intensity={55} tint="light" style={glassPanelInnerStyle}>
              {children}
            </BlurView>
          </View>
        )}
      </LinearGradient>
    );
  }

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

const backButtonStyle = {
  alignItems: 'center' as const,
  backgroundColor: 'transparent',
  borderRadius: 20,
  height: 40,
  justifyContent: 'center' as const,
  width: 40,
};

type MenuPanelProps = {
  actions?: ReactNode;
  backHref?: Href;
  children: ReactNode;
  headerAction?: ReactNode;
  meta?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  title: string;
  tone?: PanelProps['tone'];
};

export function MenuPanel({ actions, backHref = '/', children, headerAction, meta, onBack, showBack = true, title, tone }: MenuPanelProps) {
  return (
    <Panel tone={tone}>
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
        {showBack ? (
          onBack ? (
            <Pressable
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [backButtonStyle, pressed && { transform: [{ scale: 0.92 }] }]}>
              <Ionicons color={colors.navy} name="arrow-back-circle" size={26} />
            </Pressable>
          ) : (
            <Link href={backHref} asChild>
              <Pressable
                accessibilityLabel={t('common.back')}
                accessibilityRole="button"
                style={({ pressed }) => [backButtonStyle, pressed && { transform: [{ scale: 0.92 }] }]}>
                <Ionicons color={colors.navy} name="arrow-back-circle" size={26} />
              </Pressable>
            </Link>
          )
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            numberOfLines={2}
            selectable
            style={{ color: colors.ink, fontSize: 22, fontWeight: '900', lineHeight: 26 }}>
            {title}
          </Text>
          {meta ? <View>{meta}</View> : null}
        </View>
        {headerAction ? <View>{headerAction}</View> : null}
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
