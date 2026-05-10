import { Text, useWindowDimensions, View } from 'react-native';

import type { RadarHint } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

const bandMeta: Record<RadarHint['band'], { color: string; label: string; markerLeft: `${number}%` }> = {
  cold: { color: '#5AB8FF', label: 'Frio', markerLeft: '17%' },
  hot: { color: '#FF5A4E', label: 'Quente!', markerLeft: '83%' },
  none: { color: 'rgba(255,255,255,0.72)', label: 'Buscando sinal', markerLeft: '50%' },
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

function RadarArrow({ angle, color }: { angle: number; color: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
        height: '72%',
        justifyContent: 'flex-start',
        pointerEvents: 'none',
        position: 'absolute',
        transform: [{ rotate: `${angle}deg` }],
        width: 44,
      }}>
      <View
        style={{
          borderBottomColor: color,
          borderBottomWidth: 34,
          borderLeftColor: 'transparent',
          borderLeftWidth: 18,
          borderRightColor: 'transparent',
          borderRightWidth: 18,
          height: 0,
          width: 0,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderBottomLeftRadius: 999,
          borderBottomRightRadius: 999,
          boxShadow: `0 0 18px ${color}`,
          height: '42%',
          marginTop: -2,
          width: 14,
        }}
      />
    </View>
  );
}

export function RadarView({
  hint,
  remainingCount,
  rush = false,
  timerLabel,
}: {
  hint?: RadarHint;
  remainingCount?: number;
  rush?: boolean;
  timerLabel?: string;
}) {
  const { width } = useWindowDimensions();
  const hasNoTarget = hint?.reason === 'no_target_signal';
  const seekerSignalLost = hint?.reason === 'seeker_signal_lost';
  const band = hint?.signalStatus === 'fresh' ? (hint.band ?? 'none') : 'none';
  const meta = bandMeta[band];
  const confidence = Math.round((hint?.confidence ?? 0) * 100);
  const freshOutOfRange = hint?.signalStatus === 'fresh' && band === 'none' && typeof hint.distanceMetersApprox === 'number';
  const angle = hint?.angleDegrees ?? (rush ? 42 : 28);
  const radarSize = Math.min(Math.max(width * 0.84, 284), 383);
  const targetColor = band === 'none' ? 'rgba(255,255,255,0.55)' : meta.color;
  const arrowColor = band === 'none' ? 'rgba(142, 246, 193, 0.42)' : meta.color;
  const statusLabel = hasNoTarget ? 'Sem alvo ativo' : seekerSignalLost ? 'GPS sem sinal' : freshOutOfRange ? 'Fora de alcance' : meta.label;
  const statusBody = hasNoTarget
    ? 'Nenhum escondido ativo na rodada'
    : freshOutOfRange
      ? `${hint.distanceMetersApprox}m do alvo`
      : hint?.targetNickname ? `${hint.targetNickname} no alvo` : 'Aguardando leitura';

  return (
    <View style={{ alignItems: 'center', gap: 10, marginTop: -10, width: '100%' }}>
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

        <RadarArrow angle={angle} color={arrowColor} />

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: '#8EF6C1',
            borderRadius: 999,
            borderWidth: 3,
            boxShadow: `0 0 14px ${targetColor}`,
            height: 32,
            width: 32,
          }}
        />

        <Text selectable style={{ bottom: 22, color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '900', position: 'absolute' }}>
          RADAR
        </Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          borderColor: 'rgba(255, 255, 255, 0.94)',
          borderRadius: 18,
          borderWidth: 2,
          boxShadow: '0 7px 0 rgba(7, 26, 61, 0.14)',
          gap: 7,
          paddingHorizontal: 12,
          paddingVertical: 9,
          width: '100%',
        }}>
        {timerLabel || typeof remainingCount === 'number' ? (
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            {timerLabel ? (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.82)',
                  borderColor: colors.navy,
                  borderRadius: 14,
                  borderWidth: 2,
                  flex: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}>
                <Text selectable style={{ color: colors.navy, fontSize: 10, fontWeight: '900', textAlign: 'center' }}>
                  TEMPO
                </Text>
                <Text selectable style={{ color: colors.navy, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>
                  {timerLabel}
                </Text>
              </View>
            ) : null}
            {typeof remainingCount === 'number' ? (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.82)',
                  borderColor: colors.navy,
                  borderRadius: 14,
                  borderWidth: 2,
                  flex: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}>
                <Text selectable style={{ color: colors.pink, fontSize: 10, fontWeight: '900', textAlign: 'center' }}>
                  RESTAM
                </Text>
                <Text selectable style={{ color: colors.navy, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>
                  {remainingCount}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
        <View
          style={{
            borderColor: colors.navy,
            borderRadius: 999,
            borderWidth: 2,
            flexDirection: 'row',
            height: 16,
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
        <Text selectable style={{ color: band === 'none' ? colors.ink : meta.color, fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
          {statusLabel} {confidence > 0 && !hasNoTarget ? `${confidence}%` : ''}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>
          {statusBody}
        </Text>
      </View>
    </View>
  );
}
