import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import type { RadarHint, RoomDebugSnapshot } from '@/src/state/room-store';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';

function DebugRow({ label, value }: { label: string; value?: number | string | null }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
      <Text style={{ color: 'rgba(255,255,255,0.68)', flex: 1, fontSize: 11, fontWeight: '800' }}>{label}</Text>
      <Text selectable style={{ color: colors.surface, flex: 1.4, fontSize: 11, fontWeight: '900', textAlign: 'right' }}>
        {value ?? '-'}
      </Text>
    </View>
  );
}

function PlayerDebugCard({ player }: { player: RoomDebugSnapshot['players'][number] }) {
  const signalColor = player.signalStatus === 'fresh' ? colors.green : player.signalStatus === 'warning' ? colors.yellow : colors.danger;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.14)',
        borderRadius: 12,
        borderWidth: 1,
        gap: 5,
        padding: 8,
      }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
        <Text selectable numberOfLines={1} style={{ color: colors.surface, flex: 1, fontSize: 12, fontWeight: '900' }}>
          {player.nickname}
        </Text>
        <View style={{ backgroundColor: signalColor, borderRadius: 999, height: 9, width: 9 }} />
      </View>
      <DebugRow label="status" value={`${player.status}${player.isSeeker ? ' / seeker' : ''}`} />
      <DebugRow label="gps idade" value={player.signalAgeSeconds == null ? 'sem leitura' : `${player.signalAgeSeconds}s`} />
      <DebugRow label="gps status" value={player.signalStatus} />
      <DebugRow label="accuracy" value={player.accuracyMeters == null ? null : `${player.accuracyMeters}m`} />
      <DebugRow label="hide spot" value={player.hasHideSpot ? 'sim' : 'nao'} />
      <DebugRow label="drift" value={player.hideDriftMeters == null ? null : `${player.hideDriftMeters}m`} />
    </View>
  );
}

export function LeaderDebugDrawer({ radarHint }: { radarHint?: RadarHint }) {
  const { activePlayer, clearDevTestDistance, getRoomDebugSnapshot, room } = useRoom();
  const [debugSnapshot, setDebugSnapshot] = useState<RoomDebugSnapshot>();
  const [isOpen, setIsOpen] = useState(false);
  const [lastError, setLastError] = useState<string>();

  const enabled = __DEV__ && Platform.OS === 'web' && Boolean(activePlayer?.isLeader);

  useEffect(() => {
    if (!enabled || !isOpen) return undefined;

    let cancelled = false;
    const refresh = () => {
      getRoomDebugSnapshot()
        .then((snapshot) => {
          if (cancelled || !snapshot) return;
          setDebugSnapshot(snapshot);
          setLastError(undefined);
        })
        .catch((error: unknown) => {
          if (!cancelled) setLastError(error instanceof Error ? error.message : 'Falha no debug snapshot');
        });
    };

    refresh();
    const interval = setInterval(refresh, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, getRoomDebugSnapshot, isOpen]);

  if (!enabled) return null;

  const clearDev = () => {
    clearDevTestDistance()
      .then(() => getRoomDebugSnapshot())
      .then((snapshot) => {
        if (snapshot) setDebugSnapshot(snapshot);
        setLastError(undefined);
      })
      .catch((error: unknown) => {
        setLastError(error instanceof Error ? error.message : 'Falha ao limpar DEV GPS');
      });
  };

  return (
    <View pointerEvents="box-none" style={{ left: -14, position: 'absolute', top: 112, zIndex: 30 }}>
      <Pressable
        accessibilityLabel={isOpen ? 'Fechar debug' : 'Abrir debug'}
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={{
          alignItems: 'center',
          backgroundColor: colors.navy,
          borderColor: colors.green,
          borderRadius: 999,
          borderWidth: 2,
          height: 46,
          justifyContent: 'center',
          width: 46,
        }}>
        <Ionicons color={colors.surface} name={isOpen ? 'close' : 'bug'} size={22} />
      </Pressable>

      {isOpen ? (
        <View
          style={{
            backgroundColor: 'rgba(7, 26, 61, 0.94)',
            borderColor: colors.green,
            borderRadius: 18,
            borderWidth: 2,
            boxShadow: '0 10px 0 rgba(7, 26, 61, 0.22)',
            gap: 10,
            marginTop: 8,
            maxHeight: 560,
            padding: 10,
            width: 318,
          }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => {
                getRoomDebugSnapshot()
                  .then((snapshot) => {
                    if (snapshot) setDebugSnapshot(snapshot);
                  })
                  .catch((error: unknown) => setLastError(error instanceof Error ? error.message : 'Falha no debug snapshot'));
              }}
              style={{ backgroundColor: colors.green, borderRadius: 999, flex: 1, padding: 9 }}>
              <Text style={{ color: colors.surface, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>Atualizar</Text>
            </Pressable>
            <Pressable onPress={clearDev} style={{ backgroundColor: colors.surface, borderRadius: 999, flex: 1, padding: 9 }}>
              <Text style={{ color: colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>GPS real</Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 490 }}>
            <View style={{ gap: 10 }}>
              <Text style={{ color: colors.green, fontSize: 13, fontWeight: '900' }}>Sala Tecnica</Text>
              <DebugRow label="room" value={debugSnapshot?.roomCode ?? room?.code} />
              <DebugRow label="fase" value={debugSnapshot?.roomPhase ?? room?.phase} />
              <DebugRow label="session" value={debugSnapshot?.gameSession?.status ?? 'sem sessao'} />
              <DebugRow label="seek age" value={debugSnapshot?.gameSession?.seekAgeSeconds == null ? null : `${debugSnapshot.gameSession.seekAgeSeconds}s`} />
              <DebugRow label="closed" value={debugSnapshot?.closedReason} />

              <Text style={{ color: colors.green, fontSize: 13, fontWeight: '900', marginTop: 4 }}>DEV GPS servidor</Text>
              <DebugRow label="ativo" value={debugSnapshot?.devDistance?.active ? 'sim' : 'nao'} />
              <DebugRow label="distancia" value={debugSnapshot?.devDistance ? `${debugSnapshot.devDistance.distanceMeters}m` : null} />
              <DebugRow label="idade" value={debugSnapshot?.devDistance ? `${debugSnapshot.devDistance.ageSeconds}s` : null} />

              <Text style={{ color: colors.green, fontSize: 13, fontWeight: '900', marginTop: 4 }}>Radar bruto</Text>
              <DebugRow label="band" value={radarHint?.band} />
              <DebugRow label="distancia" value={radarHint?.distanceMetersApprox == null ? null : `${radarHint.distanceMetersApprox}m`} />
              <DebugRow label="angulo" value={radarHint?.angleDegrees == null ? null : `${Math.round(radarHint.angleDegrees)}deg`} />
              <DebugRow label="signal" value={radarHint?.signalStatus} />
              <DebugRow label="capture" value={radarHint?.canCapture ? 'sim' : 'nao'} />
              <DebugRow label="motivo" value={radarHint?.reason} />

              <Text style={{ color: colors.green, fontSize: 13, fontWeight: '900', marginTop: 4 }}>Jogadores</Text>
              {debugSnapshot?.players.map((player) => (
                <PlayerDebugCard key={player.id} player={player} />
              ))}

              {lastError ? (
                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '900', textAlign: 'center' }}>{lastError}</Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
