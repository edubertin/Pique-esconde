# ADR 001 — Radar de proximidade em vez de mapa

## Status
Aceito

## Contexto
O buscador precisa de alguma forma de localizar os jogadores escondidos. A opção mais óbvia seria exibir um mapa com a posição dos hiders. Isso cria dois problemas: expõe coordenadas GPS exatas em tempo real e elimina o desafio do jogo.

## Decisão
Usar um sistema de radar com dicas de proximidade (frio/morno/quente) e direção aproximada, sem revelar coordenadas ou exibir mapa.

## Consequências
+ Privacidade preservada: coordenadas nunca chegam ao cliente buscador
+ Mantém o desafio e a tensão do jogo
+ Cartas sociais podem ser compartilhadas sem risco de expor localização
- Requer lógica server-side para derivar as dicas a partir do GPS
- UX menos intuitiva para jogadores acostumados com mapas
