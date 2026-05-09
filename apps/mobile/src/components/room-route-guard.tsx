import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useRoom } from '@/src/state/room-store';

const publicPaths = new Set(['/', '/create-room', '/join-room']);
const lobbyAuxiliaryPaths = new Set(['/create-room', '/join-room', '/location-permission', '/rules']);

function getTargetPath({
  activePlayer,
  finalResultSnapshot,
  pathname,
  room,
}: {
  activePlayer: ReturnType<typeof useRoom>['activePlayer'];
  finalResultSnapshot: ReturnType<typeof useRoom>['finalResultSnapshot'];
  pathname: string;
  room: ReturnType<typeof useRoom>['room'];
}) {
  if (finalResultSnapshot && (pathname === '/result' || pathname === '/social-card')) {
    return undefined;
  }

  if (!room) {
    return publicPaths.has(pathname) ? undefined : '/';
  }

  if (room.phase === 'lobby') {
    return lobbyAuxiliaryPaths.has(pathname) ? undefined : '/lobby';
  }

  if (room.phase === 'hiding') {
    if (room.players.length < 2) return pathname === '/lobby' ? undefined : '/lobby';
    return pathname === '/hide-phase' ? undefined : '/hide-phase';
  }

  if (room.phase === 'seeking') {
    if (pathname === '/capture') return undefined;
    if (activePlayer?.status === 'Capturado') return pathname === '/capture' ? undefined : '/capture';
    const seekerPlayerId = room.gameSession?.seekerPlayerId ?? room.players.find((player) => player.isLeader)?.id;
    const isSeeker = Boolean(activePlayer?.isLeader || activePlayer?.id === seekerPlayerId);
    const targetPath = isSeeker ? '/seeker-radar' : '/hider-status';
    return pathname === targetPath ? undefined : targetPath;
  }

  if (room.phase === 'finished') {
    if (pathname === '/social-card') return undefined;
    return pathname === '/result' ? undefined : '/result';
  }

  return undefined;
}

export function RoomRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { activePlayer, finalResultSnapshot, room } = useRoom();

  useEffect(() => {
    const currentPathname = typeof window === 'undefined' ? pathname : window.location.pathname;
    if (currentPathname !== pathname) return;

    const targetPath = getTargetPath({ activePlayer, finalResultSnapshot, pathname, room });
    if (targetPath && targetPath !== pathname) {
      router.replace(targetPath);
    }
  }, [activePlayer, finalResultSnapshot, pathname, room, router]);

  return null;
}
