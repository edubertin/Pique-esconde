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
        <LegalPills />
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

function ButtonCard() {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.90)', 'rgba(255,255,255,0.18)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ borderRadius: 25, padding: 1, width: '100%' }}>
      <View
        style={{
          backgroundColor: surfaces.liquidPanel.backgroundColor,
          borderRadius: 24,
          boxShadow: surfaces.liquidPanel.boxShadow,
          gap: 14,
          padding: 20,
        }}>
        <GameLinkButton href="/create-room" label={t('home.createRoom')} />
        <GameLinkButton href="/join-room" label={t('home.joinWithCode')} variant="secondary" />
        <View style={{ backgroundColor: 'rgba(7,26,61,0.08)', height: 1, marginVertical: 4 }} />
        <GameLinkButton href="/how-to-play" label={t('home.howToPlay')} variant="ghost" />
      </View>
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

function LegalPills() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
      <LegalPill href="/privacy" label="Privacidade" />
      <LegalPill href="/terms" label="Termos" />
      <LegalPill href="/support" label="Suporte" />
    </View>
  );
}

function LegalPill({ href, label }: { href: '/privacy' | '/support' | '/terms'; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="link"
        style={{
          backgroundColor: 'rgba(255,255,255,0.55)',
          borderColor: 'rgba(255,255,255,0.85)',
          borderRadius: 999,
          borderWidth: 1,
          boxShadow: '0 2px 4px rgba(7,26,61,0.08)',
          minHeight: 36,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
        <Text style={{ color: colors.navy, fontSize: 12, fontWeight: '900', opacity: 0.82 }}>{label}</Text>
      </Pressable>
    </Link>
  );
}
