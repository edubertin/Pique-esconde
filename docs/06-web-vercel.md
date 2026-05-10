# 06 - Web e Vercel

## Producao Web

O app web e exportado com Expo static export e hospedado na Vercel.

URL oficial:

```txt
https://pique-esconde.eduardobertin.com.br
```

URL Vercel:

```txt
https://pique-esconde.vercel.app
```

## Configuracao de Build

O arquivo `vercel.json` define:

```json
{
  "buildCommand": "cd apps/mobile && npx expo export --platform web",
  "cleanUrls": true,
  "framework": null,
  "installCommand": "cd apps/mobile && npm ci",
  "outputDirectory": "apps/mobile/dist"
}
```

## Desenvolvimento Local

```bash
cd apps/mobile
npm run web:local
```

URL local recomendada:

```txt
http://localhost:8086
```

## Validacao Antes de Deploy

```bash
cd apps/mobile
npm run lint
npx tsc --noEmit
npm run build:web
```

## Observacoes

- Convites por link dependem de `EXPO_PUBLIC_WEB_BASE_URL`.
- O dominio customizado deve estar configurado no Vercel e no DNS.
- O app usa rotas limpas para paginas como `/privacy`, `/terms`, `/support` e `/data-deletion`.
