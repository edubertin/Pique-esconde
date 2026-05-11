import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Platform, Text, useWindowDimensions, View } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';

import type { RadarHint } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import type { DeviceHeadingState } from '@/src/hooks/use-device-heading';
import { patterns } from '@/src/theme/patterns';
import { surfaces } from '@/src/theme/surfaces';

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

function RadarPulseArc({
  active,
  animation,
  color,
  rotation,
  size,
  strength,
}: {
  active: boolean;
  animation: Animated.Value;
  color: string;
  rotation: number;
  size: number;
  strength: number;
}) {
  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1.22],
  });
  const opacity = animation.interpolate({
    inputRange: [0, 0.42, 1],
    outputRange: [0, active ? strength : 0.14, 0],
  });

  return (
    <Animated.View
      style={{
        borderBottomColor: 'transparent',
        borderColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRadius: 999,
        borderRightColor: hexToRgba(color, active ? 0.82 : 0.24),
        borderTopColor: hexToRgba(color, active ? 0.82 : 0.24),
        borderWidth: 5,
        height: size,
        opacity,
        position: 'absolute',
        transform: [{ rotate: `${rotation}deg` }, { scale }],
        width: size,
      }}
    />
  );
}

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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

function RadarCone({ angle, color, confidence }: { angle: number; color: string; confidence: number }) {
  const coneWidth = confidence > 0.72 ? 58 : confidence > 0.42 ? 84 : 118;

  return (
    <View
      style={{
        alignItems: 'center',
        height: '72%',
        justifyContent: 'flex-start',
        pointerEvents: 'none',
        position: 'absolute',
        transform: [{ rotate: `${angle}deg` }],
        width: coneWidth,
      }}>
      <View
        style={{
          borderBottomColor: hexToRgba(color, confidence > 0.7 ? 0.3 : 0.18),
          borderBottomWidth: 126,
          borderLeftColor: 'transparent',
          borderLeftWidth: coneWidth / 2,
          borderRightColor: 'transparent',
          borderRightWidth: coneWidth / 2,
          height: 0,
          width: 0,
        }}
      />
    </View>
  );
}

export function RadarView({
  deviceHeading,
  hint,
  remainingCount,
  rush = false,
  timerLabel,
}: {
  deviceHeading?: DeviceHeadingState;
  hint?: RadarHint;
  remainingCount?: number;
  rush?: boolean;
  timerLabel?: string;
}) {
  const { width } = useWindowDimensions();
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const arcAnimOne = useRef(new Animated.Value(0)).current;
  const arcAnimTwo = useRef(new Animated.Value(0)).current;
  const arcAnimThree = useRef(new Animated.Value(0)).current;
  const hasNoTarget = hint?.reason === 'no_target_signal';
  const seekerSignalLost = hint?.reason === 'seeker_signal_lost';
  const band = hint?.signalStatus === 'fresh' ? (hint.band ?? 'none') : 'none';
  const meta = bandMeta[band];
  const confidenceValue = hint?.confidence ?? 0;
  const confidence = Math.round(confidenceValue * 100);
  const freshOutOfRange = hint?.signalStatus === 'fresh' && band === 'none' && typeof hint.distanceMetersApprox === 'number';
  const rawAngle = hint?.angleDegrees ?? (rush ? 42 : 28);
  const hasReliableHeading = deviceHeading?.status === 'active' && (deviceHeading.headingDegrees ?? -1) >= 0 && deviceHeading.accuracy >= 2;
  const canUseHeading = hasReliableHeading && hint?.signalStatus === 'fresh' && band !== 'none' && typeof hint?.angleDegrees === 'number';
  const angle = canUseHeading ? normalizeDegrees(rawAngle - (deviceHeading.headingDegrees ?? 0)) : rawAngle;
  const radarSize = Math.min(Math.max(width * 0.84, 284), 383);
  const arcColor = band === 'none' ? '#8EF6C1' : meta.color;
  const arcStrength = band === 'hot' ? 0.72 : band === 'warm' ? 0.54 : band === 'cold' ? 0.38 : 0.18;
  const outerArcSize = radarSize * 0.76;
  const middleArcSize = radarSize * 0.56;
  const innerArcSize = radarSize * 0.36;
  const targetColor = band === 'none' ? 'rgba(255,255,255,0.55)' : meta.color;
  const arrowColor = band === 'none' ? 'rgba(142, 246, 193, 0.42)' : meta.color;
  const statusLabel = hasNoTarget ? 'Sem alvo ativo' : seekerSignalLost ? 'GPS sem sinal' : freshOutOfRange ? 'Fora de alcance' : meta.label;
  const directionLabel = canUseHeading ? 'Direcao pelo celular' : band === 'none' ? 'Varrendo area' : 'Direcao aproximada';
  const statusBody = hasNoTarget
    ? 'Nenhum escondido ativo na rodada'
    : freshOutOfRange
      ? `${hint.distanceMetersApprox}m do alvo`
      : hint?.targetNickname ? `${hint.targetNickname} no alvo` : 'Aguardando leitura';
  const scanRotation = useMemo(
    () =>
      scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [scanAnim],
  );
  const targetPulseScale = useMemo(
    () =>
      pulseAnim.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: [1, band === 'hot' ? 1.34 : band === 'warm' ? 1.22 : 1.12, 1],
      }),
    [band, pulseAnim],
  );
  const targetPulseOpacity = useMemo(
    () =>
      pulseAnim.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: [0.28, band === 'hot' ? 0.86 : band === 'warm' ? 0.62 : 0.42, 0.24],
      }),
    [band, pulseAnim],
  );

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.timing(scanAnim, {
        duration: rush ? 2100 : band === 'hot' ? 2600 : 3600,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    scanLoop.start();

    return () => scanLoop.stop();
  }, [band, rush, scanAnim]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          duration: band === 'hot' ? 520 : band === 'warm' ? 780 : 1200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          duration: band === 'hot' ? 360 : band === 'warm' ? 520 : 820,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [band, pulseAnim]);

  useEffect(() => {
    const duration = rush ? 1100 : band === 'hot' ? 1350 : band === 'warm' ? 1750 : band === 'cold' ? 2200 : 2800;
    const makeArcTiming = (animation: Animated.Value) =>
      Animated.sequence([
        Animated.timing(animation, {
          duration,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]);
    const arcLoop = Animated.loop(
      Animated.stagger(duration * 0.24, [
        makeArcTiming(arcAnimOne),
        makeArcTiming(arcAnimTwo),
        makeArcTiming(arcAnimThree),
      ]),
    );

    arcLoop.start();

    return () => arcLoop.stop();
  }, [arcAnimOne, arcAnimThree, arcAnimTwo, band, rush]);

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

        <RadarPulseArc active={band !== 'none'} animation={arcAnimOne} color={arcColor} rotation={angle - 24} size={outerArcSize} strength={arcStrength} />
        <RadarPulseArc active={band !== 'none'} animation={arcAnimTwo} color={arcColor} rotation={angle + 114} size={middleArcSize} strength={arcStrength * 0.82} />
        <RadarPulseArc active={band !== 'none'} animation={arcAnimThree} color={arcColor} rotation={angle + 232} size={innerArcSize} strength={arcStrength * 0.68} />

        <View style={{ backgroundColor: 'rgba(142, 246, 193, 0.18)', height: 2, position: 'absolute', width: '88%' }} />
        <View style={{ backgroundColor: 'rgba(142, 246, 193, 0.18)', height: '88%', position: 'absolute', width: 2 }} />

        <Animated.View
          style={{
            backgroundColor: rush ? 'rgba(255, 204, 0, 0.44)' : 'rgba(142, 246, 193, 0.26)',
            height: 3,
            left: '50%',
            position: 'absolute',
            transform: [{ rotate: scanRotation }],
            transformOrigin: 'left center',
            width: '42%',
          }}
        />

        {band !== 'none' ? <RadarCone angle={angle} color={meta.color} confidence={confidenceValue} /> : null}
        <RadarArrow angle={angle} color={arrowColor} />

        <Animated.View
          style={{
            backgroundColor: band === 'none' ? 'rgba(255,255,255,0.16)' : hexToRgba(meta.color, 0.18),
            borderRadius: 999,
            height: 76,
            opacity: targetPulseOpacity,
            position: 'absolute',
            transform: [{ scale: targetPulseScale }],
            width: 76,
          }}
        />

        <Animated.View
          style={{
            backgroundColor: colors.surface,
            borderColor: '#8EF6C1',
            borderRadius: 999,
            borderWidth: 3,
            boxShadow: `0 0 14px ${targetColor}`,
            height: 32,
            transform: [{ scale: band === 'hot' ? targetPulseScale : 1 }],
            width: 32,
          }}
        />

        <Text selectable style={{ bottom: 22, color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '900', position: 'absolute' }}>
          RADAR
        </Text>
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,1.0)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={{ borderRadius: 19, padding: 1, width: '100%' }}>
        {Platform.OS === 'web' ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(190, 225, 255, 0.50)',
              borderRadius: 18,
              boxShadow: patterns.panel.glass.shadow,
              backdropFilter: 'blur(20px)',
              // @ts-expect-error webkit vendor prefix not in RN ViewStyle but forwarded on web
              WebkitBackdropFilter: 'blur(20px)',
              gap: 7,
              overflow: 'hidden',
              paddingHorizontal: 12,
              paddingVertical: 9,
              width: '100%',
            }}>
        {timerLabel || typeof remainingCount === 'number' ? (
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            {timerLabel ? (
              <View style={{ ...surfaces.glassTile, borderRadius: 14, flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text selectable style={{ color: colors.navy, fontSize: 10, fontWeight: '900', textAlign: 'center' }}>
                  TEMPO
                </Text>
                <Text selectable style={{ color: colors.navy, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>
                  {timerLabel}
                </Text>
              </View>
            ) : null}
            {typeof remainingCount === 'number' ? (
              <View style={{ ...surfaces.glassTile, borderRadius: 14, flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
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
        <Text selectable style={{ color: colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center' }}>
          {directionLabel}
          {deviceHeading?.status === 'active' && deviceHeading.accuracy > 0 ? ` - bussola ${deviceHeading.accuracy}/3` : ''}
        </Text>
          </View>
        ) : (
          <View style={{ borderRadius: 18, boxShadow: patterns.panel.glass.shadow, width: '100%' }}>
            <BlurView
              intensity={55}
              tint="light"
              style={{
                alignItems: 'center',
                borderRadius: 18,
                gap: 7,
                overflow: 'hidden',
                paddingHorizontal: 12,
                paddingVertical: 9,
                width: '100%',
              }}>
              {timerLabel || typeof remainingCount === 'number' ? (
                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  {timerLabel ? (
                    <View style={{ ...surfaces.glassTile, borderRadius: 14, flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text selectable style={{ color: colors.navy, fontSize: 10, fontWeight: '900', textAlign: 'center' }}>TEMPO</Text>
                      <Text selectable style={{ color: colors.navy, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>{timerLabel}</Text>
                    </View>
                  ) : null}
                  {typeof remainingCount === 'number' ? (
                    <View style={{ ...surfaces.glassTile, borderRadius: 14, flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text selectable style={{ color: colors.pink, fontSize: 10, fontWeight: '900', textAlign: 'center' }}>RESTAM</Text>
                      <Text selectable style={{ color: colors.navy, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>{remainingCount}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <View style={{ borderColor: colors.navy, borderRadius: 999, borderWidth: 2, flexDirection: 'row', height: 16, overflow: 'hidden', width: '100%' }}>
                <View style={{ backgroundColor: '#5AB8FF', flex: 1 }} />
                <View style={{ backgroundColor: '#FFD35A', flex: 1 }} />
                <View style={{ backgroundColor: '#FF5A4E', flex: 1 }} />
                <View style={{ backgroundColor: colors.surface, borderColor: colors.navy, borderRadius: 999, borderWidth: 2, height: 24, left: meta.markerLeft, marginLeft: -12, position: 'absolute', top: -5, width: 24 }} />
              </View>
              <Text selectable style={{ color: band === 'none' ? colors.ink : meta.color, fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
                {statusLabel} {confidence > 0 && !hasNoTarget ? `${confidence}%` : ''}
              </Text>
              <Text selectable style={{ color: colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>{statusBody}</Text>
              <Text selectable style={{ color: colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center' }}>
                {directionLabel}
                {deviceHeading?.status === 'active' && deviceHeading.accuracy > 0 ? ` - bussola ${deviceHeading.accuracy}/3` : ''}
              </Text>
            </BlurView>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
