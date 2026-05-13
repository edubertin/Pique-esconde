# 07 - App Store e Play Store

Este documento registra o estado de loja do Pique Esconde e os cuidados antes de promover qualquer versao alem de teste interno.

Ele nao afirma lancamento publico amplo. O estado atual e Google Play aceito para teste interno e iOS submetido para revisao da Apple.

## Status Atual

- Plataforma ativa nesta rodada: Google Play e Apple App Store.
- Pacote Android: `com.eduardobertin.piqueesconde`.
- Versao Android enviada: `1.0.2`.
- `versionCode`: `5`.
- Build: EAS production AAB.
- Envio: upload manual pelo Google Play Console.
- Status informado pelo Eduardo em 2026-05-13: app aceito na Google Play.
- Validacao em emulador: instalacao pela Play confirmada com `installerPackageName=com.android.vending`.
- Bundle ID iOS: `com.eduardobertin.piqueesconde`.
- App Store Connect Apple ID: `6768520532`.
- Versao iOS enviada: `1.0.2`.
- `buildNumber`: `1`.
- Build iOS: EAS production IPA `3796080a-2af9-46db-8036-24965b0049ab`.
- Envio ao App Store Connect/TestFlight: concluido em 2026-05-13.
- Status informado pelo Eduardo em 2026-05-13: app colocado em revisao na Apple.
- Proximo passo de loja: aguardar retorno da revisao da Apple e responder qualquer pendencia.

Relatorios:

- [EAS production AAB v5](qa/test-runs/2026-05-12-eas-production-aab-v5.md)
- [Google Play v5 pos-publicacao no emulador](qa/test-runs/2026-05-12-google-play-v5-post-publish-emulator.md)
- [Panorama final da build local](qa/test-runs/2026-05-12-final-local-build-panorama.md)
- [iOS App Store submission](qa/test-runs/2026-05-13-ios-app-store-submission.md)

## URLs Publicas Necessarias

- Privacy Policy URL: `https://pique-esconde.eduardobertin.com.br/privacy`
- Terms URL: `https://pique-esconde.eduardobertin.com.br/terms`
- Support URL: `https://pique-esconde.eduardobertin.com.br/support`
- Data deletion URL: `https://pique-esconde.eduardobertin.com.br/data-deletion`

## Metadados Usados Na Versao 1.0.2

Nome da versao:

```txt
1.0.2 - Correcao ao sair do lobby
```

Notas pt-BR:

```txt
Corrigimos um problema que podia ocorrer ao criar uma sala, permitir o GPS, entrar no lobby e tentar sair.

Tambem fizemos ajustes de estabilidade no fluxo de lobby, convite e localizacao.
```

Notas en-US:

```txt
Fixed an issue that could happen after creating a room, allowing GPS, entering the lobby, and trying to leave.

We also made stability improvements to the lobby, invite, and location flow.
```

## Pontos Criticos Para Revisao

- Declarar uso de localizacao de forma precisa.
- Explicar que localizacao e usada durante partidas ativas.
- Explicar que o app nao exibe mapa exato dos escondidos.
- Informar que GPS pode ser impreciso e nao deve ser usado como navegacao.
- Definir classificacao indicativa e politica para menores.
- Confirmar se o app sera direcionado a criancas ou a publico geral.
- Revisar textos de permissao no iOS/Android.
- Data Safety do Google Play e App Privacy da Apple devem permanecer alinhados ao comportamento final a cada nova release.

## Apple App Store

- `ios.bundleIdentifier`: `com.eduardobertin.piqueesconde`.
- `ios.buildNumber`: `1`.
- `ios.config.usesNonExemptEncryption`: `false`.
- App Privacy configurado no App Store Connect com localizacao precisa, ID de usuario e conteudos de jogos para funcionalidade do app, vinculados ao usuario e sem rastreamento.
- Categoria configurada como jogo; classificacao etaria calculada como `4+`.
- Politica de privacidade configurada com `https://pique-esconde.eduardobertin.com.br/privacy`.
- Preco configurado como gratis para a submissao inicial.
- Status atual: em revisao na Apple.

Pendencias para depois do retorno da Apple:

- Se aprovado, validar disponibilidade/TestFlight e preparar comunicacao de teste.
- Se rejeitado, registrar motivo da revisao, corrigir apenas o necessario e gerar nova build com `ios.buildNumber` incrementado.
- Testar em iPhone real, especialmente permissao de localizacao, share nativo, radar e captura.

## Metadados Sugeridos

Nome:

```txt
Pique Esconde
```

Descricao curta:

```txt
Crie salas, convide amigos e jogue pique-esconde com radar por proximidade.
```

Tags internas:

```txt
mobile game, hide and seek, gps, realtime, privacy by design
```

## Checklist Para Proxima Build Android

- Confirmar ultimo `versionCode` aceito pela Play.
- Incrementar `android.versionCode` no `app.json`.
- Atualizar `expo.version` e `package.json` se a versao precisar ser identificavel por QA/suporte.
- Rodar `npx expo config --type public`.
- Rodar `npm run lint`.
- Rodar `npx tsc --noEmit`.
- Gerar AAB com `npx eas-cli@latest build --platform android --profile production`.
- Validar AAB com bundletool quando possivel.
- Instalar pela Play Internal/Test depois da propagacao.
- Repetir smoke com criacao de sala, GPS, lobby, convite e sair do lobby.

## Pendencia De Automacao

`eas submit --non-interactive` ficou bloqueado porque a Google Service Account ainda nao esta configurada no EAS Submit.

Recomendacao:

```bash
npx eas-cli@latest submit --platform android --latest
```

Executar uma vez em modo interativo para configurar a credencial e permitir submit automatico nas proximas versoes.

## Aviso Importante

Antes de submissao publica ampla, os textos legais devem ser revisados considerando publico-alvo, paises de distribuicao, idade minima, permissao de localizacao, classificacao indicativa e regras de dados pessoais.
