# Pique Esconde Mobile

App Expo/React Native do Pique Esconde.

## Estado Atual

- Versao do app: `1.0.2`.
- Android `versionCode`: `5`.
- Pacote Android: `com.eduardobertin.piqueesconde`.
- Build Play: AAB `production` gerado por EAS, enviado manualmente e aceito na Google Play para teste interno.
- Proximo foco de loja: preparar submissao para Apple App Store.
- Web: export estatico Expo hospedado na Vercel.

Este app ja possui fluxo real de sala/lobby/rodada com Supabase, mas ainda precisa de QA de campo com 2+ celulares reais para validar GPS, radar, captura e realtime fora do emulador.

## Rodar Localmente

Instale dependencias:

```bash
npm ci
```

Rode o app web local:

```bash
npm run web:local
```

URL recomendada:

```txt
http://localhost:8086
```

`web:local` sobe Expo Web em porta fixa e limpa cache. Use esse comando quando quiser evitar rotas antigas ou estado de dev-server preso.

Para desenvolvimento Expo padrao:

```bash
npm start
```

## Variaveis Publicas

Configure as variaveis publicas no ambiente local ou no EAS:

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_BASE_URL=https://pique-esconde.eduardobertin.com.br
```

Nao commite `.env`, tokens, service accounts ou arquivos de credencial.

## Validacoes Locais

```bash
npm run lint
npx tsc --noEmit
npm run build:web
```

Smoke web:

```bash
npm run qa:web
```

## Android

APK local/debug para emulador ou verificacao rapida:

```bash
npx expo run:android
```

Build AAB de producao para Google Play:

```bash
npx eas-cli@latest build --platform android --profile production
```

O perfil `production` em `eas.json` gera `app-bundle`, formato correto para a Play Store.

Antes de nova submissao Android:

- incremente `expo.version` quando fizer sentido para QA/suporte;
- incremente `android.versionCode` acima do ultimo codigo aceito pela Play;
- confirme com `npx expo config --type public`;
- rode lint e TypeScript;
- gere AAB production;
- valide instalacao via Play Internal/Test quando a versao propagar.

## Submit Play

O AAB `1.0.2 (5)` foi enviado manualmente pelo Play Console porque `eas submit --non-interactive` ainda nao possui Google Service Account configurada.

Pendencia recomendada para proximas releases:

```bash
npx eas-cli@latest submit --platform android --latest
```

Rodar em modo interativo uma vez para configurar a Service Account e depois automatizar.

## Telas Principais

- Home
- Criar sala
- Entrar com codigo
- Permissao de localizacao
- Lobby
- Regras
- Fase de esconder
- Radar do procurador
- Status do escondido
- Captura
- Resultado
- Card social
- Paginas legais

## Estrutura

```txt
app/          Telas Expo Router
src/
  assets/     Assets do projeto
  components/ Componentes compartilhados
  constants/  Dados e regras compartilhadas
  features/   Modulos de dominio
  services/   Supabase, realtime, GPS e adaptadores
  theme/      Tokens visuais
  types/      Tipos TypeScript compartilhados
```

## Assets Visuais

- Icone principal: `assets/images/icon.png`
- Icone 512px: `assets/images/icon-512.png`
- Banner de loja/GitHub: `assets/images/pique-esconde-store-cover.png`
- Feature graphic: `assets/images/feature-graphic.png`
- Avatares: `assets/images/avatars/`

## Riscos De QA

Ja validado em emulador:

- abertura da build instalada pela Play;
- versao `1.0.2 (5)`;
- home carregando;
- fluxo local de lobby/GPS/sair sem regressao critica.

Ainda precisa de campo:

- entrada por convite em outro celular;
- realtime entre 2+ aparelhos;
- GPS real em movimento;
- radar e captura automatica;
- permissao de localizacao em aparelhos/OEMs diferentes.
