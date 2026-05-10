# 2026-05-10 - DEV target auto-hide on round start

## Objetivo

Validar que o `Alvo DEV` nao cai mais por `not_hidden_in_time` quando a rodada e iniciada apenas com o lider e o alvo sintetico.

## Mudanca validada

- Migration: `supabase/migrations/202605100006_auto_hide_dev_target_on_start.sql`
- Migration: `supabase/migrations/202605100007_skip_dev_target_gps_elimination.sql`
- Migration: `supabase/migrations/202605100008_keep_dev_hide_screen_and_clear_active_expiry.sql`
- Escopo: somente salas com player `Alvo DEV`.
- Comportamento: ao iniciar a rodada, o backend marca o `Alvo DEV` como `Escondido`.
- O backend mantem a fase `hiding` para preservar a tela de esconder e o botao `DEV liberar busca`.
- Durante a busca, o `Alvo DEV` nao e eliminado por falta de sinal GPS real.
- Ao iniciar a rodada, `expires_at` da sala ativa e limpo para impedir cleanup de lobby durante partida.

## Rotas testadas

1. `/`
2. `/create-room`
3. `/location-permission`
4. `/lobby`
5. `/seeker-radar`

## Resultado

Passou.

Fluxo final reproduzido via Playwright web em `http://localhost:8082`:

- Criou sala `JDTG`.
- Entrou com `Usar GPS DEV`.
- Lobby ficou com `Dudu` + `Alvo DEV`.
- Ao clicar em `Iniciar partida`, a rota permaneceu em `/hide-phase`.
- A tela mostrou `1 de 1 escondidos prontos` e o botao `DEV liberar busca`.
- Snapshot no banco confirmou `phase = hiding`, `expires_at = null`, `Dudu = Procurando`, `Alvo DEV = Escondido`.
- Ao tocar em `DEV liberar busca`, a rota foi para `/seeker-radar`.
- Snapshot final confirmou `phase = seeking`, `expires_at = null`, `closed_reason = null`.

## Observacao

Esse atalho e intencionalmente limitado ao `Alvo DEV`. Jogadores reais continuam precisando confirmar `Estou escondido` durante a fase de esconder.
