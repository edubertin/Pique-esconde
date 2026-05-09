# 2026-05-09 - Final Snapshot Backend

## Objetivo

Validar no Supabase dev que o encerramento da rodada retorna snapshot final completo, idempotente e limpo para Resultado/Card Social.

## Ambiente

- Banco: Supabase dev via `SUPABASE_DB_URL`.
- Migration aplicada: `202605090027_final_snapshot_capture_cleanup`.
- Origem do teste: script Node local com driver `pg` temporario fora do repo.

## Fluxo Testado

1. Criar sala com `pe_create_room`.
2. Entrar segundo jogador com `pe_join_room`.
3. Marcar escondido como `Preparado`.
4. Iniciar rodada com `pe_start_round`.
5. Enviar localizacao do procurador e escondido com distancia aproximada de 2m.
6. Marcar escondido com `pe_mark_hidden`.
7. Chamar `pe_try_capture_nearest`.
8. Confirmar que a primeira tentativa retorna `reason=confirming` e `confirmRemainingSeconds=2`.
9. Aguardar 2.2s.
10. Chamar `pe_try_capture_nearest` novamente.

## Resultado

- Sala criada: `MRCZ`.
- Rodada: `48447171-7f04-4a56-8ea1-a8bc94d2fd59`.
- Segunda captura retornou `captured=true`.
- `remainingHiders=0`.
- `finalSnapshot` presente.
- `finalSnapshot.players` contem 2 jogadores.
- `finalSnapshot.result.winner=seeker`.
- `finalSnapshot.gameSessionId` corresponde a rodada finalizada.
- `pe_rooms.phase=finished`.
- `pe_game_sessions.status=finished`.
- `pe_game_sessions.winner=seeker`.
- `expires_at` ficou em aproximadamente 120s apos finalizacao.

## Limpeza Validada

Depois da finalizacao:

- `pe_player_locations`: 0.
- `pe_player_hide_spots`: 0.
- `pe_capture_confirmations`: 0.
- `pe_dev_test_distances`: 0.

## Idempotencia

Consulta posterior ao snapshot final confirmou:

- `winner` preservado.
- `finishedAt` preservado.
- `players` preservados no snapshot.

## Decisao

Backend dev aprovado para o proximo teste: validar pelo app com dois clientes e, depois, em celulares reais via HTTPS tunnel ou build nativo.
