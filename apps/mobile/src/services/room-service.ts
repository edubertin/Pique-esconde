import type { RealtimeChannel } from '@supabase/supabase-js';

import { gameRules } from '@/src/constants/game';
import { assertSupabase } from '@/src/services/supabase-client';
import type { GameResult, GameSession, LobbyNotice, PlayerStatus, RoomPlayer } from '@/src/state/room-store';

export type RemoteRoomPhase = 'lobby' | 'hiding' | 'seeking' | 'finished';

export type RemoteRoomSnapshot = {
  activePlayer?: RoomPlayer;
  activePlayerExitReason?: 'not_hidden_in_time';
  activePlayerToken?: string;
  room: {
    closedReason?: 'not_enough_players' | 'seeker_left';
    code: string;
    expiresAt?: number;
    gameSession?: GameSession;
    id: string;
    lobbyNotice?: LobbyNotice;
    maxPlayers: number;
    phase: RemoteRoomPhase;
    players: RoomPlayer[];
    result?: GameResult;
  };
};

type PlayerInput = {
  avatarId: string;
  nickname: string;
};

type RemoteRoomRow = {
  closed_reason: 'not_enough_players' | 'seeker_left' | null;
  code: string;
  expires_at: string | null;
  id: string;
  lobby_notice: RemoteLobbyNotice | null;
  max_players: number;
  phase: RemoteRoomPhase;
  result: RemoteResult | null;
};

type RemoteGameSessionRow = {
  hide_duration_seconds: number;
  id: string;
  seek_duration_seconds: number;
  seek_started_at: string | null;
  seeker_player_id: string;
  started_at: string;
  status: GameSession['status'];
};

type RemoteLobbyNotice = {
  createdAt?: string;
  names?: string[];
  type?: 'players_not_ready';
};

type RemotePlayerExitNoticeRow = {
  reason: 'not_hidden_in_time';
};

type RemotePlayerRow = {
  avatar_id: string;
  id: string;
  is_leader: boolean;
  nickname: string;
  status: PlayerStatus;
};

type RemoteResult = {
  capturedPlayerIds: string[];
  durationLabel: string;
  highlightAvatarId?: string;
  highlightPlayerId: string;
  highlightNickname?: string;
  seekerAvatarId?: string;
  seekerNickname?: string;
  seekerPlayerId?: string;
  survivorPlayerIds: string[];
  winner: GameResult['winner'];
};

type RoomPayload = {
  activePlayerId?: string;
  playerSessionToken?: string;
  roomId: string;
};

type CapturePayload = {
  capturedPlayerId?: string;
  remainingHiders?: number;
};

type StartRoundPayload = {
  started?: boolean;
};

type RoomSubscription = {
  unsubscribe: () => Promise<void>;
};

function assertRoomPayload(value: unknown): RoomPayload {
  const payload = value as Partial<RoomPayload> | null;

  if (!payload?.roomId) {
    throw new Error('Supabase room function returned an invalid payload.');
  }

  return payload as RoomPayload;
}

function mapPlayer(row: RemotePlayerRow): RoomPlayer {
  return {
    avatarId: row.avatar_id,
    id: row.id,
    isLeader: row.is_leader,
    nickname: row.nickname,
    status: row.status,
  };
}

function mapResult(result: RemoteResult | null): GameResult | undefined {
  if (!result) return undefined;

  return {
    capturedPlayerIds: result.capturedPlayerIds ?? [],
    durationLabel: result.durationLabel ?? '3min',
    highlightAvatarId: result.highlightAvatarId,
    highlightPlayerId: result.highlightPlayerId ?? '',
    highlightNickname: result.highlightNickname,
    seekerAvatarId: result.seekerAvatarId,
    seekerNickname: result.seekerNickname,
    seekerPlayerId: result.seekerPlayerId,
    survivorPlayerIds: result.survivorPlayerIds ?? [],
    winner: result.winner ?? 'hiders',
  };
}

function mapGameSession(row?: RemoteGameSessionRow | null): GameSession | undefined {
  if (!row) return undefined;

  const startedAt = new Date(row.started_at).getTime();
  const seekStartedAt = row.seek_started_at ? new Date(row.seek_started_at).getTime() : undefined;

  return {
    hideDurationSeconds: row.hide_duration_seconds,
    hideEndsAt: startedAt + row.hide_duration_seconds * 1000,
    id: row.id,
    seekDurationSeconds: row.seek_duration_seconds,
    seekEndsAt: seekStartedAt ? seekStartedAt + row.seek_duration_seconds * 1000 : undefined,
    seekerPlayerId: row.seeker_player_id,
    seekStartedAt,
    startedAt,
    status: row.status,
  };
}

function mapLobbyNotice(notice?: RemoteLobbyNotice | null): LobbyNotice | undefined {
  if (!notice || notice.type !== 'players_not_ready') return undefined;

  return {
    createdAt: notice.createdAt ? new Date(notice.createdAt).getTime() : undefined,
    names: notice.names ?? [],
    type: 'players_not_ready',
  };
}

async function fetchSnapshot(roomId: string, activePlayerId?: string, activePlayerToken?: string): Promise<RemoteRoomSnapshot> {
  const client = assertSupabase();

  const roomQuery = client.from('pe_rooms').select('id, code, phase, max_players, expires_at, result, closed_reason, lobby_notice').eq('id', roomId).single();
  const playersQuery = client.from('pe_players').select('id, nickname, avatar_id, status, is_leader').eq('room_id', roomId).order('joined_at');
  const gameSessionsQuery = client
    .from('pe_game_sessions')
    .select('id, seeker_player_id, status, hide_duration_seconds, seek_duration_seconds, started_at, seek_started_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1);
  const exitNoticeQuery = activePlayerId
    ? client.from('pe_player_exit_notices').select('reason').eq('player_id', activePlayerId).order('created_at', { ascending: false }).limit(1)
    : Promise.resolve({ data: [], error: null });

  const [
    { data: room, error: roomError },
    { data: players, error: playersError },
    { data: gameSessions, error: gameSessionError },
    { data: exitNotices, error: exitNoticeError },
  ] = await Promise.all([
    roomQuery,
    playersQuery,
    gameSessionsQuery,
    exitNoticeQuery,
  ]);

  if (roomError) throw roomError;
  if (playersError) throw playersError;
  if (gameSessionError) throw gameSessionError;
  if (exitNoticeError) throw exitNoticeError;

  const mappedPlayers = ((players ?? []) as RemotePlayerRow[]).map(mapPlayer);
  const gameSession = mapGameSession(((gameSessions ?? []) as RemoteGameSessionRow[])[0]);
  const exitNotice = ((exitNotices ?? []) as RemotePlayerExitNoticeRow[])[0];

  return {
    activePlayer: mappedPlayers.find((player) => player.id === activePlayerId),
    activePlayerExitReason: exitNotice?.reason,
    activePlayerToken,
    room: {
      closedReason: (room as RemoteRoomRow).closed_reason ?? undefined,
      code: (room as RemoteRoomRow).code,
      expiresAt: (room as RemoteRoomRow).expires_at ? new Date((room as RemoteRoomRow).expires_at as string).getTime() : undefined,
      gameSession,
      id: (room as RemoteRoomRow).id,
      lobbyNotice: mapLobbyNotice((room as RemoteRoomRow).lobby_notice),
      maxPlayers: (room as RemoteRoomRow).max_players,
      phase: (room as RemoteRoomRow).phase,
      players: mappedPlayers,
      result: mapResult((room as RemoteRoomRow).result),
    },
  };
}

export const roomService = {
  async addDemoPlayer(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_add_demo_player', {
      actor_player_id: activePlayerId,
      max_players: gameRules.maxPlayers,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async createRoom(input: PlayerInput) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_create_room', {
      avatar_id: input.avatarId,
      max_players: gameRules.maxPlayers,
      nickname: input.nickname,
    });

    if (error) throw error;

    const payload = assertRoomPayload(data);
    return fetchSnapshot(payload.roomId, payload.activePlayerId, payload.playerSessionToken);
  },
  async finishRound(roomId: string, activePlayerId: string, activePlayerToken: string, winner: GameResult['winner']) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_finish_round', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      round_winner: winner,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  fetchSnapshot,
  async joinRoom(input: PlayerInput & { code: string }) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_join_room', {
      avatar_id: input.avatarId,
      nickname: input.nickname,
      room_code: input.code,
    });

    if (error) throw error;

    const payload = assertRoomPayload(data);
    return fetchSnapshot(payload.roomId, payload.activePlayerId, payload.playerSessionToken);
  },
  async leaveRoom(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_leave_room', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async markHidden(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_mark_hidden', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async promoteLeader(roomId: string, activePlayerId: string, activePlayerToken: string, nextLeaderPlayerId: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_promote_leader', {
      actor_player_id: activePlayerId,
      next_leader_player_id: nextLeaderPlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async releaseSeeker(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_release_seeker', {
      actor_player_id: activePlayerId,
      allow_hider_release: false,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async rematch(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_rematch', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async removePlayer(roomId: string, activePlayerId: string, activePlayerToken: string, removedPlayerId: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_remove_player', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      removed_player_id: removedPlayerId,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async startRound(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_start_round', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return (data as StartRoundPayload | null)?.started ?? true;
  },
  subscribeToRoom(roomId: string, onChange: () => void): RoomSubscription {
    const client = assertSupabase();
    const channels: RealtimeChannel[] = [
      client
        .channel(`pe-room-${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pe_rooms', filter: `id=eq.${roomId}` }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pe_players', filter: `room_id=eq.${roomId}` }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pe_game_sessions', filter: `room_id=eq.${roomId}` }, onChange)
        .subscribe(),
    ];

    return {
      async unsubscribe() {
        await Promise.all(channels.map((channel) => client.removeChannel(channel)));
      },
    };
  },
  async simulateCapture(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_simulate_capture', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return (data as CapturePayload | null)?.capturedPlayerId;
  },
  async toggleReady(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_toggle_ready', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async tickGameSession(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_tick_game_session', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
};
