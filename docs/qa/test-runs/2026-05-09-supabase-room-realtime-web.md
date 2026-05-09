# Test Run - Supabase Room Realtime Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao tecnica e integracao
Ambiente: Expo Web + Supabase
Dispositivo: Desktop
Sistema: Windows
Commit: worktree local

## Objetivo

- Validar a primeira camada real de sala/lobby com Supabase.
- Confirmar que as RPCs anon conseguem criar sala, entrar por codigo e alterar estado de lobby.
- Confirmar que o app continua compilando apos a troca do store local para servico realtime.

## Escopo Testado

- Migration SQL `pe_rooms` e `pe_players`.
- RPCs `pe_create_room`, `pe_join_room`, `pe_toggle_ready`, `pe_add_demo_player`, `pe_promote_leader`, `pe_start_round` e `pe_finish_round`.
- Client Supabase com envs `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Store `room-store` integrado a `room-service`.
- Export web do Expo.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-SB-001 | Passou | `pe_create_room` criou sala com codigo de 4 letras usando anon key. |
| TC-SB-002 | Passou | `pe_join_room` entrou na sala por codigo e retornou sessao temporaria. |
| TC-SB-003 | Passou | Select anon de `pe_rooms` e `pe_players` retornou estado esperado sem expor `session_token_hash`. |
| TC-SB-004 | Passou | `pe_toggle_ready`, `pe_add_demo_player`, `pe_promote_leader`, `pe_start_round` e `pe_finish_round` executaram sem erro. |
| TC-TECH-001 | Passou | `npx tsc --noEmit` executado sem erros. |
| TC-TECH-002 | Passou | `npm run lint` executado sem erros. |
| TC-TECH-003 | Passou | `npx expo export --platform web --output-dir dist-qa-supabase` executado sem erros. |
| TC-WEB-001 | Passou | Dev server Expo carregou `.env` e respondeu `200` em `http://localhost:8084`. |
| TC-WEB-002 | Passou | Validacao manual do usuario confirmou criar sala, entrar por codigo e sincronizar lobby em abas. |
| TC-WEB-003 | Passou | Remocao pelo lider tira o jogador da sala e redireciona o removido para a home. |
| TC-WEB-004 | Passou | Jogador removido pode entrar novamente com codigo; remocao e kick leve, nao banimento. |

## Evidencias

- URL local: `http://localhost:8084`
- Migration inicial: `supabase/migrations/202605090001_pe_rooms_realtime.sql`
- Patch pgcrypto: `supabase/migrations/202605090002_pe_pgcrypto_schema_fix.sql`
- Servicos:
  - `apps/mobile/src/services/supabase-client.ts`
  - `apps/mobile/src/services/room-service.ts`
  - `apps/mobile/src/state/room-store.tsx`

## Bugs Encontrados

- A primeira versao da migration usava `gen_random_bytes`, `crypt` e `gen_salt` sem prefixo de schema. No Supabase, essas funcoes estao em `extensions`. Corrigido com `202605090002_pe_pgcrypto_schema_fix.sql`.

## Riscos ou Duvidas

- Teste visual em duas abas foi validado manualmente pelo usuario; ainda precisa ser repetido em celulares reais.
- Realtime foi conectado no app e validado em fluxo web local; ainda falta confirmar em rede/dispositivos moveis.
- Modelo sem login completo usa `session_token` local por jogador. Adequado para MVP/dev, mas deve ser reavaliado antes de producao.
- GPS, captura real por proximidade e share nativo continuam fora desta etapa.

## Decisao Final

Status: Aprovado com ressalvas

Resumo:
- A primeira camada real de sala/lobby com Supabase esta operacional no backend e no fluxo web local.
- Proxima validacao deve ser em dois dispositivos/celulares.
