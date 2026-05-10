# ADR-006 - Server-Side Maintenance Tick

## Status

Accepted

## Context

O app ja possui timers de esconder/procurar, GPS temporario, captura por proximidade e limpeza oportunistica. Ate aqui, muitas transicoes eram acordadas por chamadas do cliente, como `pe_tick_game_session`, `pe_create_room` e `pe_join_room`.

Isso funciona no fluxo normal, mas deixa uma lacuna: se nenhum cliente estiver ativo no momento em que o timer vence, a sala pode permanecer temporariamente em uma fase antiga ate alguem abrir o app novamente.

## Decision

Adicionar uma entrada server-side de manutencao:

- `pe_run_maintenance_tick(target_room_id uuid default null, max_rooms integer default 50)`
- `pe_maintenance_tick_room(target_room_id uuid)`

Essas funcoes:

- rodam no Postgres como `security definer`;
- usam `search_path = public`;
- nao ficam expostas para `anon`;
- podem ser chamadas manualmente por SQL ou por Supabase Cron;
- reaproveitam helpers existentes em vez de duplicar regras:
  - `pe_cleanup_expired_state()`;
  - `pe_enforce_location_rules(room_id)`;
  - `pe_release_seeker_internal(...)`;
  - `pe_close_round(...)`;
  - `pe_final_round_snapshot(...)`.

O Supabase Cron no ambiente dev chama a rotina a cada minuto:

```sql
select cron.schedule(
  'pe-maintenance-tick-every-minute',
  '* * * * *',
  $$select public.pe_run_maintenance_tick(null::uuid, 50);$$
);
```

## Consequences

Impactos positivos:

- Timers e limpeza deixam de depender somente de cliente ativo.
- Resultado final continua usando o mesmo snapshot terminal.
- Dados temporarios de GPS, esconderijo, captura e DEV continuam sendo limpos pelo caminho central.
- A funcao e idempotente: chamadas repetidas nao devem duplicar resultado nem mudar vencedor.
- Salas em partida ativa (`hiding`/`seeking`) nao devem ser removidas por `expires_at` antigo do lobby; `pe_start_round` limpa `expires_at` e o cleanup de expiradas fica restrito a `lobby`/`finished`.
- O `Alvo DEV` e tratado como ferramenta de calibracao: pode ser auto-confirmado como `Escondido` e nao deve cair por falta de GPS real. Jogadores reais continuam sujeitos ao enforcement normal.

Cuidados:

- O retorno da manutencao nao deve expor latitude/longitude.
- O agendamento inicial usa intervalo conservador de 1 minuto.
- O job precisa ser monitorado antes de piloto/producao.
- A funcao usa locks por sala com `FOR UPDATE SKIP LOCKED` para reduzir disputa entre execucoes concorrentes.

## References

- Supabase Cron: https://supabase.com/docs/guides/cron
- Supabase Database Functions: https://supabase.com/docs/guides/database/functions
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
