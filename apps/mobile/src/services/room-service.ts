import type { RealtimeChannel } from '@supabase/supabase-js';

import { gameRules } from '@/src/constants/game';
import { assertSupabase } from '@/src/services/supabase-client';
import type { CaptureAttempt, DevGpsDirection, EnvironmentPreset, FinalResultSnapshot, GameResult, GameSession, HiderDangerHint, LobbyNotice, PlayerLocationInput, PlayerStatus, RadarHint, RoomDebugSnapshot, RoomPlayer, RoomRules } from '@/src/state/room-store';

export type RemoteRoomPhase = 'lobby' | 'hiding' | 'seeking' | 'finished';

export type RemoteRoomSnapshot = {
  activePlayer?: RoomPlayer;
  activePlayerExitReason?: 'left_hide_area' | 'not_hidden_in_time' | 'signal_lost';
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
    rules: RoomRules;
  };
};

type PlayerInput = {
  avatarId: string;
  nickname: string;
};

type RemoteRoomRow = {
  capture_confirm_seconds: number | null;
  capture_radius_meters: number | null;
  closed_reason: 'not_enough_players' | 'seeker_left' | null;
  code: string;
  environment_preset: EnvironmentPreset | null;
  expires_at: string | null;
  hide_duration_seconds: number | null;
  id: string;
  lobby_notice: RemoteLobbyNotice | null;
  max_players: number;
  phase: RemoteRoomPhase;
  result: RemoteResult | null;
  seek_duration_seconds: number | null;
};

type RemoteGameSessionRow = {
  capture_confirm_seconds?: number | null;
  capture_radius_meters?: number | null;
  environment_preset?: EnvironmentPreset | null;
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
  finishedAt?: string;
  gameSessionId?: string;
  highlightAvatarId?: string;
  highlightPlayerId: string;
  highlightNickname?: string;
  playerCount?: number;
  seekerAvatarId?: string;
  seekerNickname?: string;
  seekerPlayerId?: string;
  survivorPlayerIds: string[];
  winner: GameResult['winner'];
};

type RemoteFinalResultSnapshot = {
  expiresAt?: string;
  finishedAt?: string;
  gameSessionId?: string;
  players?: {
    avatarId: string;
    id: string;
    isLeader: boolean;
    nickname: string;
    status: PlayerStatus;
  }[];
  result?: RemoteResult;
  roomCode?: string;
  roomId?: string;
};

type RoomPayload = {
  activePlayerId?: string;
  playerSessionToken?: string;
  roomId: string;
};

type CapturePayload = CaptureAttempt;

type TickPayload = {
  finalSnapshot?: RemoteFinalResultSnapshot;
};

type StartRoundPayload = {
  started?: boolean;
};

type UpdateRoomRulesInput = Pick<RoomRules, 'environmentPreset' | 'hideDurationSeconds' | 'seekDurationSeconds'>;

type RemoteAtomicRoomSnapshot = {
  activePlayer?: RemotePlayerRow | null;
  activePlayerExitReason?: 'left_hide_area' | 'not_hidden_in_time' | 'signal_lost' | null;
  activePlayerToken?: string | null;
  gameSession?: RemoteGameSessionRow | null;
  players?: RemotePlayerRow[] | null;
  room?: RemoteRoomRow | null;
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
    finishedAt: result.finishedAt ? new Date(result.finishedAt).getTime() : undefined,
    gameSessionId: result.gameSessionId,
    highlightAvatarId: result.highlightAvatarId,
    highlightPlayerId: result.highlightPlayerId ?? '',
    highlightNickname: result.highlightNickname,
    playerCount: result.playerCount,
    seekerAvatarId: result.seekerAvatarId,
    seekerNickname: result.seekerNickname,
    seekerPlayerId: result.seekerPlayerId,
    survivorPlayerIds: result.survivorPlayerIds ?? [],
    winner: result.winner ?? 'hiders',
  };
}

function mapFinalResultSnapshot(snapshot?: RemoteFinalResultSnapshot | null): FinalResultSnapshot | undefined {
  const result = mapResult(snapshot?.result ?? null);
  if (!snapshot?.roomId || !snapshot.roomCode || !result) return undefined;

  return {
    capturedAtClient: Date.now(),
    expiresAt: snapshot.expiresAt ? new Date(snapshot.expiresAt).getTime() : undefined,
    finishedAt: snapshot.finishedAt ? new Date(snapshot.finishedAt).getTime() : result.finishedAt,
    gameSessionId: snapshot.gameSessionId ?? result.gameSessionId,
    players: snapshot.players ?? [],
    result,
    roomCode: snapshot.roomCode,
    roomId: snapshot.roomId,
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

function mapRoomRules(row: RemoteRoomRow): RoomRules {
  return {
    captureConfirmSeconds: row.capture_confirm_seconds ?? 2,
    captureRadiusMeters: row.capture_radius_meters ?? 5,
    environmentPreset: row.environment_preset ?? 'medium',
    hideDurationSeconds: row.hide_duration_seconds ?? 60,
    seekDurationSeconds: row.seek_duration_seconds ?? 180,
  };
}

async function fetchSnapshot(roomId: string, activePlayerId?: string, activePlayerToken?: string): Promise<RemoteRoomSnapshot> {
  const client = assertSupabase();

  const { data, error } = await client.rpc('pe_get_room_snapshot', {
    actor_player_id: activePlayerId ?? null,
    player_session_token: activePlayerToken ?? null,
    target_room_id: roomId,
  });

  if (error) throw error;

  const payload = data as RemoteAtomicRoomSnapshot | null;
  if (!payload?.room) throw new Error('Supabase room function returned an invalid snapshot.');

  const mappedPlayers = (payload.players ?? []).map(mapPlayer);
  const roomRow = payload.room;
  const gameSession = mapGameSession(payload.gameSession);

  return {
    activePlayer: payload.activePlayer ? mapPlayer(payload.activePlayer) : mappedPlayers.find((player) => player.id === activePlayerId),
    activePlayerExitReason: payload.activePlayerExitReason ?? undefined,
    activePlayerToken: payload.activePlayerToken ?? activePlayerToken,
    room: {
      closedReason: roomRow.closed_reason ?? undefined,
      code: roomRow.code,
      expiresAt: roomRow.expires_at ? new Date(roomRow.expires_at).getTime() : undefined,
      gameSession,
      id: roomRow.id,
      lobbyNotice: mapLobbyNotice(roomRow.lobby_notice),
      maxPlayers: roomRow.max_players,
      phase: roomRow.phase,
      players: mappedPlayers,
      result: mapResult(roomRow.result),
      rules: mapRoomRules(roomRow),
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
  async addDevTargetPlayer(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_dev_add_target_player', {
      actor_player_id: activePlayerId,
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
  async clearDevTestDistance(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_dev_clear_test_distance', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async finishRound(roomId: string, activePlayerId: string, activePlayerToken: string, winner: GameResult['winner']) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_finish_round', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      round_winner: winner,
      target_room_id: roomId,
    });

    if (error) throw error;

    return mapFinalResultSnapshot(data as RemoteFinalResultSnapshot | null);
  },
  async getRadarHint(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_get_radar_hint', {
      actor_player_id: activePlayerId,
      area_preset: 'medium',
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return data as RadarHint | undefined;
  },
  async getHiderDangerHint(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_get_hider_danger_hint', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return data as HiderDangerHint | undefined;
  },
  async getRoomDebugSnapshot(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_get_room_debug_snapshot', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return data as RoomDebugSnapshot | undefined;
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
    const { data, error } = await client.rpc('pe_tick_game_session', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    return mapFinalResultSnapshot((data as TickPayload | null)?.finalSnapshot);
  },
  async tryCaptureNearest(roomId: string, activePlayerId: string, activePlayerToken: string) {
    const client = assertSupabase();
    const { data, error } = await client.rpc('pe_try_capture_nearest', {
      actor_player_id: activePlayerId,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;

    const payload = data as (Omit<CapturePayload, 'finalSnapshot'> & { finalSnapshot?: RemoteFinalResultSnapshot }) | null;
    if (!payload) return null;

    return {
      ...payload,
      finalSnapshot: mapFinalResultSnapshot(payload.finalSnapshot),
    };
  },
  async updateRoomRules(roomId: string, activePlayerId: string, activePlayerToken: string, rules: UpdateRoomRulesInput) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_update_room_rules', {
      actor_player_id: activePlayerId,
      environment_preset: rules.environmentPreset,
      hide_duration_seconds: rules.hideDurationSeconds,
      player_session_token: activePlayerToken,
      seek_duration_seconds: rules.seekDurationSeconds,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async updateDevTestDistance(
    roomId: string,
    activePlayerId: string,
    activePlayerToken: string,
    distanceMeters: number,
    bearingDegrees = 0,
    cardinal: DevGpsDirection = 'N',
  ) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_dev_set_test_distance', {
      actor_player_id: activePlayerId,
      bearing_degrees: bearingDegrees,
      cardinal,
      distance_meters: distanceMeters,
      player_session_token: activePlayerToken,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
  async updatePlayerLocation(roomId: string, activePlayerId: string, activePlayerToken: string, input: PlayerLocationInput) {
    const client = assertSupabase();
    const { error } = await client.rpc('pe_update_player_location', {
      accuracy_m: input.accuracyMeters ?? null,
      actor_player_id: activePlayerId,
      heading_degrees: input.headingDegrees ?? null,
      lat: input.lat,
      lng: input.lng,
      player_session_token: activePlayerToken,
      speed_mps: input.speedMetersPerSecond ?? null,
      target_room_id: roomId,
    });

    if (error) throw error;
  },
};
