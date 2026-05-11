import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
  headerAction?: ReactNode;
  meta?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  title: string;
};

export function MenuPanel({ actions, backHref = '/', children, headerAction, meta, onBack, showBack = true, title }: MenuPanelProps) {
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
        {showBack ? (
          onBack ? (
            <Pressable
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              onPress={onBack}
              style={{
                ...surfaces.iconButtonActive,
                alignItems: 'center',
                borderRadius: 14,
                height: 40,
                justifyContent: 'center',
                width: 40,
              }}>
              <Ionicons color={colors.navy} name="chevron-back" size={24} />
            </Pressable>
          ) : (
            <Link href={backHref} asChild>
              <Pressable
                accessibilityLabel={t('common.back')}
                accessibilityRole="button"
                style={{
                  ...surfaces.iconButtonActive,
                  alignItems: 'center',
                  borderRadius: 14,
                  height: 40,
                  justifyContent: 'center',
                  width: 40,
                }}>
                <Ionicons color={colors.navy} name="chevron-back" size={24} />
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
