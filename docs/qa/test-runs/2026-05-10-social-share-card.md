# Test Run - Social Share Card

Data: 2026-05-10
Ambiente: Expo Web em `localhost:8082`; validacao tecnica local
Branch: `codex/final-snapshot-cleanup`

## Objetivo

Validar a primeira versao do card social exportavel como imagem vertical para compartilhamento pelo share sheet do dispositivo.

## Resultado Geral

Passou para bundle web e validacao tecnica. Compartilhamento nativo precisa ser validado em app instalado iOS/Android.

## Escopo

- Tela `/social-card`
- Componente `SocialShareCard`
- Dependencias `expo-sharing` e `react-native-view-shot`
- Geracao de imagem `1080x1920`

## Casos Executados

- Card social redesenhado em formato vertical `9:16`.
- Preview usa imagem de fundo, avatar de destaque, resultado, estatisticas e marca do jogo.
- Botao `Compartilhar imagem` captura a view em PNG `1080x1920` e abre `expo-sharing` em iOS/Android instalado.
- Web mostra fallback quando compartilhamento local de imagem nao esta disponivel.
- Botao secundario volta ao resultado sem disputar com o route guard.

## Validacoes Tecnicas

- `npm run lint`
- `npx tsc --noEmit`
- `git diff --check`
- `QA_BASE_URL=http://localhost:8082 npx playwright test e2e/room-web-smoke.spec.js --browser=chromium`

## Observacoes

- Esta fase nao usa Supabase Storage e nao grava imagem no backend.
- O card nao contem GPS, mapa, rota ou coordenadas.
- Proximo teste necessario: abrir em build nativo/Expo Go, chegar no resultado, tocar em `Compartilhar imagem` e confirmar Instagram/WhatsApp no share sheet.
