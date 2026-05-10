# 03 - Radar e GPS

## Principio

Localizacao e mecanica temporaria de jogo. Ela existe para calcular radar, pista, captura e regras de sinal durante uma rodada ativa.

## O Que o Procurador Ve

- Estado de proximidade, como frio, morno ou quente.
- Direcao aproximada.
- Confianca do sinal.
- Radar animado e feedback visual.
- Contagem de escondidos restantes.

O procurador nao ve latitude/longitude, mapa exato ou rota dos escondidos.

## O Que o Escondido Ve

O escondido nao recebe mapa do procurador. A interface comunica risco e proximidade de forma derivada, como estados de calma, perto ou perigo.

## Captura

A captura e validada no backend por proximidade e tempo de confirmacao. No preset medio atual, a referencia e 5 metros por 2 segundos continuos, com variacoes derivadas do ambiente.

## Perda de Sinal

O MVP trata sinal instavel como regra de jogo:

- cerca de 15 segundos sem GPS: aviso de sinal instavel;
- cerca de 30 segundos sem GPS: remocao da rodada por sinal perdido.

O alvo sintetico de desenvolvimento pode ser excecao para testes, mas jogadores reais continuam sujeitos a regra.

## Fontes Internas

- [Spec - Location Radar](specs/location-radar.md)
- [ADR-003 - Temporary Location](technical/decisions/ADR-003-temporary-location.md)
- [ADR-005 - No Exact Map](technical/decisions/ADR-005-no-exact-map.md)
