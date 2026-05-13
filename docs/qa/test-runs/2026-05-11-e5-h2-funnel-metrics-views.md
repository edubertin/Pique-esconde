# Test Run - E5-H2 Funnel Metrics Views

Data: 2026-05-11
Ambiente: Supabase dev — dashboard SQL editor
Branch: `codex/final-snapshot-cleanup`
Migration: `202605110004_funnel_metrics_views`

## Objetivo

Validar as views agregadas de métricas de funil sem dados sensíveis (E5-H2 Fase A).

## Criterio de Aceite (E5-H2)

> Given sala/rodada/rematch, when evento e registrado, then mede funil sem coordenadas, rota, endereco, nome real ou identificador permanente.

## Como Aplicar

Cole a migration no SQL editor do Supabase e execute:

```sql
-- Arquivo: supabase/migrations/202605110004_funnel_metrics_views.sql
```

## Verificacoes a Executar Pos-Aplicacao

### 1. v_funnel_summary retorna sem erro

```sql
SELECT * FROM public.v_funnel_summary;
```

Esperado: uma linha com contagens e percentuais. Colunas: rooms_created, rooms_started_game,
rooms_reached_seeking, rooms_finished, sessions_total, sessions_finished, seeker_wins,
hiders_wins, rooms_with_rematch, lobby_to_game_pct, game_completion_pct, rematch_pct.

### 2. v_session_durations retorna sem erro (pode retornar vazio se < 3 sessoes concluidas)

```sql
SELECT * FROM public.v_session_durations;
```

Esperado: linhas agrupadas por environment_preset com percentis de duração.
Retorna vazio se nao ha 3+ sessoes concluidas para nenhum preset — comportamento correto.

### 3. Sem PII nas colunas retornadas

Verificar que nenhuma coluna das views contem: player_id, nickname, seeker_player_id,
lat, lng, room_id, final_snapshot, result ou qualquer identificador individual.

### 4. anon nao pode consultar as views

```sql
-- Executar como anon (ou verificar em session com anon key)
SELECT * FROM public.v_funnel_summary;
-- Esperado: permission denied ou zero rows por RLS
```

### 5. Consistencia: rooms_created >= rooms_started_game >= rooms_finished

```sql
SELECT
  rooms_created >= rooms_started_game AS c1,
  rooms_started_game >= rooms_finished AS c2,
  sessions_total >= sessions_finished AS c3,
  (seeker_wins + hiders_wins) <= sessions_finished AS c4
FROM public.v_funnel_summary;
-- Esperado: todos true
```

## Status

Migration aplicada com sucesso em 2026-05-11. Go/No-Go: **GO**.

## Observacoes de Privacidade

- Views nunca projetam `final_snapshot` (jsonb com playerIds) nem `result` de pe_rooms.
- `room_id` nao aparece no output — apenas agregados.
- `v_session_durations` tem HAVING COUNT(*) >= 3 para suprimir grupos com dados insuficientes.
- Nao ha grant a `anon` ou `authenticated` — acesso exclusivo via service_role / dashboard.
