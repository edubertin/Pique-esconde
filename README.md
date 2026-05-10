# Pique Esconde

<p align="center">
  <img src="docs/design/referencias/pique-esconde-logo.png" alt="Pique Esconde logo" width="220" />
</p>

<p align="center">
  <strong>Um jogo mobile-first de pique-esconde fisico-digital com salas temporarias, radar por proximidade e privacidade por design.</strong>
</p>

<p align="center">
  <a href="https://pique-esconde.eduardobertin.com.br">Site oficial</a>
  ·
  <a href="https://pique-esconde.eduardobertin.com.br/privacy">Privacidade</a>
  ·
  <a href="https://pique-esconde.eduardobertin.com.br/terms">Termos</a>
  ·
  <a href="https://pique-esconde.eduardobertin.com.br/support">Suporte</a>
</p>

![MVP](https://img.shields.io/badge/status-MVP-ff2d8d)
![Expo](https://img.shields.io/badge/Expo-54-000020)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e)
![Vercel](https://img.shields.io/badge/Vercel-Web-000000)
![Privacy by Design](https://img.shields.io/badge/privacy-by%20design-b6f000)
![License](https://img.shields.io/badge/license-All%20rights%20reserved-lightgrey)

## Visao Geral

Pique Esconde ajuda grupos presenciais a criarem uma sala, convidarem amigos, escolherem quem procura e jogarem uma rodada de pique-esconde usando o celular como ferramenta de jogo.

O app usa Supabase Realtime para sincronizar sala e rodada, Expo/React Native para mobile e web, e GPS apenas durante partidas ativas para calcular pistas derivadas de radar e captura por proximidade.

O produto evita transformar localizacao em monitoramento: o procurador nao ve mapa exato dos escondidos, cards sociais nao incluem GPS, e salas/dados de partida sao temporarios.

## Links Rapidos

- [App web](https://pique-esconde.eduardobertin.com.br)
- [Documentacao](docs/README.md)
- [Specs do produto](docs/specs/README.md)
- [Arquitetura e ADRs](docs/technical/README.md)
- [Plano de QA](docs/qa/test-plan.md)
- [Politica de Privacidade](https://pique-esconde.eduardobertin.com.br/privacy)
- [Termos de Uso](https://pique-esconde.eduardobertin.com.br/terms)
- [Suporte](https://pique-esconde.eduardobertin.com.br/support)
- [Exclusao de dados](https://pique-esconde.eduardobertin.com.br/data-deletion)

## Escopo do MVP

- Salas temporarias com codigo, link de convite e QR code.
- Entrada com apelido simples e avatar pre-pronto.
- Lobby realtime com lista de jogadores, lider/procurador e status de preparo.
- Regras configuraveis no lobby: ambiente, tempo para esconder e tempo de busca.
- Rodada com fase de esconder, busca, captura e resultado.
- Radar de proximidade com sinais derivados, animacao e direcao aproximada.
- Sincronizacao via Supabase Realtime e snapshot atomico de sala.
- Manutencao server-side para timers, limpeza e transicoes criticas.
- Card social sem GPS, mapa, rota, endereco ou coordenadas.
- Paginas publicas de privacidade, termos, suporte e exclusao de dados.

## Stack

- **App:** Expo, React Native, Expo Router, TypeScript.
- **Web:** Expo static export hospedado na Vercel.
- **Backend:** Supabase Postgres, RPCs, Realtime e migrations SQL.
- **Localizacao:** `expo-location`, pistas derivadas e captura validada no backend.
- **Compartilhamento:** invite link, codigo de sala, QR code e card social.
- **QA:** Playwright smoke test, checklist manual e registros em `docs/qa`.

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

Teste smoke web:

```bash
cd apps/mobile
npm run qa:web
```

## Variaveis de Ambiente

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

## Privacidade

Localizacao e mecanica temporaria de jogo, nao produto de vigilancia.

Compromissos do MVP:

- usar localizacao apenas durante partidas ativas;
- nao mostrar mapa exato dos escondidos;
- nao manter historico permanente de rotas;
- nao incluir GPS, rota, mapa real, endereco ou coordenadas em cards sociais;
- manter salas, eventos e dados operacionais pelo menor tempo necessario;
- expor ao app sinais derivados como frio, morno, quente, direcao aproximada e confianca.

## Status Atual

O MVP esta em implementacao ativa. Ja existem app Expo, fluxo web/mobile, Supabase conectado, lobby realtime, regras de sala, rodada real, radar/GPS base, QR/link de convite, paginas legais e export web para Vercel.

Antes de piloto publico, ainda e necessario validar em celulares reais, ajustar documentos de loja, revisar requisitos de idade/classificacao e estabilizar QA de GPS em campo.

## Documentos Importantes

- [Visao geral da documentacao](docs/README.md)
- [Game loop](docs/specs/game-loop.md)
- [Radar e GPS](docs/specs/location-radar.md)
- [Salas e lobby](docs/specs/rooms-and-lobby.md)
- [Privacidade e dados](docs/specs/privacy-and-data.md)
- [Modelo de dados](docs/technical/data-model.md)
- [Eventos realtime](docs/technical/realtime-events.md)
- [Decisoes de arquitetura](docs/technical/decisions/README.md)
- [QA](docs/qa/test-plan.md)

## Licenca

Copyright (c) 2026 Eduardo Bertin. Todos os direitos reservados.

Este repositorio nao concede permissao para copiar, redistribuir, sublicenciar, vender ou reutilizar o codigo, marca, assets, documentos ou identidade visual sem autorizacao expressa.
