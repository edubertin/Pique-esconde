# Test Run - Room Rule Presets

Data: 2026-05-10
Ambiente: Supabase dev via conexao SQL direta; validacao tecnica mobile com lint/TypeScript
Branch: `codex/final-snapshot-cleanup`
Migration: `202605100003_room_rule_presets`

## Objetivo

Validar regras configuraveis de sala e snapshot congelado na rodada.

## Escopo

- `pe_update_room_rules`
- `pe_start_round`
- `pe_get_radar_hint`
- `pe_try_capture_nearest`
- Tela `/rules`
- Resumo de regras no lobby

## Resultado Geral

Passou.

## Casos Executados

- Lider alterou regras no lobby para ambiente `large`, esconder `45s`, busca `5min`.
- Jogador nao lider falhou ao tentar alterar regras.
- Jogadores que estavam `Preparado` voltaram para `Aguardando` depois da mudanca de regra.
- `Alvo DEV` permaneceu `Preparado` depois da mudanca de regra, para manter o fluxo de calibracao rapido.
- Iniciar rodada congelou as regras em `pe_game_sessions`.
- Alterar regras fora do lobby falhou.
- Chamada maliciosa de radar com `area_preset='small'` nao alterou o preset congelado `large` da sessao.
- Radar DEV retornou `environmentPreset='large'`, `band='hot'` e `canCapture=true` em distancia 5.5m.
- Captura usou o raio congelado de 6m e retornou `finalSnapshot` ao capturar o unico escondido.

## Validacoes Tecnicas

- `npm run lint`
- `npx tsc --noEmit`
- `git diff --check`
- `QA_BASE_URL=http://localhost:8082 npx playwright test e2e/room-web-smoke.spec.js --browser=chromium`

## Evidencias

- Screenshot atualizado: `docs/qa/test-runs/2026-05-09-smoke-lobby-created.png`

## Observacoes

- As regras editaveis no MVP ficaram em tres controles: ambiente, tempo para esconder e tempo de busca.
- Captura e radar sao derivados do preset de ambiente para evitar painel tecnico demais.
- As regras permanecem na sala apos rematch, facilitando jogar novamente com o mesmo combinado.
- A UI permite edicao apenas pelo lider; outros jogadores podem ver.
