# 2026-05-12 - Google Play post-publish v4 emulator check

## Objetivo

Validar no emulador a build Android publicada na Google Play depois do upload da versao `1.0.1` / `versionCode 4`.

## Ambiente

- Device: `emulator-5554`
- Modelo: `sdk_gphone64_x86_64`
- Android SDK: `36`
- ABI: `x86_64`
- Fonte de instalacao esperada: Google Play Store

## Resultado

Bloqueado: a Play Store ainda esta entregando a build antiga.

Versao instalada apos abrir a pagina da Play e aguardar propagacao:

- `versionCode=3`
- `versionName=1.0.0`
- `installerPackageName=com.android.vending`

Depois de confirmar no Play Console que a release `1.0.1` esta `Disponivel para testadores internos`, foi feita uma nova tentativa:

1. Desinstalar `com.eduardobertin.piqueesconde` do emulador.
2. Abrir a pagina da Play Store.
3. Instalar pelo botao `Install`.
4. Verificar a versao instalada.

Resultado da reinstalacao pela Play Store:

- `versionCode=3`
- `versionName=1.0.0`
- `installerPackageName=com.android.vending`

Ou seja, mesmo em instalacao limpa, a Play Store ainda serviu o pacote antigo para este emulador/tester.

Estado visivel na Play Store:

- Botao exibido: `Open`
- Sem botao `Update`
- `What's new`: notas antigas da versao inicial
- `Last updated`: May 11, 2026

## Teste executado

Com logcat limpo, foi aberta a instalacao atual vinda da Play Store.

Resultado:

- Crash reproduzido na build antiga.
- Erro: `TypeError: Cannot read property 'pathname' of undefined`
- Componente: `RoomRouteGuard`
- Log: `FATAL EXCEPTION: mqt_v_native`

## Decisao

Nao e possivel validar a build `versionCode 4` pela Play ainda, porque o emulador/tester segue recebendo `versionCode 3`.

## Smoke local da build v4

Para separar problema de propagacao da Play de problema no binario novo, foi instalado no emulador o APK universal derivado do AAB de producao `1.0.1`:

- Origem: `apps/mobile/build-artifacts/universal-apk/universal.apk`
- Instalacao: ADB local, nao Play Store
- `versionCode=4`
- `versionName=1.0.1`
- `installerPackageName=null`

Resultado:

- App abriu.
- Logcat mostrou `Running "main"`.
- Nao houve `FATAL EXCEPTION`.
- Nao houve `Cannot read property 'pathname'`.
- Nao houve erro em `RoomRouteGuard`.

Quando a Play Store mostrar `Update` ou a instalacao passar para `versionCode 4`, repetir:

1. Instalar/atualizar pela Play Store.
2. Confirmar `versionCode=4` e `versionName=1.0.1`.
3. Limpar logcat.
4. Abrir app.
5. Confirmar ausencia de:
   - `FATAL EXCEPTION`
   - `AndroidRuntime`
   - `Cannot read property 'pathname'`
   - `Maximum update depth`
