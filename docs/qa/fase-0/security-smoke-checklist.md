# Checklist de Smoke de Seguranca - Fase 0

Objetivo: validar rapidamente que o ambiente de teste/piloto nao expoe dados sensiveis nem ferramentas DEV.

## Privacidade de Localizacao

- [ ] Snapshots de sala nao retornam latitude.
- [ ] Snapshots de sala nao retornam longitude.
- [ ] Snapshots de sala nao retornam rota, endereco ou coordenadas.
- [ ] Card social nao mostra GPS, mapa, rota, endereco ou coordenadas.
- [ ] Logs/evidencias nao incluem localizacao bruta.
- [ ] Metricas agregadas nao guardam coordenadas.

## Grants e RPCs

- [ ] `anon` nao executa `pe_run_maintenance_tick()`.
- [ ] `anon` nao executa `pe_cleanup_expired_state()`.
- [ ] `anon` nao executa RPCs `pe_dev_*` em piloto/prod.
- [ ] `anon` nao executa `pe_add_demo_player` em piloto/prod.
- [ ] `anon` nao executa `pe_simulate_capture` em piloto/prod.
- [ ] Tabelas de GPS bruto nao sao legiveis por `anon`.

## UI e Build

- [ ] Controles DEV nao aparecem em build publica.
- [ ] Dados de teste como `Dudu`, `Ana` ou `ABCD` nao viram comportamento padrao de producao.
- [ ] Rotas legais abrem sem exigir sala ativa.
- [ ] Mensagens de localizacao explicam uso temporario.
- [ ] O app nao promete precisao perfeita de GPS.

## Evidencias Permitidas

Permitido:

- resultado textual de teste;
- nome da funcao avaliada;
- status Pass/Fail;
- erro sem token, chave ou localizacao.

Nao permitido:

- service role key;
- anon key;
- token de jogador;
- latitude/longitude;
- endereco real;
- print de painel com segredo;
- payload completo contendo dado sensivel.

## Decisao

Resultado: Pass | Fail | Blocked

Resumo:

-

Defeitos gerados:

-

