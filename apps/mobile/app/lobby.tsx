import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { BrandLogo } from '@/src/components/brand-logo';
import { GameButton } from '@/src/components/game-button';
import { PlayerList } from '@/src/components/player-list';
import { Panel, PrototypeScreen } from '@/src/components/prototype-screen';
import { RoomQrModal } from '@/src/components/room-qr-modal';
import { useSafeRouter } from '@/src/hooks/use-safe-router';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { patterns } from '@/src/theme/patterns';
import { surfaces } from '@/src/theme/surfaces';
import { buildRoomInviteUrl } from '@/src/utils/invite-link';
import { isDevGpsEnabled } from '@/src/utils/dev-gps';

function secondsToLabel(seconds: number) {
  return seconds >= 60 ? `${Math.round(seconds / 60)}min` : `${seconds}s`;
}

function environmentLabel(preset?: string) {
  if (preset === 'small') return t('rules.environmentSmall');
  if (preset === 'large') return t('rules.environmentLarge');
  return t('rules.environmentMedium');
}

export default function LobbyScreen() {
  const router = useSafeRouter();
  const { activePlayer, error, isLoading, isRoomSyncing, lastRoomSyncedAt, leaveRoom, promoteLeader, removePlayer, room, startRound, toggleReady } = useRoom();
  const [copied, setCopied] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string>();
  const isLeavingRef = useRef(false);
  const [now, setNow] = useState(Date.now());
  const [qrOpen, setQrOpen] = useState(false);
  const players = room?.players ?? [];
  const inviteUrl = useMemo(() => (room?.code ? buildRoomInviteUrl(room.code) : ''), [room?.code]);
  const isLeader = Boolean(activePlayer?.isLeader);
  const notReadyPlayers = players.filter((player) => !player.isLeader && player.status !== 'Preparado');
  const canLeaderStart = isLeader && players.length >= 2 && notReadyPlayers.length === 0;
  const lobbyNoticeNames =
    room?.lobbyNotice?.type === 'players_not_ready'
      ? room.lobbyNotice.names.filter((name) => players.some((player) => player.nickname === name && !player.isLeader && player.status !== 'Preparado'))
      : [];
  const missingReadyNames = lobbyNoticeNames.join(', ');
  const isActivePlayerMissingReady = Boolean(
    activePlayer && !activePlayer.isLeader && activePlayer.status !== 'Preparado' && lobbyNoticeNames.includes(activePlayer.nickname),
  );
  const notReadyNoticeBody = isLeader
    ? t('lobby.notReadyBody', { names: missingReadyNames })
    : isActivePlayerMissingReady
      ? t('lobby.notReadyPlayerBody')
      : t('lobby.notReadyReadyBody', { names: missingReadyNames });
  const readyLabel = activePlayer?.status === 'Preparado' ? t('lobby.readyDone') : t('lobby.ready');
  const syncAgeSeconds = lastRoomSyncedAt ? Math.max(0, Math.round((now - lastRoomSyncedAt) / 1000)) : undefined;
  const showSyncWarning = Boolean(syncAgeSeconds != null && syncAgeSeconds > 8);
  const syncLabel = isRoomSyncing ? t('lobby.syncReconnecting') : t('lobby.syncUnstable');
  const roomWarning =
    room?.closedReason === 'seeker_left'
      ? { body: t('lobby.seekerLeftBody'), title: t('lobby.roundInterruptedTitle') }
      : room?.closedReason === 'not_enough_players'
        ? { body: t('lobby.notEnoughPlayersBody'), title: t('lobby.roundInterruptedTitle') }
        : undefined;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = async () => {
    if (!room?.code) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(room.code);
        setCopied(true);
        setInviteFeedback(t('lobby.copyDone'));
        setTimeout(() => setCopied(false), 1600);
        setTimeout(() => setInviteFeedback(undefined), 2200);
      } else {
        setInviteFeedback(t('lobby.copyUnavailable'));
        setTimeout(() => setInviteFeedback(undefined), 2200);
      }
    } catch {
      setInviteFeedback(t('lobby.copyUnavailable'));
      setTimeout(() => setInviteFeedback(undefined), 2200);
    }
  };

  const handleShareInvite = async () => {
    if (!room?.code || !inviteUrl) return;

    const message = t('lobby.inviteMessage', { code: room.code, url: inviteUrl });

    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({
          text: message,
          title: t('lobby.inviteTitle'),
          url: inviteUrl,
        });
      } else {
        await Share.share({
          message,
          title: t('lobby.inviteTitle'),
          url: inviteUrl,
        });
      }
      setInviteFeedback(undefined);
    } catch {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteFeedback(t('common.codeCopied'));
        setTimeout(() => setInviteFeedback(undefined), 1800);
        return;
      }

      setInviteFeedback(t('lobby.shareUnavailable'));
    }
  };

  const handleLeaveRoom = async () => {
    if (isLeavingRef.current || isLoading) return;

    isLeavingRef.current = true;
    try {
      await leaveRoom();
      router.replace('/');
    } catch {
      // Error is shown from room store state.
    } finally {
      isLeavingRef.current = false;
    }
  };

  const ensureLocationPermission = async () => {
    if (isDevGpsEnabled()) return true;

    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status === Location.PermissionStatus.GRANTED) return true;

    router.push('/location-permission');
    return false;
  };

  const handleStartRound = async () => {
    if (!canLeaderStart) return;

    try {
      if (!(await ensureLocationPermission())) return;

      const started = await startRound();
      if (started) {
        router.push('/hide-phase');
      }
    } catch {
      // Error is shown from room store state.
    }
  };

  const handleToggleReady = () => {
    ensureLocationPermission()
      .then((allowed) => {
        if (allowed) toggleReady().catch(() => undefined);
      })
      .catch(() => router.push('/location-permission'));
  };

  const handlePromoteLeader = (playerId: string) => {
    promoteLeader(playerId).catch(() => undefined);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId).catch(() => undefined);
  };

  return (
    <PrototypeScreen>
      {room?.code && inviteUrl ? (
        <RoomQrModal inviteUrl={inviteUrl} onClose={() => setQrOpen(false)} roomCode={room.code} visible={qrOpen} />
      ) : null}

      <View style={{ gap: 0, marginTop: -20, width: '100%' }}>
        <View style={{ maxWidth: patterns.layout.panelMaxWidth, width: '100%' }}>
          <BrandLogo />
        </View>

      <View style={{ marginTop: -30, width: '100%' }}>
      <Panel tone="glass">
        <Pressable
          accessibilityLabel={t('lobby.rules')}
          accessibilityRole="button"
          onPress={() => router.push('/rules')}
          style={{
            ...surfaces.glassTile,
            borderRadius: 18,
            gap: 10,
            padding: 12,
            width: '100%',
          }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <Ionicons color={colors.navy} name="options-outline" size={20} />
              <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: '900' }}>
                {t('rules.title')}
              </Text>
            </View>
            <Ionicons color={colors.navy} name="chevron-forward" size={20} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Badge label={environmentLabel(room?.rules.environmentPreset)} tone="neutral" />
            </View>
            <View style={{ flex: 1 }}>
              <Badge label={secondsToLabel(room?.rules.hideDurationSeconds ?? 60)} tone="waiting" />
            </View>
            <View style={{ flex: 1 }}>
              <Badge label={secondsToLabel(room?.rules.seekDurationSeconds ?? 180)} tone="ready" />
            </View>
          </View>
        </Pressable>

        <View style={{ gap: 10, width: '100%' }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8, minWidth: 0 }}>
              <Text selectable style={{ color: colors.ink, fontSize: 19, fontWeight: '900' }}>
                Lobby:
              </Text>
              <Text selectable style={{ color: colors.pink, fontSize: 19, fontWeight: '900' }}>
                {room?.code ?? '----'}
              </Text>
              <Pressable
                aria-label={t('lobby.copyCode')}
                accessibilityLabel={t('lobby.copyCode')}
                accessibilityRole="button"
                onPress={handleCopyCode}
                testID="lobby-copy-code"
                style={{
                  ...(copied ? surfaces.iconButton : surfaces.iconButtonActive),
                  alignItems: 'center',
                  borderColor: copied ? colors.green : surfaces.iconButtonActive.borderColor,
                  borderRadius: 12,
                  height: 34,
                  justifyContent: 'center',
                  width: 34,
              }}>
                <Ionicons color={copied ? colors.green : colors.navy} name={copied ? 'checkmark' : 'copy-outline'} size={18} />
              </Pressable>
              <Pressable
                aria-label={t('lobby.openQr')}
                accessibilityLabel={t('lobby.openQr')}
                accessibilityRole="button"
                onPress={() => setQrOpen(true)}
                testID="lobby-open-qr"
                style={{
                  ...surfaces.iconButton,
                  alignItems: 'center',
                  borderRadius: 12,
                  height: 34,
                  justifyContent: 'center',
                  width: 34,
                }}>
                <Ionicons color={colors.navy} name="qr-code-outline" size={18} />
              </Pressable>
            </View>
            <Badge label={`${players.length}/${room?.maxPlayers ?? 8}`} tone="rush" />
          </View>
          {inviteFeedback ? (
            <Text selectable style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>
              {inviteFeedback}
            </Text>
          ) : null}
          {showSyncWarning ? (
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
              <Ionicons color={colors.danger} name={isRoomSyncing ? 'sync-outline' : 'warning-outline'} size={14} />
              <Text selectable style={{ color: colors.danger, fontSize: 12, fontWeight: '900' }}>
                {syncLabel}
              </Text>
            </View>
          ) : null}
          <PlayerList
            activePlayerId={activePlayer?.id}
            canRemove={activePlayer?.isLeader}
            onPromote={activePlayer?.isLeader ? handlePromoteLeader : undefined}
            onRemove={handleRemovePlayer}
            players={players}
          />
        </View>
      </Panel>
      </View>
      </View>

      <View style={{ gap: 10, maxWidth: patterns.layout.panelMaxWidth, width: '100%' }}>
        {lobbyNoticeNames.length > 0 ? (
          <View
            style={{
              ...surfaces.warningTile,
              borderRadius: 16,
              gap: 4,
              padding: 12,
              width: '100%',
            }}>
            <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
              {t('lobby.notReadyTitle')}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' }}>
              {notReadyNoticeBody}
            </Text>
          </View>
        ) : null}
        {roomWarning ? (
          <View
            style={{
              ...surfaces.warningTile,
              borderRadius: 16,
              gap: 4,
              padding: 12,
              width: '100%',
            }}>
            <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
              {roomWarning.title}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' }}>
              {roomWarning.body}
            </Text>
          </View>
        ) : null}
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}

        {isLeader ? (
          <GameButton
            disabled={!canLeaderStart || isLoading}
            label={canLeaderStart ? (isLoading ? 'Sincronizando...' : t('lobby.start')) : t('lobby.startWaiting')}
            onPress={handleStartRound}
            variant="primary"
          />
        ) : (
          <GameButton label={readyLabel} onPress={handleToggleReady} variant="secondary" />
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <GameButton label={t('lobby.invite')} onPress={handleShareInvite} size="compact" variant="secondary" />
          </View>
          <View style={{ flex: 1 }}>
            <GameButton disabled={isLoading} label={t('common.exit')} onPress={handleLeaveRoom} size="compact" variant="dangerStrong" />
          </View>
        </View>
      </View>
    </PrototypeScreen>
  );
}
