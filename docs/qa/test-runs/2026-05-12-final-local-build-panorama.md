# 2026-05-12 - Final local build panorama

## Responsavel

- QA lead: Quinn / Poincare
- Orientacao tecnica: James / Developer
- Orientacao de arquitetura: Winston / Architect
- Orientacao de produto: Sarah / Product Owner

## Objetivo

Validar a ultima build local em APK debug, cobrindo o maximo possivel em um unico emulador Android, e consolidar o panorama final antes de novo ciclo em APK/AAB de loja.

## Ambiente

- Branch: `codex/final-snapshot-cleanup`
- Commit validado: `afa91f9`
- Device: `emulator-5554`
- Modelo: `sdk_gphone64_x86_64`
- Android SDK: `36`
- App: `com.eduardobertin.piqueesconde`
- Build instalada: APK debug local `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Versao instalada: `versionName=1.0.1`, `versionCode=4`, `targetSdk=36`
- Metro: `npx expo start --dev-client --port 8081 --clear`
- Observacao: sem build EAS/Expo para envio. Este ciclo validou apenas a build local.

## Parecer executivo

Resultado: **aprovado para smoke/regressao local no emulador**.

Nao houve crash, travamento, nem retorno do bug critico ao sair do lobby depois de criar sala e liberar GPS. O fluxo principal de primeira abertura, criacao de sala, permissao de GPS, lobby, QR, convite, regras e saida voltou para Home sem erros filtrados no processo do app.

Ainda nao e um "go" final para piloto em campo, porque os pontos de multiplayer real, realtime entre dois aparelhos, radar/captura por GPS real e promocao/remocao de jogadores exigem pelo menos dois dispositivos fisicos.

## Validacoes tecnicas

| Area | Resultado | Observacao |
| --- | --- | --- |
| TypeScript | Passou | `npx tsc --noEmit` |
| Lint | Passou com warnings | 4 warnings pre-existentes: `LegalBullet`, `Platform`, `highlightName`, `surfaces` nao usados |
| JSON | Passou | `app.json`, `eas.json`, `package.json`, `package-lock.json` validos |
| Web export | Passou | `npm run build:web`, 20 rotas exportadas |
| Android debug build | Passou | `gradlew app:assembleDebug -x lint -x test` |
| Instalacao no emulador | Passou | `adb install -r -d ...app-debug.apk` |
| Versao instalada | Passou | `versionCode=4`, `versionName=1.0.1`, `targetSdk=36` |
| Audit npm | Atencao | 4 vulnerabilidades moderadas via `postcss <8.5.10` em cadeia Expo/Metro; `npm audit fix --force` sugeriria downgrade/quebra para Expo 49, nao aplicado |

## Testes manuais no emulador

| ID | Fluxo | Resultado | Evidencia |
| --- | --- | --- | --- |
| TC-FINAL-001 | Primeira abertura limpa | Passou | Home abriu com `Criar sala`, `Entrar com codigo`, `Como jogar`, `Privacidade`, `Termos`, `Suporte` |
| TC-FINAL-002 | Paginas estaticas | Passou | `Como jogar`, `Privacidade`, `Termos` e `Suporte` abriram e voltaram para Home |
| TC-FINAL-003 | Entrar com codigo invalido | Passou | Codigo `ABCD` manteve usuario na tela e exibiu `Room not found`, sem crash |
| TC-FINAL-004 | Criar sala com GPS negado | Passou | Botao `Nao permitir` retornou para Home, sem crash |
| TC-FINAL-005 | Criar sala com GPS permitido | Passou | Android permission `While using the app`; lobby abriu com codigo de sala e jogador `Dudu` |
| TC-FINAL-006 | Lobby basico | Passou | Estado `1/8`, jogador lider, botao `Aguardando jogadores`, `Convidar`, `Sair` |
| TC-FINAL-007 | Copiar codigo e QR | Passou | QR abriu com codigo da sala e texto de entrada |
| TC-FINAL-008 | Regras | Passou parcial | Tela de regras abriu com ambiente, tempos e captura automatica; alteracao efetiva nao foi confirmada no emulador |
| TC-FINAL-009 | Share nativo | Passou | Android share sheet abriu com texto `Bora jogar Pique Esconde?` e link `piqueesconde:///join-room?code=...` |
| TC-FINAL-010 | Sair do lobby com duplo toque | Passou | Voltou para Home; log filtrado sem `Room not found`, `Room refresh failed`, `Invalid room session`, `removeItem`, `FATAL EXCEPTION` |
| TC-FINAL-011 | Relaunch apos force-stop | Passou com observacao | App voltou para Home apos relaunch; sessao nativa de lobby nao foi restaurada |

## Logcat

Filtros usados no processo do app:

```text
FATAL EXCEPTION
AndroidRuntime
Room not found
Room refresh failed
Invalid room session
Cannot read
Unhandled
ReactNativeJS.*Error
P0001
removeItem
```

Resultado: sem ocorrencias nos checkpoints criticos do fluxo principal, QR/regras/share e saida do lobby.

## Cobertura que ainda precisa de 2 aparelhos

- Entrar em uma sala por QR/link/codigo em outro dispositivo.
- Realtime real entre lider e convidado.
- Toggle de pronto do esconderijo.
- Inicio de partida com mais de um jogador.
- Radar, proximidade e captura automatica com GPS real.
- Sair durante partida e preservar sala para outros jogadores.
- Promover/remover jogadores.
- Rematch e tela de resultado em fluxo completo.
- Comportamento de permissoes em aparelhos fisicos/OEMs diferentes.

## Riscos e recomendacoes dos agentes

- QA: manter este resultado como smoke local aprovado, mas nao substituir teste de campo com dois aparelhos.
- Developer: a regressao do `Sair` esta coberta no cenario mais importante. Antes de nova publicacao na Play, incrementar `versionCode` acima de `4`.
- Architect: o principal risco restante esta no contrato realtime/GPS em ambiente real, nao no render local do emulador.
- Product Owner: para liberar piloto, exigir pelo menos um ciclo presencial com duas contas/dispositivos, convite real e uma rodada completa.

## Conclusao

A ultima build local esta estavel para os fluxos que o emulador consegue cobrir. O bug de sair do lobby apos GPS nao reproduziu mais. O proximo passo recomendado e gerar uma build de teste com `versionCode` novo e executar o roteiro de campo com dois aparelhos reais antes de promover nova versao na Play.
