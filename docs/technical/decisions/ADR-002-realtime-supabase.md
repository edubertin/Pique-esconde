# ADR-002 - Realtime Supabase

## Status

Aceita para MVP.

## Contexto

O jogo precisa sincronizar sala, jogadores, status, eventos e sinais de partida em tempo real.

## Decisão

Usar Supabase Realtime e Supabase Postgres no MVP.

## Consequências

- Reduz necessidade de backend próprio no início.
- Facilita criação de salas, jogadores e eventos.
- Pode ser suficiente para validar o jogo.
- Se latência, escala ou controle de captura exigirem mais, a camada realtime pode migrar para Socket.IO/backend próprio.

## Mitigação

Não acoplar telas diretamente ao Supabase. Criar serviços internos como `room-service`, `game-service` e `location-service`.

