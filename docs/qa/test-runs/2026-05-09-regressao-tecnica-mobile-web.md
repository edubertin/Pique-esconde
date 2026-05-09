# Test Run - Regressao Tecnica Mobile/Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica
Ambiente: Expo Web
Dispositivo: Desktop
Sistema: Windows
Commit: 5d192d3 + alteracoes locais

## Objetivo

- Validar se as mudancas recentes de UI, lobby, avatares, resultado, icone do app e internacionalizacao leve continuam compilando.
- Conferir se o app exporta para web sem erro de rota, imagem ou import.
- Registrar riscos que ainda nao podem ser considerados testados sem GPS/realtime reais.

## Escopo Testado

- Lint do app mobile.
- TypeScript do app mobile.
- Export web do Expo.
- Rotas estaticas geradas pelo Expo Router.
- Estrutura de i18n leve em `apps/mobile/src/i18n/`.
- Uso de assets locais de avatar e logo.
- Fluxos documentados de lobby, resultado e card social.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-001 | Parcial | Criacao de sala compila no estado local/mock; ainda precisa teste real de clique em navegador/dispositivo. |
| TC-002 | Parcial | Entrada por codigo compila no estado local/mock; ainda nao ha backend/realtime. |
| TC-003 | Parcial | Limite 2-8 esta representado no fluxo local e textos; bloqueio real acima do limite depende da proxima camada de sala/realtime. |
| TC-004 | Parcial | Saida da sala existe no fluxo local; sincronizacao com demais jogadores depende de realtime. |
| TC-005 | Parcial | Tela e textos de permissao compilam; permissao nativa real ainda nao foi implementada. |
| TC-008 | Parcial | Radar continua sem mapa exato no prototipo; GPS real ainda nao implementado. |
| TC-010 | Parcial | Resultado, avatar em destaque e jogar novamente compilam; logica ainda usa estado local/mock. |
| TC-011 | Parcial | Card social compila sem dados de GPS; compartilhamento nativo ainda nao implementado. |
| TC-012 | Parcial | Export web gerou rotas; validacao visual em browser/dispositivo ainda deve ser feita em rodada separada. |

## Evidencias

- `npm run lint` em `apps/mobile`: passou.
- `npx tsc --noEmit` em `apps/mobile`: passou.
- `npx expo export --platform web --output-dir dist-qa` em `apps/mobile`: passou.
- Rotas exportadas:
  - `/`
  - `/create-room`
  - `/join-room`
  - `/location-permission`
  - `/lobby`
  - `/rules`
  - `/hide-phase`
  - `/hider-status`
  - `/seeker-radar`
  - `/capture`
  - `/result`
  - `/social-card`
  - `/+not-found`
  - `/_sitemap`

## Bugs Encontrados

- Nenhum bug grave encontrado nesta execucao.

## Riscos ou Duvidas

- GPS real ainda nao foi testado.
- Realtime real ainda nao foi testado.
- Convite por link/share nativo ainda nao foi testado.
- Validacao visual por clique real em browser ou celular deve ser feita antes de considerar a rodada visual aprovada.
- O idioma ativo esta fixo em `pt-BR`, por decisao de MVP.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- Nao ha bloqueador tecnico grave para subir as mudancas atuais.
- O app passa em lint, TypeScript e export web.
- As limitacoes abertas continuam coerentes com `docs/qa/known-issues.md` e devem ser tratadas nas fases de GPS/realtime.
