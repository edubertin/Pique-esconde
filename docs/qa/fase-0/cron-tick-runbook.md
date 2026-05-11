# Runbook - Supabase Cron e Tick

Objetivo: confirmar que a manutencao server-side da Fase 0 esta ativa no ambiente usado para teste de campo e piloto fechado.

## Escopo

Este runbook valida:

- job de cron ativo;
- execucao recente do tick;
- ausencia de grant publico indevido;
- comportamento esperado quando timers expiram;
- registro de falhas sem expor localizacao sensivel.

## Nao Fazer

- Nao colar secrets, tokens, anon keys ou service role keys em docs, prints ou logs.
- Nao registrar latitude, longitude, rota, endereco ou coordenadas.
- Nao executar limpeza destrutiva fora de ambiente autorizado.
- Nao conceder `execute` para `anon` em funcoes de manutencao server-side.

## Funcoes Esperadas

| Funcao | Exposicao esperada | Observacao |
| --- | --- | --- |
| `pe_run_maintenance_tick()` | Server-side/admin only | Entrada principal para manutencao/timers/cleanup. |
| `pe_tick_game_session(...)` | Cliente apenas quando fizer parte do fluxo normal | Tick ligado a uma sessao especifica, se ainda usado pelo app. |
| `pe_cleanup_expired_state()` | Server-side/admin only | Nao deve ficar exposta para `anon` em piloto/prod. |

## Checklist Pre-Teste

- [ ] Confirmar ambiente alvo: dev, piloto ou prod.
- [ ] Confirmar que migrations de manutencao foram aplicadas.
- [ ] Confirmar que Supabase Cron esta habilitado no projeto alvo.
- [ ] Confirmar que o job `pe-maintenance-tick-every-minute` existe, se este for o nome adotado.
- [ ] Confirmar que `pe_run_maintenance_tick()` nao tem grant para `anon`.
- [ ] Confirmar que `pe_cleanup_expired_state()` nao tem grant para `anon`.
- [ ] Confirmar que logs/evidencias nao incluem localizacao sensivel.

## Consultas de Verificacao

Executar no SQL editor do Supabase ou ferramenta equivalente, no ambiente correto.

### Jobs Ativos

```sql
select
  jobid,
  jobname,
  schedule,
  active
from cron.job
where jobname ilike '%pe%maintenance%'
order by jobid;
```

Esperado:

- Existe um job de manutencao.
- `active = true`.
- Schedule compativel com a Fase 0, por exemplo a cada 1 minuto.

### Execucoes Recentes

```sql
select
  jobid,
  status,
  start_time,
  end_time,
  return_message
from cron.job_run_details
where start_time > now() - interval '15 minutes'
order by start_time desc
limit 20;
```

Esperado:

- Pelo menos uma execucao recente com `status = succeeded`.
- Sem falhas repetidas nos ultimos 3 a 5 minutos.
- `return_message` nao contem dado sensivel.

### Grants de Funcoes de Manutencao

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  r.rolname as grantee,
  has_function_privilege(r.rolname, p.oid, 'execute') as can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join pg_roles r
where p.proname in (
  'pe_run_maintenance_tick',
  'pe_cleanup_expired_state'
)
and r.rolname in ('anon', 'authenticated')
order by p.proname, r.rolname;
```

Esperado para piloto/prod:

- `anon` nao executa `pe_run_maintenance_tick`.
- `anon` nao executa `pe_cleanup_expired_state`.
- Se `authenticated` existir no projeto, aplicar a mesma regra a menos que haja decisao tecnica documentada.

## Teste Funcional Manual

Executar em ambiente de teste controlado.

1. Criar sala com 2 jogadores.
2. Iniciar partida com timers curtos, se houver suporte de ambiente.
3. Deixar o timer expirar sem acao manual do cliente.
4. Verificar se a fase avanca ou encerra corretamente.
5. Verificar se resultado/lobby ficam consistentes.
6. Verificar se dados temporarios de localizacao sao limpos quando aplicavel.

Resultado esperado:

- O backend acorda a partida mesmo sem interacao constante do cliente.
- Nenhum jogador fica preso em fase antiga.
- Nao ha exposicao de coordenadas em UI, snapshot, log ou evidencia.

## Criterio de Falha

Falha S0:

- Cron/tick exposto publicamente e permitindo manutencao indevida.
- Logs/evidencias expoem localizacao sensivel.
- Timer fica preso sem recuperacao.

Falha S1:

- Cron nao executa no ambiente alvo.
- Job executa com falha repetida.
- Tick depende de cliente ativo em fluxo que deveria ser server-side.

Falha S2:

- Execucao funciona, mas observabilidade e insuficiente.
- Falha intermitente com workaround manual documentado.

## Registro

Registrar resultado em:

- `docs/qa/fase-0/resumo-fase-0.md`
- um test-run em `docs/qa/test-runs/`
- `docs/qa/known-issues.md`, se restar risco relevante

