# Test Run - Google Play Test Build no Emulador

Data: 2026-05-12
Responsavel: Codex
Tipo: Play Store / QA tecnico
Ambiente: AVD Google Play `pique-play-api36`
Dispositivo: Emulador Android `emulator-5554`
Sistema: Android API 36 / Google Play
Origem do app: Google Play

## Objetivo

- Instalar no emulador a build publicada para teste no Google Play.
- Confirmar que a instalacao vem da Play Store, nao de APK local via ADB.
- Abrir o app e verificar foco/logcat.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-PLAY-001 | Passou | Criado AVD Google Play `pique-play-api36` com `system-images;android-36;google_apis_playstore;x86_64`. |
| TC-PLAY-002 | Passou | Play Store real confirmada em `/product/priv-app/Phonesky/Phonesky.apk`. |
| TC-PLAY-003 | Passou | Link `market://details?id=com.eduardobertin.piqueesconde` abriu a pagina do app na Play Store. |
| TC-PLAY-004 | Passou | Conta Google autorizada manualmente pelo responsavel no emulador. |
| TC-PLAY-005 | Passou | Botao `Install` disponivel para build de teste `com.eduardobertin.piqueesconde (unreviewed)`. |
| TC-PLAY-006 | Passou | App instalado com `installerPackageName=com.android.vending`. |
| TC-PLAY-007 | Falhou | Ao abrir o app, ocorreu crash fatal em `RoomRouteGuard`. |

## Evidencias

Metadata instalada:

- Package: `com.eduardobertin.piqueesconde`
- Version code: `3`
- Version name: `1.0.0`
- Installer: `com.android.vending`
- First install time: `2026-05-12 18:38:29`
- Last update time: `2026-05-12 18:38:29`

Erro observado no logcat:

```txt
ReactNativeJS: TypeError: Cannot read property 'pathname' of undefined
AndroidRuntime: FATAL EXCEPTION: mqt_v_native
AndroidRuntime: Process: com.eduardobertin.piqueesconde
AndroidRuntime: at RoomRouteGuard
ActivityTaskManager: Force finishing activity com.eduardobertin.piqueesconde/.MainActivity
```

## Analise

A build publicada na Play Store ainda contem o crash nativo ja conhecido do `RoomRouteGuard`, causado por acesso a `window.location.pathname` no React Native.

A worktree local ja possui correcao aplicada em `apps/mobile/src/components/room-route-guard.tsx`, usando `window.location?.pathname` apenas quando existir e aguardando `isRestoringSession`.

## Decisao

Status: Falhou para build publicada na Play.

Proximo passo recomendado:

1. Gerar nova build Android com a correcao local.
2. Publicar nova versao no track de teste do Google Play.
3. Reinstalar pelo mesmo fluxo da Play Store e repetir este test-run.
