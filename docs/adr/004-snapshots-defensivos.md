# ADR 004 — Snapshots defensivos em vez de optimistic updates

## Status
Aceito

## Contexto
Optimistic updates aplicam a mudança no cliente imediatamente antes da confirmação do servidor, dando a sensação de resposta instantânea. Em um jogo multiplayer com estado crítico (fases, capturas, resultados), uma atualização otimista incorreta pode mostrar um estado inválido para o jogador — por exemplo, declarar captura antes do servidor confirmar.

## Decisão
O cliente nunca aplica estado por conta própria. Após qualquer mutação, aguarda o snapshot atualizado do servidor via Realtime antes de atualizar a UI.

## Consequências
+ Estado exibido é sempre verdadeiro e consistente com o banco
+ Sem necessidade de rollback em caso de erro
+ Simplifica o estado do cliente (sem lógica de reconciliação)
- Latência perceptível em ações do jogo
- UX menos fluida em conexões lentas
