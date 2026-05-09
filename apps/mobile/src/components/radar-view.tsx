import { Text, useWindowDimensions, View } from 'react-native';

import type { RadarHint } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const bandMeta: Record<RadarHint['band'], { color: string; label: string; markerLeft: `${number}%` }> = {
  cold: { color: '#5AB8FF', label: 'Frio', markerLeft: '17%' },
  hot: { color: '#FF5A4E', label: 'Quente!', markerLeft: '83%' },
  none: { color: 'rgba(255,255,255,0.72)', label: 'Sinal instavel', markerLeft: '50%' },
  warm: { color: '#FFD35A', label: 'Morno', markerLeft: '50%' },
};

function RadarRing({ size }: { size: `${number}%` }) {
  return (
    <View
      style={{
        borderColor: 'rgba(142, 246, 193, 0.28)',
        borderRadius: 999,
        borderWidth: 2,
        height: size,
        position: 'absolute',
        width: size,
      }}
    />
  );
}

export function RadarView({ hint, rush = false }: { hint?: RadarHint; rush?: boolean }) {
  const { width } = useWindowDimensions();
  const band = hint?.signalStatus === 'fresh' ? (hint.band ?? 'none') : 'none';
  const meta = bandMeta[band];
  const confidence = Math.round((hint?.confidence ?? 0) * 100);
  const angle = hint?.angleDegrees ?? (rush ? 42 : 28);
  const radarSize = Math.min(Math.max(width * 0.76, 258), 348);
  const targetColor = band === 'none' ? 'rgba(255,255,255,0.55)' : meta.color;

  return (
    <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#123F3C',
          borderColor: '#8EF6C1',
          borderRadius: 999,
          borderWidth: 6,
          boxShadow: '0 12px 0 rgba(7, 26, 61, 0.28)',
          height: radarSize,
          justifyContent: 'center',
          overflow: 'hidden',
          width: radarSize,
        }}>
        <RadarRing size="78%" />
        <RadarRing size="54%" />
        <RadarRing size="30%" />

        <View style={{ backgroundColor: 'rgba(142, 246, 193, 0.18)', height: 2, position: 'absolute', width: '88%' }} />
        <View style={{ backgroundColor: 'rgba(142, 246, 193, 0.18)', height: '88%', position: 'absolute', width: 2 }} />

        <View
          style={{
            backgroundColor: 'rgba(100, 255, 190, 0.20)',
            height: 12,
            position: 'absolute',
            transform: [{ rotate: `${angle}deg` }],
            width: '48%',
          }}
        />

        <View
          style={{
            backgroundColor: targetColor,
            borderColor: colors.surface,
            borderRadius: 999,
            borderWidth: 3,
            boxShadow: `0 0 18px ${targetColor}`,
            height: 22,
            position: 'absolute',
            right: '28%',
            top: band === 'hot' ? '20%' : '29%',
            width: 22,
          }}
        />

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: '#8EF6C1',
            borderRadius: 999,
            borderWidth: 4,
            height: 28,
            width: 28,
          }}
        />

        <Text selectable style={{ bottom: 22, color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '900', position: 'absolute' }}>
          RADAR
        </Text>
      </View>

      <View style={{ alignItems: 'center', gap: 8, width: '82%' }}>
        <View
          style={{
            borderColor: 'rgba(255,255,255,0.72)',
            borderRadius: 999,
            borderWidth: 2,
            flexDirection: 'row',
            height: 18,
            overflow: 'hidden',
            width: '100%',
          }}>
          <View style={{ backgroundColor: '#5AB8FF', flex: 1 }} />
          <View style={{ backgroundColor: '#FFD35A', flex: 1 }} />
          <View style={{ backgroundColor: '#FF5A4E', flex: 1 }} />
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.navy,
              borderRadius: 999,
              borderWidth: 2,
              height: 24,
              left: meta.markerLeft,
              marginLeft: -12,
              position: 'absolute',
              top: -5,
              width: 24,
            }}
          />
        </View>
        <Text selectable style={{ color: meta.color, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
          {meta.label} {confidence > 0 ? `${confidence}%` : ''}
        </Text>
        <Text selectable style={{ color: 'rgba(255,255,255,0.86)', fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
          {hint?.targetNickname ? `${hint.targetNickname} no alvo` : 'Buscando sinal'}
        </Text>
      </View>
    </View>
  );
}
