import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

export function buildRoomInviteUrl(roomCode: string) {
  const code = roomCode.trim().toUpperCase();
  const configuredBaseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return `${normalizeBaseUrl(configuredBaseUrl)}/join-room?code=${encodeURIComponent(code)}`;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/join-room?code=${encodeURIComponent(code)}`;
  }

  return Linking.createURL('/join-room', {
    queryParams: { code },
  });
}
