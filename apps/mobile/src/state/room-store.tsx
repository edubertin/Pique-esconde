import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { gameRules } from '@/src/constants/game';

export type PlayerStatus = 'Entrou' | 'Preparado' | 'Aguardando';

export type RoomPlayer = {
  avatarId: string;
  id: string;
  isLeader: boolean;
  nickname: string;
  status: PlayerStatus;
};

type Room = {
  code: string;
  expiresAt?: number;
  maxPlayers: number;
  phase: 'lobby' | 'hiding' | 'seeking' | 'finished';
  players: RoomPlayer[];
};

type RoomStore = {
  activePlayer?: RoomPlayer;
  addDemoPlayer: () => void;
  createRoom: (input: PlayerInput) => void;
  joinRoom: (input: PlayerInput & { code: string }) => boolean;
  leaveRoom: () => void;
  promoteLeader: (playerId: string) => void;
  rematch: () => void;
  room?: Room;
  startRound: () => void;
  toggleReady: () => void;
};

type PlayerInput = {
  avatarId: string;
  nickname: string;
};

const RoomContext = createContext<RoomStore | undefined>(undefined);

const demoPlayers: RoomPlayer[] = [
  { id: 'demo_ana', nickname: 'Ana', avatarId: 'avatar_02', status: 'Preparado', isLeader: false },
  { id: 'demo_rafa', nickname: 'Rafa', avatarId: 'avatar_03', status: 'Aguardando', isLeader: false },
  { id: 'demo_bia', nickname: 'Bia', avatarId: 'avatar_04', status: 'Preparado', isLeader: false },
  { id: 'demo_lu', nickname: 'Lu', avatarId: 'avatar_01', status: 'Aguardando', isLeader: false },
  { id: 'demo_thi', nickname: 'Thi', avatarId: 'avatar_03', status: 'Preparado', isLeader: false },
  { id: 'demo_nina', nickname: 'Nina', avatarId: 'avatar_02', status: 'Aguardando', isLeader: false },
  { id: 'demo_caio', nickname: 'Caio', avatarId: 'avatar_04', status: 'Preparado', isLeader: false },
];

function createRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

function createPlayer(input: PlayerInput, isLeader = false): RoomPlayer {
  return {
    avatarId: input.avatarId,
    id: `player_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    isLeader,
    nickname: input.nickname.trim() || 'Jogador',
    status: 'Entrou',
  };
}

function getSoloExpiresAt(players: RoomPlayer[]) {
  return players.length === 1 ? Date.now() + 6 * 60 * 1000 : undefined;
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room>();
  const [activePlayerId, setActivePlayerId] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      setRoom((currentRoom) => {
        if (!currentRoom?.expiresAt || Date.now() < currentRoom.expiresAt) {
          return currentRoom;
        }

        setActivePlayerId(undefined);
        return undefined;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const store = useMemo<RoomStore>(() => {
    const activePlayer = room?.players.find((player) => player.id === activePlayerId);

    return {
      activePlayer,
      room,
      addDemoPlayer() {
        setRoom((currentRoom) => {
          if (!currentRoom || currentRoom.players.length >= currentRoom.maxPlayers) {
            return currentRoom;
          }

          const template = demoPlayers.find(
            (demoPlayer) => !currentRoom.players.some((player) => player.nickname === demoPlayer.nickname),
          );

          if (!template) {
            return currentRoom;
          }

          const players = [
            ...currentRoom.players,
            {
              ...template,
              id: `${template.id}_${Date.now()}`,
              isLeader: false,
            },
          ];

          return {
            ...currentRoom,
            expiresAt: getSoloExpiresAt(players),
            players,
          };
        });
      },
      createRoom(input) {
        const leader = createPlayer(input, true);
        setActivePlayerId(leader.id);
        const players = [leader];
        setRoom({
          code: createRoomCode(),
          expiresAt: getSoloExpiresAt(players),
          maxPlayers: gameRules.maxPlayers,
          phase: 'lobby',
          players,
        });
      },
      joinRoom(input) {
        const joinedPlayer = createPlayer(input);

        setRoom((currentRoom) => {
          const targetRoom =
            currentRoom?.code.toUpperCase() === input.code.trim().toUpperCase()
              ? currentRoom
              : {
                  code: input.code.trim().toUpperCase() || gameRules.roomCode,
                  maxPlayers: gameRules.maxPlayers,
                  phase: 'lobby' as const,
                  players: [{ ...demoPlayers[0], isLeader: true }, demoPlayers[1], demoPlayers[2]],
                };

          if (targetRoom.players.length >= targetRoom.maxPlayers) {
            return targetRoom;
          }

          setActivePlayerId(joinedPlayer.id);
          const players = [...targetRoom.players, joinedPlayer];

          return {
            ...targetRoom,
            expiresAt: getSoloExpiresAt(players),
            players,
          };
        });

        return true;
      },
      leaveRoom() {
        setRoom((currentRoom) => {
          if (!currentRoom || !activePlayerId) {
            setActivePlayerId(undefined);
            return undefined;
          }

          const remainingPlayers = currentRoom.players.filter((player) => player.id !== activePlayerId);
          setActivePlayerId(undefined);

          if (remainingPlayers.length === 0) {
            return undefined;
          }

          const hasLeader = remainingPlayers.some((player) => player.isLeader);
          const players = hasLeader
            ? remainingPlayers
            : remainingPlayers.map((player, index) => ({ ...player, isLeader: index === 0 }));

          return {
            ...currentRoom,
            expiresAt: getSoloExpiresAt(players),
            players,
          };
        });
      },
      promoteLeader(playerId) {
        setRoom((currentRoom) => {
          if (!currentRoom) return currentRoom;
          const currentLeader = currentRoom.players.find((player) => player.id === activePlayerId);

          if (!currentLeader?.isLeader) {
            return currentRoom;
          }

          return {
            ...currentRoom,
            players: currentRoom.players.map((player) => ({ ...player, isLeader: player.id === playerId })),
          };
        });
      },
      rematch() {
        setRoom((currentRoom) => {
          if (!currentRoom) return currentRoom;

          return {
            ...currentRoom,
            phase: 'lobby',
            players: currentRoom.players.map((player) => ({ ...player, status: player.isLeader ? 'Entrou' : 'Aguardando' })),
          };
        });
      },
      startRound() {
        setRoom((currentRoom) => {
          if (!currentRoom || currentRoom.players.length < 2) {
            return currentRoom;
          }

          return { ...currentRoom, phase: 'hiding' };
        });
      },
      toggleReady() {
        setRoom((currentRoom) => {
          if (!currentRoom || !activePlayerId) return currentRoom;

          return {
            ...currentRoom,
            players: currentRoom.players.map((player) =>
              player.id === activePlayerId
                ? { ...player, status: player.status === 'Preparado' ? 'Entrou' : 'Preparado' }
                : player,
            ),
          };
        });
      },
    };
  }, [activePlayerId, room]);

  return <RoomContext.Provider value={store}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const store = useContext(RoomContext);

  if (!store) {
    throw new Error('useRoom must be used within RoomProvider');
  }

  return store;
}
