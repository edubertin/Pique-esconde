import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';

import { AvatarChoice } from '@/src/components/avatar-choice';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { colors } from '@/src/theme/colors';

const inputStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.navy,
  borderRadius: 16,
  borderWidth: 2,
  color: colors.ink,
  fontSize: 16,
  minHeight: 56,
  padding: 14,
};

export default function CreateRoomScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.navy }}
      contentContainerStyle={{
        alignItems: 'center',
        minHeight: '100%',
        padding: 14,
        paddingBottom: 26,
      }}>
      <Image
        source={require('@/assets/images/pique-esconde-menu-reference.png')}
        contentFit="cover"
        style={{
          height: 980,
          left: 0,
          opacity: 0.9,
          position: 'absolute',
          right: 0,
          top: -96,
        }}
      />
      <View
        style={{
          backgroundColor: 'rgba(7, 26, 61, 0.18)',
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      <View style={{ gap: 14, maxWidth: 420, paddingTop: 18, width: '100%' }}>
        <Link href="/" asChild>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.surface,
              borderColor: colors.pink,
              borderRadius: 999,
              borderWidth: 2,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}>
            <Text style={{ color: colors.navy, fontSize: 13, fontWeight: '900' }}>Voltar</Text>
          </Pressable>
        </Link>

        <View style={{ height: 260 }} />

        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderColor: colors.pink,
            borderRadius: 28,
            borderWidth: 4,
            boxShadow: '0 10px 0 rgba(0, 0, 0, 0.22)',
            gap: 16,
            padding: 18,
          }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Badge label="Nova sala" tone="rush" />
            <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>
              Criar partida
            </Text>
          </View>

          <View style={{ gap: 10, width: '100%' }}>
            <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
              Seu apelido
            </Text>
            <TextInput placeholder="Seu apelido" placeholderTextColor={colors.muted} value="Dudu" style={inputStyle} />
          </View>

          <AvatarChoice selectedId="avatar_01" />

          <View
            style={{
              backgroundColor: colors.navy,
              borderColor: colors.lime,
              borderRadius: 16,
              borderWidth: 2,
              gap: 8,
              padding: 12,
              width: '100%',
            }}>
            <Text selectable style={{ color: colors.surface, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
              2-8 jogadores · GPS só na partida · sala temporária
            </Text>
          </View>

          <View style={{ gap: 12, width: '100%' }}>
            <GameButton href="/location-permission" label="Criar sala" />
            <GameButton href="/join-room" label="Entrar com código" variant="secondary" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
