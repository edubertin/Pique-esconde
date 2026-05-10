import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { patterns } from '@/src/theme/patterns';

type LegalPageProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  updatedAt: string;
};

type LegalSectionProps = {
  children: ReactNode;
  title: string;
};

export function LegalPage({ children, eyebrow, title, updatedAt }: LegalPageProps) {
  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          gap: 18,
          padding: 20,
          paddingBottom: 34,
        }}>
        <View style={{ alignItems: 'center', maxWidth: patterns.layout.panelMaxWidth, width: '100%' }}>
          <Image contentFit="contain" source={require('@/assets/images/logo.png')} style={{ aspectRatio: 2.15, width: 220 }} />
        </View>

        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            borderColor: colors.line,
            borderRadius: 18,
            borderWidth: 1,
            gap: 16,
            maxWidth: 760,
            padding: 18,
            width: '100%',
          }}>
          <Link href="/" asChild>
            <Pressable
              accessibilityLabel="Voltar para o inicio"
              accessibilityRole="link"
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 6,
                minHeight: 32,
              }}>
              <Ionicons color={colors.navy} name="chevron-back" size={18} />
              <Text style={{ color: colors.navy, fontSize: 13, fontWeight: '900' }}>Pique Esconde</Text>
            </Pressable>
          </Link>

          <View style={{ gap: 8 }}>
            <Text selectable style={{ color: colors.pink, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
              {eyebrow}
            </Text>
            <Text selectable style={{ color: colors.ink, fontSize: 30, fontWeight: '900', lineHeight: 34 }}>
              {title}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700' }}>
              Ultima atualizacao: {updatedAt}
            </Text>
          </View>

          {children}

          <View
            style={{
              borderTopColor: colors.softLine,
              borderTopWidth: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              paddingTop: 14,
            }}>
            <LegalLink href="/privacy" label="Privacidade" />
            <LegalLink href="/terms" label="Termos" />
            <LegalLink href="/support" label="Suporte" />
            <LegalLink href="/data-deletion" label="Exclusao de dados" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900', lineHeight: 23 }}>
        {title}
      </Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return (
    <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 23 }}>
      {children}
    </Text>
  );
}

export function LegalBullet({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Text selectable style={{ color: colors.pink, fontSize: 15, fontWeight: '900', lineHeight: 23 }}>
        -
      </Text>
      <Text selectable style={{ color: colors.ink, flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 23 }}>
        {children}
      </Text>
    </View>
  );
}

function LegalLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityLabel={label} accessibilityRole="link">
        <Text style={{ color: colors.navy, fontSize: 13, fontWeight: '900', textDecorationLine: 'underline' }}>{label}</Text>
      </Pressable>
    </Link>
  );
}
