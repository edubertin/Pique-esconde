# Contributing

Obrigado por ajudar o Pique Esconde.

Este projeto ainda esta em MVP. Mudancas devem ser pequenas, revisaveis e alinhadas aos docs de produto, privacidade e QA.

## Setup

```bash
cd apps/mobile
npm ci
npm run web:local
```

URL local recomendada:

```txt
http://localhost:8086
```

## Validacoes Antes de PR

```bash
cd apps/mobile
npm run lint
npx tsc --noEmit
npm run build:web
```

Quando a mudanca tocar fluxo de sala, lobby ou radar, rode tambem:

```bash
cd apps/mobile
npm run qa:web
```

## Fluxo de Trabalho

1. Leia os docs relacionados antes de mudar comportamento.
2. Mantenha PRs focados.
3. Atualize docs quando mudar fluxo, privacidade, Supabase, Vercel, convites, radar, GPS ou telas legais.
4. Inclua evidencias de teste no PR.
5. Nao exponha secrets, tokens, dados reais de usuarios ou coordenadas reais em issues/PRs.

## Fontes de Verdade

- Produto: `docs/specs/`
- Arquitetura: `docs/technical/`
- Decisoes: `docs/technical/decisions/`
- QA: `docs/qa/`
- App: `apps/mobile/`
- Supabase: `supabase/migrations/`

## Privacidade

O projeto trata localizacao como mecanica temporaria de jogo. Nao adicione mapas exatos, historico permanente de rotas ou compartilhamento de coordenadas sem uma decisao explicita de produto e privacidade.
