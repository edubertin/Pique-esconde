import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useRoom } from '@/src/state/room-store';

const alwaysPublicPaths = new Set(['/data-deletion', '/privacy', '/support', '/terms']);
const publicPaths = new Set(['/', '/create-room', '/join-room', ...alwaysPublicPaths]);
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
  if (alwaysPublicPaths.has(pathname)) return undefined;

  if (finalResultSnapshot) {
    return pathname === '/result' || pathname === '/social-card' ? undefined : '/result';
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
  const { activePlayer, finalResultSnapshot, isRestoringSession, room } = useRoom();
  const lastReplaceTargetRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isRestoringSession) return;

    const currentPathname =
      typeof window !== 'undefined' && typeof window.location?.pathname === 'string'
        ? window.location.pathname
        : pathname;
    if (currentPathname !== pathname) return;
    if (lastReplaceTargetRef.current === pathname) {
      lastReplaceTargetRef.current = undefined;
    }

    const targetPath = getTargetPath({ activePlayer, finalResultSnapshot, pathname, room });
    if (targetPath && targetPath !== pathname) {
      if (lastReplaceTargetRef.current === targetPath) return;
      lastReplaceTargetRef.current = targetPath;
      router.replace(targetPath);
    }
  }, [activePlayer, finalResultSnapshot, isRestoringSession, pathname, room, router]);

  return null;
}
