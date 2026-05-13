# Test Run - Android APK Local Build

Data: 2026-05-10
Responsavel: Codex
Tipo: Build / QA tecnico
Ambiente: Windows local, Expo prebuild, Gradle
Dispositivo: Emulador Android `mov-arena-api36` (`emulator-5554`)
Sistema: Windows / Java 17 / Android SDK local
Commit: worktree local

## Objetivo

- Preparar build Android instalavel para teste em aparelhos reais.
- Documentar o caminho usado quando EAS Cloud Build ficou bloqueado por cota.
- Validar que a APK abre no ambiente nativo Android.

## Escopo Testado

- Configuracao EAS inicial.
- Perfil APK `development-apk`.
- Variaveis `EXPO_PUBLIC_*` no ambiente EAS `preview`.
- Geracao nativa Android via `expo prebuild`.
- Build local Gradle `assembleRelease`.
- Instalacao manual da APK no emulador via ADB.
- Abertura da activity nativa principal.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-APK-001 | Passou | `npx tsc --noEmit` executado sem erros antes da build. |
| TC-APK-002 | Passou | `npm run lint` executado sem erros antes da build. |
| TC-APK-003 | Passou | `npx eas-cli init --non-interactive --force` criou/vinculou o projeto EAS. |
| TC-APK-004 | Parcial | `npx eas-cli build -p android --profile development-apk --non-interactive` foi bloqueado por cota Android do plano gratuito. |
| TC-APK-005 | Passou | `npx expo prebuild --platform android` gerou a pasta nativa Android. |
| TC-APK-006 | Passou | `.\android\gradlew.bat -p android assembleRelease` terminou com `BUILD SUCCESSFUL`. |
| TC-APK-007 | Passou | `adb install -r --no-streaming` instalou a APK no emulador com `Success`. |
| TC-APK-008 | Passou | `adb shell am start -n com.eduardobertin.piqueesconde/.MainActivity` abriu o app; `dumpsys window` confirmou foco na `MainActivity`. |
| TC-APK-009 | Passou | `logcat` apos abertura nao retornou `FATAL EXCEPTION`, `Maximum update depth` nem `Cannot read property`. |

## Evidencias

- APK local: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- Tamanho aproximado: 105 MB
- Projeto EAS: `@edubertin/pique-esconde`
- EAS projectId: `8660d6dd-c693-4d93-a7ce-bffd9b8977f2`
- Package Android: `com.eduardobertin.piqueesconde`
- Activity validada: `com.eduardobertin.piqueesconde/.MainActivity`

## Bugs Encontrados

- EAS Cloud Build Android bloqueado por cota mensal do plano gratuito.
- Durante o primeiro teste nativo, o `RoomRouteGuard` acessava `window.location.pathname`; no React Native existe `window`, mas nao `window.location`, causando crash `Cannot read property 'pathname' of undefined`.
- Antes desse ajuste, tambem foi observado loop de navegacao por `router.replace` repetido para o mesmo destino.

## Correcoes Aplicadas Durante o Teste

- `RoomRouteGuard` passou a memorizar o ultimo destino de `router.replace`, evitando troca repetida para a mesma rota.
- `RoomRouteGuard` passou a usar `window.location?.pathname` apenas quando existir, mantendo `usePathname()` como fonte no native.

## Riscos ou Duvidas

- O APK ainda precisa ser validado em aparelho Android real.
- Build local release foi gerado fora do fluxo EAS Cloud; para distribuicao formal, preferir EAS quando a cota estiver disponivel ou usar plano com mais builds.
- O teste de GPS/radar/captura ainda depende de campo real.

## Decisao Final

Status: Passou com ressalvas

Resumo:
- APK foi gerado localmente, instalado e aberto com sucesso no emulador Android.
- Proxima etapa: instalar em Android real, criar sala com dois aparelhos e validar lobby, permissao de GPS, radar e captura.
