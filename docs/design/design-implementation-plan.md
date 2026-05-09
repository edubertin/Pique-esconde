# Design Implementation Plan

Plano de implementação baseado no design system importado do Claude Design.

## Objetivo

Transformar o protótipo visual atual em um design system implementável e consistente no Expo/React Native, sem reescrever o app inteiro.

## Fase 1 - Tokens

Status: preparada.

Tarefas:

- Manter `docs/design/colors_and_type.css` como referência visual.
- Espelhar tokens essenciais em TypeScript.
- Separar tokens em:
  - cores
  - raios
  - sombras
  - espaçamentos
  - tipografia

Arquivos-alvo:

```txt
apps/mobile/src/theme/colors.ts
apps/mobile/src/theme/tokens.ts
```

## Fase 2 - Componentes Base

Status: parcialmente implementada.

Componentes atuais:

- `GameButton`
- `Badge`
- `AvatarChoice`
- `PlayerList`
- `Panel`
- `RadarView`
- `BrandLogo`
- `CoverBanner`

Próximos ajustes:

- Estado pressionado para botões.
- Variantes formais de painel: `default`, `strong`, `sunny`, `glass`, `hero`.
- Player card separado de `PlayerList`.
- Input component padronizado.

## Fase 3 - Telas

Status: parcialmente implementada.

Telas já seguindo a direção:

- Home.
- Criar sala.
- Entrar na sala.
- Permissão.
- Lobby.
- Regras.
- Esconder.
- Radar.
- Captura.
- Resultado.
- Card social.

Próximos ajustes:

- Rever responsividade em telas pequenas.
- Testar em Expo Go.
- Reduzir textos longos em estados de jogo.
- Conferir contraste sobre background em Android/iOS reais.

## Fase 4 - Movimento e Feedback

Status: pendente.

Tarefas:

- Haptics nos botões principais.
- Haptics na captura.
- Pulso visual no radar.
- Estado de rush final mais agressivo.
- Feedback de captura com transição curta.

## Fase 5 - Build Readiness

Status: pendente.

Tarefas:

- Confirmar ícone final.
- Confirmar splash final.
- Verificar assets para APK/IPA.
- Testar Expo Go.
- Preparar EAS build quando o fluxo estiver validado.

