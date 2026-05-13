# Test Run - Android APK Local Build

Data: 2026-05-12
Responsavel: Codex
Tipo: Build / QA tecnico
Ambiente: Windows local, Expo prebuild, Gradle
Dispositivo: Emulador Android `mov-arena-api36` (`emulator-5554`)
Sistema: Windows / Java 17 / Android SDK local
Commit: worktree local

## Objetivo

- Gerar APK Android local instalavel para teste em aparelho real.
- Validar metadata basica do pacote e assinatura antes da instalacao.
- Confirmar que as mudancas recentes de guard de rota, preset de radar e documentacao nao quebram build nativo.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-APK-001 | Passou | `npm run lint` executado antes da build; sem erros, com 4 warnings preexistentes de unused vars. |
| TC-APK-002 | Passou | `npx tsc --noEmit` executado antes da build; sem erros. |
| TC-APK-003 | Passou | `npx expo prebuild --platform android --no-install` concluiu sem mudancas em `package.json`. |
| TC-APK-004 | Passou | `.\android\gradlew.bat -p android assembleRelease` terminou com exit code 0. |
| TC-APK-005 | Passou | APK gerado em `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. |
| TC-APK-006 | Passou | `apksigner verify --verbose` confirmou assinatura APK Signature Scheme v2. |
| TC-APK-007 | Passou | `aapt dump badging` confirmou package, versao, label e permissoes principais. |
| TC-APK-008 | Passou | `adb install -r --no-streaming` instalou a APK no emulador `emulator-5554` com `Success`. |
| TC-APK-009 | Passou | `adb shell monkey -p com.eduardobertin.piqueesconde 1` abriu o app. |
| TC-APK-010 | Passou | `dumpsys window` confirmou foco em `com.eduardobertin.piqueesconde/.MainActivity`. |
| TC-APK-011 | Passou | `pidof` retornou processo ativo para `com.eduardobertin.piqueesconde`. |
| TC-APK-012 | Passou | `logcat` recente nao retornou `FATAL EXCEPTION`, `AndroidRuntime`, `Cannot read property` nem `Maximum update depth`. |

## Evidencias

- APK local: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- Tamanho: 106497140 bytes
- Gerado em: 2026-05-12 15:21:30
- Package Android: `com.eduardobertin.piqueesconde`
- Version code: `3`
- Version name: `1.0.0`
- Min SDK: `24`
- Target SDK: `36`
- App label: `Pique Esconde`
- Activity validada: `com.eduardobertin.piqueesconde/.MainActivity`

Permissoes observadas no APK:

- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`
- `android.permission.VIBRATE`

## Avisos

- O build exibiu aviso: `The NODE_ENV environment variable is required but was not specified`. A build terminou com sucesso mesmo assim.
- O `expo prebuild` carregou `.env` apenas no subprocesso e exportou nomes `EXPO_PUBLIC_*`; nenhum valor foi exposto no log.
- O APK foi validado em emulador Android. Ainda falta validar em aparelho Android real.

## Proximo Passo

Conectar um Android real com depuracao USB ativa e executar:

```bash
cd apps/mobile
adb install -r --no-streaming android/app/build/outputs/apk/release/app-release.apk
adb shell monkey -p com.eduardobertin.piqueesconde 1
```

Depois disso, validar em campo com dois celulares: sala, permissao de GPS, lobby, esconderijo, radar, captura, resultado, rematch, convite/QR/share e ausencia de vazamento de localizacao.
