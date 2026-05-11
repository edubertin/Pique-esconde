# ADR 002 — RPCs server-side para toda lógica de jogo

## Status
Aceito

## Contexto
A lógica de transição de fase (esconder → buscar → captura → resultado) poderia viver no cliente ou no servidor. Com múltiplos jogadores conectados simultaneamente, lógica no cliente cria race conditions: dois jogadores podem tentar avançar a fase ao mesmo tempo com resultados inconsistentes.

## Decisão
Toda lógica crítica de jogo é executada via RPCs no Supabase (Postgres functions). O cliente apenas chama o RPC e aguarda o snapshot atualizado — nunca calcula ou aplica estado por conta própria.

## Consequências
+ Estado do jogo é sempre consistente entre todos os clientes
+ Impossível manipular o jogo via cliente
+ Transições atômicas evitam race conditions
- 30+ RPCs para manter e versionar
- Debug mais complexo (lógica no banco, não no app)
- Requer conhecimento de PL/pgSQL para evoluir o jogo
