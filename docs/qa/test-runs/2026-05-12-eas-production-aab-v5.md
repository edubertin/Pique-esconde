# 2026-05-12 - EAS production AAB v5

## Objetivo

Gerar AAB Android de producao para envio ao Google Play com a correcao validada no smoke local do lobby/GPS/Sair.

## Versao

- Versao anterior em teste interno: `versionName=1.0.1`, `versionCode=4`.
- Nova versao gerada: `versionName=1.0.2`, `versionCode=5`.
- Estrategia: versionamento local/manual. `eas.json` nao foi migrado para `appVersionSource: remote` nesta rodada para evitar desalinhamento de versionCode.

## Alteracoes

- `apps/mobile/app.json`
  - `expo.version`: `1.0.2`
  - `android.versionCode`: `5`
- `apps/mobile/package.json`
  - `version`: `1.0.2`
- `apps/mobile/package-lock.json`
  - `version`: `1.0.2`

## Validacoes pre-build

- `npx expo config --type public`
  - package: `com.eduardobertin.piqueesconde`
  - version: `1.0.2`
  - versionCode: `5`
  - sdkVersion: `54.0.0`
  - projectId: `8660d6dd-c693-4d93-a7ce-bffd9b8977f2`
- `npx tsc --noEmit`: passou.
- `npm run lint`: passou com 4 warnings conhecidos.
- `npx eas-cli@latest whoami`: `edubertin`.

## Build EAS

Comando:

```powershell
npx eas-cli@latest build --platform android --profile production --non-interactive
```

Resultado:

- Status: sucesso.
- Perfil: `production`.
- Distribuicao: `store`.
- Formato: AAB.
- Credenciais Android: EAS usou credenciais remotas.
- Keystore: `Build Credentials YZs-eEj0bK (default)`.
- Build ID: `ca9004fb-782e-4e93-b63f-857eecb36153`.
- URL EAS: https://expo.dev/accounts/edubertin/projects/pique-esconde/builds/ca9004fb-782e-4e93-b63f-857eecb36153
- Artifact EAS: https://expo.dev/artifacts/eas/r1LH8q6dfrwBv9MGoB3tYp.aab
- Copia local: `apps/mobile/build-artifacts/pique-esconde-1.0.2-v5-production.aab`

## Validacao do AAB

Bundletool:

- `validate`: passou.
- `package`: `com.eduardobertin.piqueesconde`.
- `versionCode`: `5`.
- `versionName`: `1.0.2`.
- `minSdkVersion`: `24`.
- `targetSdkVersion`: `36`.
- Permissoes principais: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `INTERNET`, `ACCESS_NETWORK_STATE`.

Assinatura:

- `jarsigner -verify`: `jar verified`.
- Certificado valido ate `2053-09-25`.
- Aviso PKIX esperado para keystore Android autoassinado/EAS.

## Submit Play

Comando tentado:

```powershell
npx eas-cli@latest submit --platform android --latest --non-interactive --wait
```

Resultado:

- Bloqueado.
- Motivo: Google Service Account Keys nao podem ser configuradas em modo nao interativo.
- Mensagem EAS: `Google Service Account Keys cannot be set up in --non-interactive mode.`

## Upload manual e Play

Depois do bloqueio do EAS Submit, o AAB foi enviado manualmente pelo Google Play Console.

Detalhes cadastrados:

- Nome da versao: `1.0.2 - Correcao ao sair do lobby`.
- Notas pt-BR: correcao do problema ao criar sala, permitir GPS, entrar no lobby e sair.
- Notas en-US: equivalente em ingles para o mesmo fluxo.
- Publicacao gerenciada: desativada para teste interno, permitindo disponibilizacao automatica apos aprovacao.

Status reportado pelo Eduardo:

- Upload/publicacao executados.
- Projeto esta em analise no Google.
- Teste manual do usuario: deu certo.

## Validacao pela Play no emulador

Primeira tentativa:

- A Play Store mostrou `Update` e as notas corretas da nova versao.
- A atualizacao falhou porque o app instalado no emulador vinha de instalacao local e tinha certificado diferente do pacote da Play.
- Evidencia de log: `com.eduardobertin.piqueesconde is installed but certificate mismatch`.

Correcao do ambiente de teste:

- App local `com.eduardobertin.piqueesconde` foi desinstalado do emulador.
- App foi instalado novamente pela Play Store.

Resultado confirmado via `adb dumpsys package`:

- `versionCode=5`
- `versionName=1.0.2`
- `installerPackageName=com.android.vending`

Smoke de abertura:

- App abriu pela instalacao da Play.
- Home carregou com `Criar sala`, `Entrar com codigo`, `Como jogar`, `Privacidade`, `Termos` e `Suporte`.

## Decisao

Go para upload/submissao do AAB `1.0.2 (5)` ao Google Play Internal Test.

Upload manual no Play Console foi concluido e a instalacao pela Play foi validada no emulador. O status final do Google Play, segundo o usuario, ficou em analise pelo Google.

Ainda pendente para proximas rodadas: configurar Google Service Account para EAS Submit automatico. Para liberar alem do teste interno, repetir smoke completo pela Play:

- abrir app;
- criar sala;
- permitir localizacao;
- entrar no lobby;
- abrir QR/convite;
- sair do lobby;
- confirmar logcat sem `FATAL EXCEPTION`, `Room not found`, `Room refresh failed`, `Invalid room session` e `removeItem`.
