import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function RadarView({ rush = false }: { rush?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <View
        style={{
          alignItems: 'center',
          aspectRatio: 1,
          backgroundColor: rush ? colors.warningSoft : '#ECF9FF',
          borderColor: colors.navy,
          borderRadius: 999,
          borderWidth: 5,
          boxShadow: rush ? '0 10px 0 rgba(255, 45, 141, 0.18)' : '0 10px 0 rgba(10, 132, 255, 0.14)',
          justifyContent: 'center',
          maxWidth: 280,
          width: '100%',
        }}>
        <View
          style={{
            borderColor: rush ? colors.pink : colors.blue,
            borderRadius: 999,
            borderWidth: 3,
            height: '68%',
            position: 'absolute',
            width: '68%',
          }}
        />
        <View
          style={{
            borderColor: colors.lime,
            borderRadius: 999,
            borderWidth: 3,
            height: '42%',
            position: 'absolute',
            width: '42%',
          }}
        />
        <View
          style={{
            backgroundColor: colors.pink,
            borderColor: colors.surface,
            borderRadius: 999,
            borderWidth: 3,
            height: 18,
            position: 'absolute',
            right: '28%',
            top: rush ? '22%' : '32%',
            width: 18,
          }}
        />
        <View
          style={{
            backgroundColor: rush ? colors.pink : colors.esconde,
            borderRadius: 999,
            height: 8,
            transform: [{ rotate: rush ? '42deg' : '28deg' }],
            width: '42%',
          }}
        />
      </View>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
        {rush ? 'Radar no máximo' : 'Sinal morno'}
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>
        Ponteiro aproximado, com som e vibração conforme a proximidade.
      </Text>
    </View>
  );
}
