import { Text, View } from 'react-native';

import type { RadarHint } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

const lampStyles: Record<RadarHint['band'], { activeColor: string; label: string }> = {
  cold: { activeColor: colors.blue, label: 'Frio' },
  hot: { activeColor: colors.pink, label: 'Quente' },
  none: { activeColor: colors.line, label: 'Sinal instavel' },
  warm: { activeColor: colors.yellow, label: 'Morno' },
};

function SignalLamp({ active, color, label }: { active: boolean; color: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 6, minWidth: 86 }}>
      <View
        style={{
          backgroundColor: active ? color : 'rgba(89, 112, 143, 0.18)',
          borderColor: active ? colors.navy : 'rgba(89, 112, 143, 0.24)',
          borderRadius: 999,
          borderWidth: 2,
          boxShadow: active ? `0 6px 0 ${color}44` : '0 3px 0 rgba(7, 26, 61, 0.08)',
          height: 42,
          width: 42,
        }}
      />
      <Text selectable style={{ color: active ? colors.ink : colors.muted, fontSize: 12, fontWeight: '900' }}>
        {label}
      </Text>
    </View>
  );
}

export function RadarView({ hint, rush = false }: { hint?: RadarHint; rush?: boolean }) {
  const band = hint?.signalStatus === 'fresh' ? (hint.band ?? 'none') : 'none';
  const confidence = Math.round((hint?.confidence ?? 0) * 100);
  const angle = hint?.angleDegrees ?? (rush ? 42 : 28);
  const pointerOpacity = 0.45 + (hint?.confidence ?? 0.25) * 0.55;
  const label = band === 'none' ? lampStyles.none.label : lampStyles[band].label;

  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <View
        style={{
          alignItems: 'center',
          aspectRatio: 1,
          backgroundColor: rush || band === 'hot' ? colors.warningSoft : '#ECF9FF',
          borderColor: colors.navy,
          borderRadius: 999,
          borderWidth: 5,
          boxShadow: band === 'hot' ? '0 10px 0 rgba(255, 45, 141, 0.18)' : '0 10px 0 rgba(10, 132, 255, 0.14)',
          justifyContent: 'center',
          maxWidth: 360,
          width: '100%',
        }}>
        <View
          style={{
            borderColor: band === 'hot' ? colors.pink : colors.blue,
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
            backgroundColor: band === 'none' ? colors.muted : lampStyles[band].activeColor,
            borderColor: colors.surface,
            borderRadius: 999,
            borderWidth: 3,
            height: 18,
            position: 'absolute',
            right: '28%',
            top: band === 'hot' ? '22%' : '32%',
            width: 18,
          }}
        />
        <View
          style={{
            backgroundColor: band === 'hot' ? colors.pink : colors.esconde,
            borderRadius: 999,
            height: 8,
            opacity: pointerOpacity,
            transform: [{ rotate: `${angle}deg` }],
            width: '42%',
          }}
        />
      </View>

      <View
        style={{
          ...surfaces.glassTile,
          borderRadius: 18,
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 10,
          paddingVertical: 12,
          width: '100%',
        }}>
        <SignalLamp active={band === 'cold'} color={colors.blue} label="Frio" />
        <SignalLamp active={band === 'warm'} color={colors.yellow} label="Morno" />
        <SignalLamp active={band === 'hot'} color={colors.pink} label="Quente" />
      </View>

      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
        {label} {confidence > 0 ? `- ${confidence}%` : ''}
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>
        {hint?.targetNickname ? `${hint.targetNickname} esta no alvo do radar.` : 'Procurando sinal dos escondidos.'}
      </Text>
    </View>
  );
}
