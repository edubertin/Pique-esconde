# ADR 005 — GPS ativo somente durante a fase de busca

## Status
Aceito

## Contexto
O jogo requer localização dos jogadores para calcular proximidade. Manter o GPS ativo durante todas as fases (lobby, esconder, buscar, resultado) coleta mais dados do que o necessário e aumenta o consumo de bateria.

## Decisão
O GPS é ativado apenas durante a fase de busca, quando o cálculo de proximidade é necessário. Nas demais fases o watch de localização é pausado.

## Consequências
+ Coleta mínima de dados de localização (privacy by design)
+ Menor consumo de bateria
+ Superfície de exposição de dados GPS reduzida
- Requer lógica de start/stop do watch sincronizada com as transições de fase
- Primeira leitura GPS ao entrar na fase de busca pode ter delay de aquisição de sinal
