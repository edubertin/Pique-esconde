import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { BrandLogo } from '@/src/components/brand-logo';
import { GameLinkButton } from '@/src/components/game-button';
import { PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function HomeScreen() {
  const { roomNotice } = useRoom();
  const heroOffset = (Platform.OS === 'web' ? '-10vh' : -48) as ViewStyle['marginTop'];
  const noticeText = resolveNoticeText(roomNotice);

  return (
    <PrototypeScreen centered>
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'center',
          gap: 18,
          marginTop: heroOffset,
          maxWidth: 360,
          width: '100%',
        }}>
        <BrandLogo />
        <ButtonCard />
        {noticeText ? <NoticeTile title={noticeText.title} body={noticeText.body} /> : null}
      </View>
    </PrototypeScreen>
  );
}

function resolveNoticeText(roomNotice: ReturnType<typeof useRoom>['roomNotice']) {
  if (roomNotice === 'removed') return { body: t('home.removedBody'), title: t('home.removedTitle') };
  if (roomNotice === 'left_match') return { body: t('home.leftMatchBody'), title: t('home.matchEndedTitle') };
  if (roomNotice === 'not_hidden_in_time') return { body: t('home.notHiddenInTimeBody'), title: t('home.notHiddenInTimeTitle') };
  if (roomNotice === 'signal_lost') return { body: t('home.signalLostBody'), title: t('home.signalLostTitle') };
  if (roomNotice === 'left_hide_area') return { body: t('home.leftHideAreaBody'), title: t('home.leftHideAreaTitle') };
  return undefined;
}

const cardInnerStyle = {
  borderRadius: 24,
  gap: 14,
  overflow: 'hidden',
  paddingTop: 20,
  paddingHorizontal: 20,
  paddingBottom: 0,
} as const;

const cardContentStyle = {
  gap: 2,
} as const;

function CardContent() {
  return (
    <View style={cardContentStyle}>
      <GameLinkButton href="/create-room" label={t('home.createRoom')} />
      <GameLinkButton href="/join-room" label={t('home.joinWithCode')} variant="secondary" />
      <View style={{ backgroundColor: 'rgba(7,26,61,0.12)', height: 1, marginVertical: 4 }} />
      <GameLinkButton href="/how-to-play" label={t('home.howToPlay')} variant="ghost" />
      <LegalLinksCompact />
    </View>
  );
}

function ButtonCard() {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,1.0)', 'rgba(255,255,255,0.0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={{ borderRadius: 25, padding: 1, width: '100%' }}>
      {Platform.OS === 'web' ? (
        <View
          style={[
            cardInnerStyle,
            {
              backgroundColor: surfaces.liquidPanel.backgroundColor,
              boxShadow: surfaces.liquidPanel.boxShadow,
              backdropFilter: 'blur(20px)',
              // @ts-expect-error webkit vendor prefix not in RN ViewStyle but passed through on web
              WebkitBackdropFilter: 'blur(20px)',
            },
          ]}>
          <CardContent />
        </View>
      ) : (
        <View style={{ borderRadius: 24, boxShadow: surfaces.liquidPanel.boxShadow, width: '100%' }}>
          <BlurView intensity={55} tint="light" style={cardInnerStyle}>
            <CardContent />
          </BlurView>
        </View>
      )}
    </LinearGradient>
  );
}

function NoticeTile({ body, title }: { body: string; title: string }) {
  return (
    <View
      style={{
        ...surfaces.warningTile,
        borderRadius: 16,
        gap: 4,
        padding: 12,
        width: '100%',
      }}>
      <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
        {title}
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' }}>
        {body}
      </Text>
    </View>
  );
}

function LegalLinksCompact() {
  return (
    <View style={{ marginTop: 4, width: '100%' }}>
      <View style={{ backgroundColor: 'rgba(7, 26, 61, 0.12)', height: 1, width: '100%' }} />
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10, width: '100%' }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <LegalFooterLink href="/privacy" label="Privacidade" />
          <Text style={{ color: colors.muted, opacity: 0.7 }}>•</Text>
          <LegalFooterLink href="/terms" label="Termos" />
          <Text style={{ color: colors.muted, opacity: 0.7 }}>•</Text>
          <LegalFooterLink href="/support" label="Suporte" />
        </View>
      </View>
    </View>
  );
}

function LegalFooterLink({ href, label }: { href: '/privacy' | '/support' | '/terms'; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityLabel={label} accessibilityRole="link" style={{ minHeight: 20, paddingHorizontal: 0 }}>
        <Text style={{ color: colors.navy, fontSize: 10, fontWeight: '800', textDecorationLine: 'underline' }}>{label}</Text>
      </Pressable>
    </Link>
  );
}
