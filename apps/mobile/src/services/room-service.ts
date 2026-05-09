import type { RealtimeChannel } from '@supabase/supabase-js';

import { gameRules } from '@/src/constants/game';
import { assertSupabase } from '@/src/services/supabase-client';
import type { GameResult, GameSession, PlayerStatus, RoomPlayer } from '@/src/state/room-store';

export type RemoteRoomPhase = 'lobby' | 'hiding' | 'seeking' | 'finished';

export type RemoteRoomSnapshot = {
  activePlayer?: RoomPlayer;
  activePlayerToken?: string;
  room: {
    code: string;
    expiresAt?: number;
    gameSession?: GameSession;
    id: string;
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
  code: string;
  expires_at: string | null;
  id: string;
  max_players: number;
  phase: RemoteRoomPhase;
  result: RemoteResult | null;
};

type RemoteGameSessionRow = {
  hide_duration_seconds: number;
  id: string;
  seek_duration_seconds: number;
  seeker_player_id: string;
  status: GameSession['status'];
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
  highlightPlayerId: string;
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
    highlightPlayerId: result.highlightPlayerId ?? '',
    survivorPlayerIds: result.survivorPlayerIds ?? [],
    winner: result.winner ?? 'hiders',
  };
}

function mapGameSession(row?: RemoteGameSessionRow | null): GameSession | undefined {
  if (!row) return undefined;

  return {
    hideDurationSeconds: row.hide_duration_seconds,
    id: row.id,
    seekDurationSeconds: row.seek_duration_seconds,
    seekerPlayerId: row.seeker_player_id,
    status: row.status,
  };
}

async function fetchSnapshot(roomId: string, activePlayerId?: string, activePlayerToken?: string): Promise<RemoteRoomSnapshot> {
  const client = assertSupabase();

  const [
    { data: room, error: roomError },
    { data: players, error: playersError },
    { data: gameSessions, error: gameSessionError },
  ] = await Promise.all([
    client.from('pe_rooms').select('id, code, phase, max_players, expires_at, result').eq('id', roomId).single(),
    client.from('pe_players').select('id, nickname, avatar_id, status, is_leader').eq('room_id', roomId).order('joined_at'),
    client
      .from('pe_game_sessions')
      .select('id, seeker_player_id, status, hide_duration_seconds, seek_duration_seconds')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  if (roomError) throw roomError;
  if (playersError) throw playersError;
  if (gameSessionError) throw gameSessionError;

  const mappedPlayers = ((players ?? []) as RemotePlayerRow[]).map(mapPlayer);
  const gameSession = mapGameSession(((gameSessions ?? []) as RemoteGameSessionRow[])[0]);

  return {
    activePlayer: mappedPlayers.find((player) => player.id === activePlayerId),
    activePlayerToken,
    room: {
      code: (room as RemoteRoomRow).code,
      expiresAt: (room as RemoteRoomRow).expires_at ? new Date((room as RemoteRoomRow).expires_at as string).getTime() : undefined,
      gameSession,
      id: (room as RemoteRoomRow).id,
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
    const { error } = await client.rpc('pe_start_round', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
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
};
