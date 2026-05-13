# 2026-05-12 - Lobby leave after GPS permission error

## Objetivo

Investigar o erro relatado ao criar uma sala, liberar GPS, entrar no lobby e tocar em `Sair`.

## Ambiente

- Device: `emulator-5554`
- Modelo: `sdk_gphone64_x86_64`
- Android SDK: `36`
- App: `com.eduardobertin.piqueesconde`
- Build instalada: `versionCode=4`, `versionName=1.0.1`
- Origem da build: instalacao local via ADB a partir do APK universal derivado do AAB de producao
- `installerPackageName=null`

## Reproducao

Primeira reproducao:

1. Abrir app.
2. Criar sala.
3. GPS ja estava concedido no emulador.
4. Entrar no lobby.
5. Tocar em `Sair`.

Segunda reproducao limpa:

1. `pm clear com.eduardobertin.piqueesconde`.
2. Revogar `ACCESS_FINE_LOCATION` e `ACCESS_COARSE_LOCATION`.
3. Abrir app.
4. Criar sala.
5. Tocar em `Permitir localizacao`.
6. No dialog Android, tocar em `While using the app`.
7. Confirmar entrada no lobby.
8. Tocar em `Sair`.

## Resultado observado

- O app nao crasha nativamente.
- A tela permanece no lobby.
- Aparece erro visual: `Room not found`.
- O logcat repete:

```text
Room refresh failed after action
code: P0001
message: Room not found
```

Nao apareceu:

- `FATAL EXCEPTION`
- crash de `AndroidRuntime`
- `Cannot read property 'pathname'`
- erro de `RoomRouteGuard`

## Diagnostico

O bug nao parece ser causado pelo GPS em si.

O fluxo de GPS apenas concede permissao e navega para o lobby. O erro acontece quando o jogador sai do lobby sendo o unico jogador da sala.

No backend, `pe_leave_room` apaga o player e, quando `remaining_count = 0`, apaga a sala:

- `supabase/migrations/202605090005_pe_leave_match_continue_fix.sql`

Enquanto isso, o cliente ainda tem refresh/realtime do lobby ativo. O refresh tenta buscar snapshot de uma sala que acabou de ser deletada. A RPC `pe_get_room_snapshot` responde `Room not found`, e o erro volta para o store/tela.

Arquivos envolvidos:

- `apps/mobile/app/create-room.tsx`: cria sala e navega para permissao.
- `apps/mobile/app/location-permission.tsx`: pede GPS e navega para lobby.
- `apps/mobile/app/lobby.tsx`: botao `Sair` chama `leaveRoom()` e depois `router.replace('/')`.
- `apps/mobile/src/state/room-store.tsx`: controla `leaveRoom`, refresh e realtime.
- `apps/mobile/src/services/room-service.ts`: chama RPC `pe_leave_room`.
- `supabase/migrations/202605100005_atomic_room_snapshot.sql`: snapshot levanta `Room not found` quando a sala nao existe.

## Relatorio dos agentes

### Agente: Lobby/Rotas

- Confirmou o caminho `create-room` -> `location-permission` -> `lobby` -> `leaveRoom` -> `router.replace('/')`.
- Causa mais provavel: ao sair sozinho, a sala e deletada no backend; o listener realtime ainda agenda `refreshRoom`; o snapshot falha com `Room not found`.
- Observou que `ignoredRoomIdsRef` protege apenas a aplicacao do snapshot, mas nao evita a chamada a `fetchSnapshot`.
- Apontou risco secundario: o botao `Sair` nao e desabilitado por `isLoading`, entao toque duplo pode gerar segunda RPC contra sessao ja removida.

### Agente: Estado/Servico

- Confirmou corrida entre `leaveRoom()` e refresh realtime/polling.
- Confirmou que `pe_get_room_snapshot` tenta validar o token/player antes de retornar estado de jogador removido; se o player ou sala ja sumiu, a RPC explode.
- Confirmou que GPS nao atualiza localizacao no lobby; `pe_update_player_location` so entra nas fases de jogo.

### Agente: QA/Reproducao

- Definiu checklist de reproducao com app limpo, criacao de sala, permissao GPS e saida do lobby.
- Criterio esperado: tocar `Sair` deve limpar sessao local e voltar para Home.
- Criterio observado neste run: permanece no lobby com `Room not found`.

## Severidade

Alta para teste interno.

O usuario fica preso em uma sala ja removida no backend, com erro visivel e sem voltar para Home.

## Recomendacao tecnica

Corrigir no cliente antes de nova build:

1. Durante `leaveRoom`, interromper/ignorar refreshes da sala antes da RPC e invalidar qualquer refresh em andamento.
2. Fazer `refreshRoom` retornar cedo se `ignoredRoomIdsRef` contem o `room.id`.
3. Tratar `Room not found` como sucesso local quando `leavingRoomRef.current` estiver ativo.
4. Desabilitar o botao `Sair` enquanto `isLoading` estiver true.
5. Depois da correcao, repetir:
   - sair como unico jogador no lobby;
   - sair com dois jogadores;
   - duplo toque em `Sair`;
   - cancelar na tela de GPS;
   - reabrir app e confirmar que a sala nao e restaurada.
