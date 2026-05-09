import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActionGrid } from '@/src/components/action-grid';
import { Badge } from '@/src/components/badge';
import { CoverBanner } from '@/src/components/cover-banner';
import { GameButton } from '@/src/components/game-button';
import { PlayerList } from '@/src/components/player-list';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { t } from '@/src/i18n';
import { useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

export default function LobbyScreen() {
  const router = useRouter();
  const { activePlayer, addDemoPlayer, error, isLoading, leaveRoom, promoteLeader, removePlayer, room, startRound, toggleReady } = useRoom();
  const [copied, setCopied] = useState(false);
  const players = room?.players ?? [];
  const isLeader = Boolean(activePlayer?.isLeader);
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
  const roomWarning =
    room?.closedReason === 'seeker_left'
      ? { body: t('lobby.seekerLeftBody'), title: t('lobby.roundInterruptedTitle') }
      : room?.closedReason === 'not_enough_players'
        ? { body: t('lobby.notEnoughPlayersBody'), title: t('lobby.roundInterruptedTitle') }
        : undefined;

  useEffect(() => {
    if (!room) {
      router.replace('/');
      return;
    }

    if (room.phase === 'hiding') {
      router.replace('/hide-phase');
      return;
    }

    if (room.phase === 'seeking') {
      router.replace(activePlayer?.isLeader ? '/seeker-radar' : '/hider-status');
      return;
    }

    if (room.phase === 'finished') {
      router.replace('/result');
    }
  }, [activePlayer?.isLeader, room, router]);

  const handleCopyCode = async () => {
    if (!room?.code) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(room.code);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      router.replace('/');
    } catch {
      // Error is shown from room store state.
    }
  };

  const handleStartRound = async () => {
    try {
      const started = await startRound();
      if (started) {
        router.push('/hide-phase');
      }
    } catch {
      // Error is shown from room store state.
    }
  };

  const handleAddDemoPlayer = () => {
    addDemoPlayer().catch(() => undefined);
  };

  const handleToggleReady = () => {
    toggleReady().catch(() => undefined);
  };

  const handlePromoteLeader = (playerId: string) => {
    promoteLeader(playerId).catch(() => undefined);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId).catch(() => undefined);
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        title={t('lobby.title', { code: room?.code ?? '----' })}
        meta={
          copied ? (
            <Text selectable style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>
              {t('common.codeCopied')}
            </Text>
          ) : null
        }
        headerAction={
          <Pressable
            accessibilityLabel={t('lobby.copyCode')}
            accessibilityRole="button"
            onPress={handleCopyCode}
            style={{
              ...(copied ? surfaces.iconButton : surfaces.iconButtonActive),
              alignItems: 'center',
              borderColor: copied ? colors.green : surfaces.iconButtonActive.borderColor,
              borderRadius: 14,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}>
            <Ionicons color={copied ? colors.green : colors.navy} name={copied ? 'checkmark' : 'copy-outline'} size={21} />
          </Pressable>
        }
        actions={
          <>
            {isLeader ? (
              <GameButton label={isLoading ? 'Sincronizando...' : t('lobby.start')} onPress={handleStartRound} variant="secondary" />
            ) : (
              <GameButton label={readyLabel} onPress={handleToggleReady} variant="secondary" />
            )}
            <ActionGrid
              actions={
                isLeader
                  ? [
                      { label: readyLabel, onPress: handleToggleReady },
                      { href: '/rules', label: t('lobby.rules'), variant: 'ghost' },
                      { label: t('lobby.invite'), onPress: handleAddDemoPlayer, variant: 'ghost' },
                      { label: t('common.exit'), onPress: handleLeaveRoom, variant: 'danger' },
                    ]
                  : [
                      { href: '/rules', label: t('lobby.rules'), variant: 'ghost' },
                      { label: t('common.exit'), onPress: handleLeaveRoom, variant: 'danger' },
                    ]
              }
            />
          </>
        }>
        <CoverBanner />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
            {t('lobby.players')}
          </Text>
          <Badge label={`${players.length}/${room?.maxPlayers ?? 8}`} tone="rush" />
        </View>
        {room?.expiresAt ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {t('lobby.soloExpires')}
          </Text>
        ) : null}
        {activePlayer?.isLeader && players.length > 1 ? (
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {t('lobby.leaderHint')}
          </Text>
        ) : null}
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
        <PlayerList
          activePlayerId={activePlayer?.id}
          canRemove={activePlayer?.isLeader}
          onPromote={activePlayer?.isLeader ? handlePromoteLeader : undefined}
          onRemove={handleRemovePlayer}
          players={players}
        />
      </MenuPanel>
    </PrototypeScreen>
  );
}
