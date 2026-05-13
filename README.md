# Pique Esconde

<p align="center">
  <img src="apps/mobile/assets/images/pique-esconde-store-cover.png" alt="Banner do Pique Esconde com criancas brincando, radar no celular e o texto Esconda, Marque, Corra" width="900" />
</p>

<p align="center">
  <strong>Um jogo mobile-first de pique-esconde fisico-digital com salas temporarias, radar por proximidade e privacidade por design.</strong>
</p>

<p align="center">
  <a href="https://pique-esconde.eduardobertin.com.br">App web</a>
  |
  <a href="https://pique-esconde.eduardobertin.com.br/privacy">Privacidade</a>
  |
  <a href="https://pique-esconde.eduardobertin.com.br/terms">Termos</a>
  |
  <a href="https://pique-esconde.eduardobertin.com.br/support">Suporte</a>
  |
  <a href="docs/README.md">Docs</a>
</p>

[![Mobile CI](https://github.com/edubertin/Pique-esconde/actions/workflows/mobile-ci.yml/badge.svg)](https://github.com/edubertin/Pique-esconde/actions/workflows/mobile-ci.yml)
![Status](https://img.shields.io/badge/status-lojas%20em%20revisao-ff2d8d)
![Expo](https://img.shields.io/badge/Expo-54-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e)
![Privacy by Design](https://img.shields.io/badge/privacy-by%20design-b6f000)

## O Que E

Pique Esconde ajuda grupos presenciais a criarem uma sala, convidarem amigos e jogarem uma rodada de pique-esconde usando o celular como apoio de partida.

O celular nao substitui a brincadeira: ele organiza a sala, sincroniza jogadores, mostra pistas de radar aproximadas e confirma capturas por proximidade. O procurador nao ve um mapa exato dos escondidos.

## Status Atual

- Android `1.0.2 (versionCode 5)` aceito na Google Play para teste interno.
- Build da Play instalada e aberta no emulador com `installerPackageName=com.android.vending`.
- iOS `1.0.2 (build 1)` enviado ao App Store Connect/TestFlight e colocado em revisao na Apple em 2026-05-13.
- Web demo disponivel em `https://pique-esconde.eduardobertin.com.br`.
- Fluxos locais validados: abertura, paginas legais, criar sala, permissao de GPS, lobby, QR, convite, regras e sair do lobby.
- Proximo gate: teste de campo com 2+ celulares reais para validar multiplayer, GPS real, radar, captura e realtime sob rede movel.

O projeto ainda nao deve ser descrito como lancamento publico aprovado. Ele esta em validacao controlada, com iOS aguardando revisao da Apple.

## Como Funciona

- Crie uma sala temporaria.
- Convide amigos por codigo, link ou QR code.
- Escolha regras de ambiente e tempo.
- Inicie a rodada presencial.
- Escondidos usam o app durante a fase de esconder.
- Procurador recebe sinais derivados de proximidade, sem mapa exato.
- A partida termina por captura ou resultado sincronizado.

## Privacidade

Localizacao e uma mecanica temporaria de jogo, nao um produto de vigilancia.

Compromissos do MVP:

- GPS usado apenas durante partidas ativas.
- Sem mapa exato dos escondidos.
- Sem historico permanente de rotas.
- Sem coordenadas, endereco, rota ou mapa real em cards sociais.
- Salas e dados operacionais mantidos pelo menor tempo necessario.
- Radar baseado em sinais derivados como frio, morno, quente, direcao aproximada e confianca.

## Visual Do App

<p align="center">
  <img src="apps/mobile/assets/images/icon-512.png" alt="Icone do aplicativo Pique Esconde" width="160" />
</p>

Assets principais:

- Icone do app: `apps/mobile/assets/images/icon.png`
- Icone 512px para README/loja: `apps/mobile/assets/images/icon-512.png`
- Banner de loja/GitHub: `apps/mobile/assets/images/pique-esconde-store-cover.png`
- Feature graphic: `apps/mobile/assets/images/feature-graphic.png`

## Stack

- **App:** Expo, React Native, Expo Router, TypeScript.
- **Web:** Expo static export hospedado na Vercel.
- **Backend:** Supabase Postgres, RPCs, Realtime e migrations SQL.
- **Localizacao:** `expo-location`, pistas derivadas e captura validada no backend.
- **Compartilhamento:** invite link, codigo de sala, QR code e card social.
- **QA:** Playwright smoke test, checklists manuais e test runs em `docs/qa`.

## Desenvolvimento Local

```bash
cd apps/mobile
npm ci
npm run web:local
```

URL local recomendada:

```txt
http://localhost:8086
```

Validacoes principais:

```bash
cd apps/mobile
npm run lint
npx tsc --noEmit
npm run build:web
```

Smoke web:

```bash
cd apps/mobile
npm run qa:web
```

## Variaveis De Ambiente

Copie `apps/mobile/.env.example` para `.env` e preencha:

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_BASE_URL=
```

`EXPO_PUBLIC_WEB_BASE_URL` deve apontar para a URL publica usada em convites, por exemplo:

```txt
https://pique-esconde.eduardobertin.com.br
```

Nunca commite `.env` ou credenciais.

## Docs Por Intencao

- Quero entender o produto: [docs/00-visao-geral.md](docs/00-visao-geral.md)
- Quero saber como jogar: [docs/01-como-jogar.md](docs/01-como-jogar.md)
- Quero revisar GPS/radar: [docs/03-radar-gps.md](docs/03-radar-gps.md)
- Quero entender lobby/convites: [docs/04-lobby-convites.md](docs/04-lobby-convites.md)
- Quero ver arquitetura: [docs/technical/README.md](docs/technical/README.md)
- Quero revisar privacidade: [docs/specs/privacy-and-data.md](docs/specs/privacy-and-data.md)
- Quero testar: [docs/qa/test-plan.md](docs/qa/test-plan.md)
- Quero ver status de loja: [docs/07-app-store-play-store.md](docs/07-app-store-play-store.md)

## Validacao Recente

- `1.0.2 (5)` gerado via EAS production AAB.
- AAB validado com bundletool.
- Instalacao via Play Store confirmada no emulador.
- Aceite na Google Play confirmado pelo Eduardo em 2026-05-13.
- Build iOS `1.0.2 (1)` gerada por EAS, enviada ao App Store Connect e colocada em revisao na Apple em 2026-05-13.
- Bug de sair do lobby apos criar sala e liberar GPS nao reproduziu no smoke local.

Relatorios:

- [iOS App Store submission](docs/qa/test-runs/2026-05-13-ios-app-store-submission.md)
- [EAS production AAB v5](docs/qa/test-runs/2026-05-12-eas-production-aab-v5.md)
- [Google Play v5 no emulador](docs/qa/test-runs/2026-05-12-google-play-v5-post-publish-emulator.md)
- [Panorama final da build local](docs/qa/test-runs/2026-05-12-final-local-build-panorama.md)

## Licenca

Copyright (c) 2026 Eduardo Bertin. Todos os direitos reservados.

Este repositorio nao concede permissao para copiar, redistribuir, sublicenciar, vender ou reutilizar o codigo, marca, assets, documentos ou identidade visual sem autorizacao expressa.
