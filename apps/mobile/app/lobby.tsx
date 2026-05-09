import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  const { activePlayer, addDemoPlayer, leaveRoom, promoteLeader, removePlayer, room, startRound, toggleReady } = useRoom();
  const [copied, setCopied] = useState(false);
  const players = room?.players ?? [];
  const readyLabel = activePlayer?.status === 'Preparado' ? t('lobby.readyDone') : t('lobby.ready');

  const handleCopyCode = async () => {
    if (!room?.code) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(room.code);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.replace('/');
  };

  const handleStartRound = () => {
    if (players.length < 2) {
      return;
    }

    startRound();
    router.push('/hide-phase');
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
            <GameButton label={t('lobby.start')} onPress={handleStartRound} variant="secondary" />
            <ActionGrid
              actions={[
                { label: readyLabel, onPress: toggleReady },
                { href: '/rules', label: t('lobby.rules'), variant: 'ghost' },
                { label: t('lobby.invite'), onPress: addDemoPlayer, variant: 'ghost' },
                { label: t('common.exit'), onPress: handleLeaveRoom, variant: 'danger' },
              ]}
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
        <PlayerList
          activePlayerId={activePlayer?.id}
          canRemove={activePlayer?.isLeader}
          onPromote={promoteLeader}
          onRemove={removePlayer}
          players={players}
        />
      </MenuPanel>
    </PrototypeScreen>
  );
}
