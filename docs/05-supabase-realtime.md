# 05 - Supabase e Realtime

## Papel do Supabase

Supabase sustenta o estado realtime do MVP:

- salas temporarias;
- jogadores;
- regras da sala;
- sessoes de jogo;
- timers;
- snapshots atomicos;
- manutencao server-side;
- dados temporarios de localizacao usados para radar/captura.

## Snapshot Atomico

O app le a sala com `pe_get_room_snapshot`. Essa RPC devolve sala, jogadores, sessao ativa, jogador validado e avisos em uma chamada unica. Isso reduz inconsistencias causadas por leituras paralelas.

## Manutencao Server-Side

`pe_run_maintenance_tick` e funcoes auxiliares cuidam de transicoes que nao devem depender apenas de cliente ativo:

- liberar procurador;
- encerrar busca;
- aplicar regras de sinal/GPS;
- limpar salas expiradas;
- preservar partidas ativas.

## Privacidade no Backend

O backend pode processar coordenadas para calcular jogo, mas a interface deve receber sinais derivados. Snapshots e eventos para o cliente nao devem expor latitude/longitude de outros jogadores.

## Fontes Internas

- [Data Model](technical/data-model.md)
- [Realtime Events](technical/realtime-events.md)
- [Migrations](../supabase/migrations)
- [ADR-002 - Realtime Supabase](technical/decisions/ADR-002-realtime-supabase.md)
- [ADR-007 - Atomic Room Snapshot](technical/decisions/ADR-007-atomic-room-snapshot.md)
