# Test Run - Atomic Room Snapshot

Data: 2026-05-10
Ambiente: Supabase dev via SQL direto; Expo Web em `localhost:8082`
Branch: `codex/final-snapshot-cleanup`
Migration: `202605100005_atomic_room_snapshot`

## Objetivo

Validar a nova RPC `pe_get_room_snapshot` como fonte unica de leitura de sala para reduzir mistura de estado entre Resultado, Lobby, Realtime e rematch.

## Resultado Geral

Passou.

## Casos Executados

- Migration aplicada no Supabase dev.
- Criada sala temporaria em transacao SQL.
- Forcado estado inconsistente de QA: sala em `lobby` com lider, jogador real e `Alvo DEV` ainda como `Escondido`.
- `pe_get_room_snapshot` retornou:
  - lider como `Entrou`;
  - jogador real como `Aguardando`;
  - `Alvo DEV` como `Preparado`;
  - `gameSession = null` no lobby.
- Confirmado que o snapshot nao contem campos brutos de GPS como `lat`, `lng`, `accuracy_m` ou `heading_degrees`.
- Iniciada rodada real na mesma transacao.
- `pe_get_room_snapshot` retornou `phase = hiding`, `gameSession` da rodada ativa e status de rodada preservados fora do lobby.
- Confirmado grant `execute` para `anon` na RPC.

## Validacoes Tecnicas

- `npm run lint`
- `npx tsc --noEmit`
- `git diff --check`
- `QA_BASE_URL=http://localhost:8082 npx playwright test e2e/room-web-smoke.spec.js --browser=chromium`

## Observacoes

- O problema mais provavel do bug reportado era snapshot cliente montado com leituras paralelas em momentos diferentes, nao uma falha direta da regra de lobby.
- A mensagem antiga `Rules can only be changed in the lobby` tambem foi tratada no store, limpando erro global quando entra em `finished`, `lobby` ou rematch bem-sucedido.
