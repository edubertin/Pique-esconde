# 2026-05-12 - EAS production AAB v4

## Objetivo

Gerar uma nova build Android aceitavel para Google Play depois do crash observado na build publicada com `versionCode 3`.

## Contexto

- Build da Play instalada no emulador: `versionCode 3`, `versionName 1.0.0`.
- Crash da build publicada: `RoomRouteGuard` tentou acessar `pathname` em objeto indefinido.
- Build local com a correcao ja abriu no emulador sem `FATAL EXCEPTION`.

## Alteracoes de versao

- `apps/mobile/app.json`
  - `expo.version`: `1.0.1`
  - `android.versionCode`: `4`
- `apps/mobile/package.json`
  - `version`: `1.0.1`
- `npx expo prebuild --platform android --no-install` propagou:
  - `android/app/build.gradle`: `versionCode 4`
  - `android/app/build.gradle`: `versionName "1.0.1"`

## Validacoes locais

- `npm run lint`: passou com 4 warnings conhecidos de variaveis/imports nao usados.
- `npx tsc --noEmit`: passou.

## Build

Comando:

```powershell
npx eas-cli build -p android --profile production --non-interactive
```

Resultado:

- Status: sucesso.
- Perfil: `production`.
- Formato: AAB.
- Credenciais: EAS usou credenciais Android remotas.
- URL EAS: https://expo.dev/accounts/edubertin/projects/pique-esconde/builds/55c26eb1-bd1e-403f-8da5-68cd9ccb6be9
- Artifact EAS: https://expo.dev/artifacts/eas/bAdA6YoJhtLGsVcwr8KKac.aab
- Copia local: `apps/mobile/build-artifacts/pique-esconde-1.0.1-v4-production.aab`

## Validacao do AAB

Bundletool:

- `validate`: passou.
- `package`: `com.eduardobertin.piqueesconde`.
- `versionCode`: `4`.
- `versionName`: `1.0.1`.
- `minSdkVersion`: `24`.
- `targetSdkVersion`: `36`.
- Permissoes de localizacao: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`.

Assinatura:

- `jarsigner -verify`: passou.
- Certificado valido ate 2053-09-25.

Compatibilidade 16 KB:

- `bundletool dump config`: `PAGE_ALIGNMENT_16K`.
- APK universal derivado do AAB: `zipalign -c -P 16 -v 4` passou.
- Bibliotecas nativas `arm64-v8a` e `x86_64`: LOAD alignment >= 16 KB.

## Decisao

Go para upload em track de teste da Google Play quanto a versionamento, target SDK, assinatura EAS e compatibilidade 16 KB.

Ainda nao foi feita a validacao pos-Play desta nova build. Depois de subir o AAB, instalar pela Play Store no emulador/aparelho e verificar logcat sem:

- `FATAL EXCEPTION`
- `AndroidRuntime`
- `Cannot read property 'pathname'`
- `Maximum update depth`
