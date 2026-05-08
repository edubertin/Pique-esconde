# ADR-005 - No Exact Map

## Status

Aceita.

## Contexto

Mostrar localização exata dos escondidos reduziria a diversão e aumentaria sensação de vigilância.

## Decisão

O procurador não verá mapa exato dos escondidos. A interface usa radar, proximidade, direção aproximada, som e vibração.

## Consequências

- O jogo fica mais divertido e menos óbvio.
- Melhor alinhamento com privacidade.
- O backend/app ainda pode usar localização real para calcular pistas e captura.
- A experiência precisa calibrar bem GPS, raio e tolerância para não frustrar.

