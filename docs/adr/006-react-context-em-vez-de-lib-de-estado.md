# ADR 006 — React Context em vez de biblioteca de estado externa

## Status
Aceito

## Contexto
Apps React Native com estado global complexo tipicamente usam Zustand, Redux ou Jotai. O PiqueEsconde tem um estado central significativo (sala, jogadores, fase, GPS) que poderia justificar uma dessas libs. Porém, o estado é concentrado em um único domínio (a partida em curso) e o projeto prioriza manter poucas dependências.

## Decisão
Usar React Context com um único RoomStore (~650 linhas) para todo o estado global do jogo.

## Consequências
+ Zero dependências adicionais
+ Simples de entender: um arquivo, um contexto
+ Suficiente para o escopo atual do app
- Re-renders não otimizados (Context re-renderiza todos os consumidores a cada mudança)
- Pode se tornar limitante se o app crescer para múltiplos domínios de estado
