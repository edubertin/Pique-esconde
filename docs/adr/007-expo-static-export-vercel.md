# ADR 007 — Expo static export + Vercel em vez de app web separado

## Status
Aceito

## Contexto
O jogo precisa funcionar via link de convite no browser (para jogadores que não têm o app instalado). A opção seria manter um app web separado em React. Expo suporta export estático que reutiliza o mesmo código do app mobile para gerar uma versão web.

## Decisão
Usar Expo static export deployado no Vercel para a versão web, compartilhando o mesmo codebase do app mobile.

## Consequências
+ Um único codebase para mobile e web
+ Deploy simples via Vercel
+ Monorepo preparado para crescer (apps/ folder)
- Expo web tem limitações: nem todas as APIs nativas funcionam
- Performance web inferior a um app React dedicado
- Algumas telas podem precisar de tratamento condicional (web vs native)
