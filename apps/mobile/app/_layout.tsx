import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { RoomRouteGuard } from '@/src/components/room-route-guard';
import { RoomProvider } from '@/src/state/room-store';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <RoomProvider>
        <RoomRouteGuard />
        <Stack
          screenOptions={{
            headerShown: false,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            animation: 'none',
            contentStyle: { backgroundColor: '#F7FBFF' },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="create-room" />
          <Stack.Screen name="join-room" options={{ title: 'Entrar na sala' }} />
          <Stack.Screen name="location-permission" options={{ title: 'Localização' }} />
          <Stack.Screen name="lobby" options={{ title: 'Lobby' }} />
          <Stack.Screen name="rules" options={{ title: 'Regras' }} />
          <Stack.Screen name="hide-phase" options={{ title: 'Hora de esconder' }} />
          <Stack.Screen name="seeker-radar" options={{ title: 'Radar' }} />
          <Stack.Screen name="hider-status" options={{ title: 'Escondido' }} />
          <Stack.Screen name="capture" options={{ title: 'Captura' }} />
          <Stack.Screen name="result" options={{ title: 'Resultado' }} />
          <Stack.Screen name="social-card" options={{ title: 'Card social' }} />
        </Stack>
        <StatusBar style="dark" />
      </RoomProvider>
    </ThemeProvider>
  );
}
