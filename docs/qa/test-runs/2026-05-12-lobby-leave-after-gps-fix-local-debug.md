# 2026-05-12 - Lobby leave after GPS fix local debug

## Objetivo

Validar a correcao do erro ao criar sala, liberar GPS, entrar no lobby e tocar em `Sair`.

## Ambiente

- Device: `emulator-5554`
- App: `com.eduardobertin.piqueesconde`
- Build: debug local via `npx expo run:android`
- Metro: `npx expo start --dev-client --port 8081 --clear`
- Sem build EAS/Expo para envio a loja.

## Mudancas validadas

- `apps/mobile/src/state/room-store.tsx`
  - `refreshRoom` agora ignora sala marcada como abandonada antes de chamar snapshot.
  - Refresh antigo e timeout de realtime sao invalidados ao iniciar `leaveRoom`.
  - `Room not found` e `Invalid room session` sao tratados como sucesso local apenas durante saida da sala.
  - Promises antigas de refresh nao limpam uma promise nova.
  - Estado de sync e sessao local sao limpos ao concluir saida.
- `apps/mobile/app/lobby.tsx`
  - Botao `Sair` desabilita durante `isLoading`.
  - Handler possui trava local contra duplo toque.
- `apps/mobile/src/utils/dev-gps.ts`
  - `disableDevGps` agora roda apenas no web/dev, evitando acesso a `window.sessionStorage` no Android.

## Validacoes automaticas

```text
npx tsc --noEmit
OK

npm run lint
OK com 4 warnings pre-existentes:
- app/how-to-play.tsx: LegalBullet nao usado
- app/join-room.tsx: Platform nao usado
- app/result.tsx: highlightName nao usado
- src/components/prototype-screen.tsx: surfaces nao usado
```

## Teste manual no emulador

Passos:

1. Limpar app no emulador com `pm clear`.
2. Abrir app debug.
3. Criar sala.
4. Tocar em `Permitir localizacao`.
5. No dialog Android, tocar em `While using the app`.
6. Confirmar entrada no lobby.
7. Tocar em `Sair` duas vezes rapidamente.

Resultado:

- App voltou para Home.
- Nao ficou preso no lobby.
- Nao apareceu erro visual `Room not found`.
- Logcat nao retornou:
  - `Room not found`
  - `Room refresh failed after action`
  - `Invalid room session`
  - `Cannot read property 'removeItem' of undefined`
  - `FATAL EXCEPTION`

## Observacao

Durante o primeiro reteste apareceu uma falha secundaria em Android debug: `Cannot read property 'removeItem' of undefined`. A causa era `disableDevGps` acessando `window.sessionStorage` fora do web. Foi corrigido e o fluxo completo passou depois disso.
