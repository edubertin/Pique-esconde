import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { roomService } from '@/src/services/room-service';

export type PlayerStatus = 'Entrou' | 'Preparado' | 'Aguardando' | 'Escondendo' | 'Escondido' | 'Procurando' | 'Capturado';

export type RoomPlayer = {
  avatarId: string;
  id: string;
  isLeader: boolean;
  nickname: string;
  status: PlayerStatus;
};

export type GameResult = {
  capturedPlayerIds: string[];
  durationLabel: string;
  highlightAvatarId?: string;
  highlightPlayerId: string;
  highlightNickname?: string;
  playerCount?: number;
  seekerAvatarId?: string;
  seekerNickname?: string;
  seekerPlayerId?: string;
  survivorPlayerIds: string[];
  winner: 'seeker' | 'hiders';
};

export type GameSession = {
  hideDurationSeconds: number;
  hideEndsAt: number;
  id: string;
  seekDurationSeconds: number;
  seekEndsAt?: number;
  seekerPlayerId: string;
  seekStartedAt?: number;
  startedAt: number;
  status: 'hiding' | 'seeking' | 'finished';
};

export type PlayerLocationInput = {
  accuracyMeters?: number;
  headingDegrees?: number;
  lat: number;
  lng: number;
  speedMetersPerSecond?: number;
};

export type RadarHint = {
  angleDegrees?: number;
  band: 'cold' | 'hot' | 'none' | 'warm';
  canCapture?: boolean;
  confidence: number;
  confirmRemainingSeconds?: number;
  distanceMetersApprox?: number;
  reason?: 'no_active_search' | 'no_target_signal' | 'seeker_signal_lost';
  signalStatus: 'fresh' | 'lost' | 'warning';
  targetNickname?: string;
  targetPlayerId?: string;
  updatedAt?: string;
};

export type HiderDangerHint = {
  distanceMetersApprox?: number;
  level: 'calm' | 'danger' | 'near';
  signalStatus: 'fresh' | 'lost' | 'warning';
  updatedAt?: string;
};

export type RoomDebugPlayer = {
  accuracyMeters?: number;
  hasHideSpot: boolean;
  hideAgeSeconds?: number;
  hideDriftMeters?: number;
  hideViolationAgeSeconds?: number;
  id: string;
  isLeader: boolean;
  isSeeker: boolean;
  nickname: string;
  signalAgeSeconds?: number;
  signalStatus: 'fresh' | 'lost' | 'warning';
  status: PlayerStatus;
};

export type RoomDebugSnapshot = {
  activePlayerId: string;
  closedReason?: string;
  devDistance?: {
    active: boolean;
    ageSeconds: number;
    distanceMeters: number;
    hiderPlayerId: string;
    seekerPlayerId: string;
  };
  gameSession?: {
    hideDurationSeconds: number;
    id: string;
    seekAgeSeconds?: number;
    seekDurationSeconds: number;
    seekerPlayerId: string;
    startedAgeSeconds: number;
    status: GameSession['status'];
  };
  players: RoomDebugPlayer[];
  roomCode: string;
  roomId: string;
  roomPhase: 'lobby' | 'hiding' | 'seeking' | 'finished';
  serverTime: string;
};

export type CaptureAttempt = {
  captured?: boolean;
  capturedPlayerId?: string;
  confirmRemainingSeconds?: number;
  distanceMeters?: number;
  reason?: 'confirming' | 'no_target_in_range' | 'no_target_signal' | 'seeker_signal_unstable';
  remainingHiders?: number;
  targetPlayerId?: string;
};

export type LobbyNotice = {
  createdAt?: number;
  names: string[];
  type: 'players_not_ready';
};

type Room = {
  closedReason?: 'not_enough_players' | 'seeker_left';
  code: string;
  expiresAt?: number;
  gameSession?: GameSession;
  id: string;
  lobbyNotice?: LobbyNotice;
  maxPlayers: number;
  phase: 'lobby' | 'hiding' | 'seeking' | 'finished';
  players: RoomPlayer[];
  result?: GameResult;
};

type RoomStore = {
  activePlayer?: RoomPlayer;
  addDemoPlayer: () => Promise<void>;
  clearDevTestDistance: () => Promise<void>;
  clearError: () => void;
  clearNotice: () => void;
  createRoom: (input: PlayerInput) => Promise<void>;
  error?: string;
  finishRound: (winner?: GameResult['winner']) => Promise<void>;
  getHiderDangerHint: () => Promise<HiderDangerHint | undefined>;
  getRadarHint: () => Promise<RadarHint | undefined>;
  getRoomDebugSnapshot: () => Promise<RoomDebugSnapshot | undefined>;
  isLoading: boolean;
  joinRoom: (input: PlayerInput & { code: string }) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  markHidden: () => Promise<void>;
  promoteLeader: (playerId: string) => Promise<void>;
  releaseSeeker: () => Promise<void>;
  rematch: () => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  room?: Room;
  roomNotice?: 'left_hide_area' | 'left_match' | 'not_hidden_in_time' | 'removed' | 'signal_lost';
  simulateCapture: () => Promise<string | undefined>;
  startRound: () => Promise<boolean>;
  tickGameSession: () => Promise<void>;
  toggleReady: () => Promise<void>;
  tryCaptureNearest: () => Promise<CaptureAttempt | undefined>;
  updateDevTestDistance: (distanceMeters: number) => Promise<void>;
  updatePlayerLocation: (input: PlayerLocationInput) => Promise<void>;
};

type PlayerInput = {
  avatarId: string;
  nickname: string;
};

const RoomContext = createContext<RoomStore | undefined>(undefined);
const connectionUnstableMessage = 'Conexao instavel. Tente novamente em alguns segundos.';

function getErrorMessage(error: unknown) {
  const cleanMessage = (message: string) => message.split('\n')[0]?.trim() || 'Nao foi possivel sincronizar a sala agora.';
  const isFetchFailure = (message: string) => message.toLowerCase().includes('failed to fetch');

  if (error instanceof Error) {
    if (isFetchFailure(error.message)) return connectionUnstableMessage;
    return cleanMessage(error.message);
  }

  if (typeof error === 'object' && error) {
    const supabaseError = error as { code?: unknown; details?: unknown; hint?: unknown; message?: unknown };
    const parts = [supabaseError.message, supabaseError.details, supabaseError.hint]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (parts.length > 0) {
      const message = parts.join(' ');
      if (isFetchFailure(message)) return connectionUnstableMessage;
      return cleanMessage(message);
    }
    if (typeof supabaseError.code === 'string') return `Erro Supabase: ${supabaseError.code}`;
  }

  return 'Nao foi possivel sincronizar a sala agora.';
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const [activePlayerId, setActivePlayerId] = useState<string>();
  const [activePlayerToken, setActivePlayerToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [room, setRoom] = useState<Room>();
  const [roomNotice, setRoomNotice] = useState<RoomStore['roomNotice']>();

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof roomService.fetchSnapshot>>) => {
      if (activePlayerId && !snapshot.activePlayer) {
        setActivePlayerId(undefined);
        setActivePlayerToken(undefined);
        setError(undefined);
        setRoomNotice(snapshot.activePlayerExitReason ?? 'removed');
        setRoom(undefined);
        return;
      }

      setRoom(snapshot.room);
      setActivePlayerId(snapshot.activePlayer?.id ?? activePlayerId);
      setActivePlayerToken(snapshot.activePlayerToken ?? activePlayerToken);
    },
    [activePlayerId, activePlayerToken],
  );

  const refreshRoom = useCallback(async () => {
    if (!room?.id) return;

    const snapshot = await roomService.fetchSnapshot(room.id, activePlayerId, activePlayerToken);
    applySnapshot(snapshot);
  }, [activePlayerId, activePlayerToken, applySnapshot, room?.id]);

  const refreshRoomSoft = useCallback(async () => {
    try {
      await refreshRoom();
    } catch (refreshError) {
      console.warn('Room refresh failed after action', refreshError);
    }
  }, [refreshRoom]);

  const runAction = useCallback(
    async <T,>(action: () => Promise<T>) => {
      setError(undefined);
      setIsLoading(true);

      try {
        setRoomNotice(undefined);
        return await action();
      } catch (actionError) {
        const message = getErrorMessage(actionError);
        setError(message);
        throw actionError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!room?.id) return undefined;

    const subscription = roomService.subscribeToRoom(room.id, () => {
      refreshRoom().catch((subscriptionError: unknown) => {
        const message = getErrorMessage(subscriptionError);
        if (message !== connectionUnstableMessage) setError(message);
      });
    });

    return () => {
      subscription.unsubscribe().catch(() => undefined);
    };
  }, [refreshRoom, room?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoom((currentRoom) => {
        if (!currentRoom?.expiresAt || Date.now() < currentRoom.expiresAt) {
          return currentRoom;
        }

        setActivePlayerId(undefined);
        setActivePlayerToken(undefined);
        return undefined;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const store = useMemo<RoomStore>(() => {
    const activePlayer = room?.players.find((player) => player.id === activePlayerId);
    const requireSession = () => {
      if (!room?.id || !activePlayerId || !activePlayerToken) {
        throw new Error('Entre em uma sala antes de continuar.');
      }

      return { activePlayerId, activePlayerToken, roomId: room.id };
    };

    return {
      activePlayer,
      clearError() {
        setError(undefined);
      },
      clearNotice() {
        setRoomNotice(undefined);
      },
      error,
      isLoading,
      room,
      roomNotice,
      async addDemoPlayer() {
        const session = requireSession();
        await runAction(async () => {
          await roomService.addDemoPlayer(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });
      },
      async createRoom(input) {
        await runAction(async () => {
          const snapshot = await roomService.createRoom(input);
          applySnapshot(snapshot);
        });
      },
      async finishRound(winner = 'hiders') {
        const session = requireSession();
        await runAction(async () => {
          await roomService.finishRound(session.roomId, session.activePlayerId, session.activePlayerToken, winner);
          await refreshRoomSoft();
        });
      },
      async getRadarHint() {
        const session = requireSession();
        return roomService.getRadarHint(session.roomId, session.activePlayerId, session.activePlayerToken);
      },
      async getRoomDebugSnapshot() {
        if (!__DEV__) return undefined;

        const session = requireSession();
        return roomService.getRoomDebugSnapshot(session.roomId, session.activePlayerId, session.activePlayerToken);
      },
      async getHiderDangerHint() {
        const session = requireSession();
        return roomService.getHiderDangerHint(session.roomId, session.activePlayerId, session.activePlayerToken);
      },
      async clearDevTestDistance() {
        const session = requireSession();
        await roomService.clearDevTestDistance(session.roomId, session.activePlayerId, session.activePlayerToken);
      },
      async joinRoom(input) {
        await runAction(async () => {
          const snapshot = await roomService.joinRoom(input);
          applySnapshot(snapshot);
        });

        return true;
      },
      async leaveRoom() {
        if (!room?.id || !activePlayerId || !activePlayerToken) {
          setActivePlayerId(undefined);
          setActivePlayerToken(undefined);
          setRoom(undefined);
          return;
        }

        await runAction(async () => {
          const notice =
            room.phase === 'hiding' || room.phase === 'seeking'
              ? 'left_match'
              : undefined;

          await roomService.leaveRoom(room.id, activePlayerId, activePlayerToken);
          setActivePlayerId(undefined);
          setActivePlayerToken(undefined);
          setRoomNotice(notice);
          setRoom(undefined);
        });
      },
      async markHidden() {
        const session = requireSession();
        await runAction(async () => {
          await roomService.markHidden(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });
      },
      async promoteLeader(playerId) {
        if (playerId === activePlayerId) return;

        const session = requireSession();
        await runAction(async () => {
          await roomService.promoteLeader(session.roomId, session.activePlayerId, session.activePlayerToken, playerId);
          await refreshRoom();
        });
      },
      async removePlayer(playerId) {
        if (playerId === activePlayerId) return;

        const session = requireSession();
        await runAction(async () => {
          await roomService.removePlayer(session.roomId, session.activePlayerId, session.activePlayerToken, playerId);
          await refreshRoom();
        });
      },
      async releaseSeeker() {
        const session = requireSession();
        await runAction(async () => {
          await roomService.releaseSeeker(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });
      },
      async rematch() {
        const session = requireSession();
        await runAction(async () => {
          await roomService.rematch(session.roomId, session.activePlayerId, session.activePlayerToken);
          setRoom((currentRoom) => currentRoom
            ? {
                ...currentRoom,
                closedReason: undefined,
                phase: 'lobby',
                result: undefined,
                players: currentRoom.players.map((player) => ({
                  ...player,
                  status: player.isLeader ? 'Entrou' : 'Aguardando',
                })),
              }
            : currentRoom);
          await refreshRoom();
        });
      },
      async startRound() {
        const session = requireSession();

        if ((room?.players.length ?? 0) < 2) {
          setError('Convide pelo menos mais 1 jogador para iniciar.');
          return false;
        }

        let started = false;
        await runAction(async () => {
          started = await roomService.startRound(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });

        return started;
      },
      async simulateCapture() {
        const session = requireSession();
        let capturedPlayerId: string | undefined;

        await runAction(async () => {
          capturedPlayerId = await roomService.simulateCapture(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });

        return capturedPlayerId;
      },
      async tickGameSession() {
        const session = requireSession();
        await roomService.tickGameSession(session.roomId, session.activePlayerId, session.activePlayerToken);
        await refreshRoom();
      },
      async toggleReady() {
        const session = requireSession();
        await runAction(async () => {
          await roomService.toggleReady(session.roomId, session.activePlayerId, session.activePlayerToken);
          await refreshRoom();
        });
      },
      async tryCaptureNearest() {
        const session = requireSession();
        let payload: CaptureAttempt | undefined;

        await runAction(async () => {
          payload = await roomService.tryCaptureNearest(session.roomId, session.activePlayerId, session.activePlayerToken) ?? undefined;
          await refreshRoomSoft();
        });

        return payload;
      },
      async updateDevTestDistance(distanceMeters) {
        const session = requireSession();
        await roomService.updateDevTestDistance(session.roomId, session.activePlayerId, session.activePlayerToken, distanceMeters);
      },
      async updatePlayerLocation(input) {
        const session = requireSession();
        await roomService.updatePlayerLocation(session.roomId, session.activePlayerId, session.activePlayerToken, input);
      },
    };
  }, [activePlayerId, activePlayerToken, applySnapshot, error, isLoading, refreshRoom, refreshRoomSoft, room, roomNotice, runAction]);

  return <RoomContext.Provider value={store}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const store = useContext(RoomContext);

  if (!store) {
    throw new Error('useRoom must be used within RoomProvider');
  }

  return store;
}
