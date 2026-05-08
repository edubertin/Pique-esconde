# Spec - Location Radar

## Objetivo

Definir como localização, radar e captura funcionam sem transformar o app em monitoramento de pessoas.

## Princípios

- Localização é mecânica temporária de jogo.
- O procurador não vê mapa exato dos escondidos.
- O app mostra pistas de proximidade, direção aproximada, som e vibração.
- Dados de localização não devem ser compartilhados em redes sociais.
- Ao terminar a partida, o app deve parar de usar localização.

## Permissão

O app pede localização quando o jogador entra na sala.

Texto sugerido:

> O Pique Esconde usa sua localização apenas durante a partida para calcular o radar e as capturas. Não mostramos seu ponto exato para outros jogadores e não compartilhamos GPS em redes sociais.

Quem negar localização não participa como jogador ativo.

## Radar

O radar deve comunicar proximidade sem entregar posição exata.

Sinais possíveis:

- Intensidade visual.
- Seta ou direção aproximada.
- Pulso sonoro.
- Vibração/haptics.
- Estados como frio, morno, quente e muito perto.

Decisão de produto:

- O radar deve ser uma mistura de radar circular, ponteiro/direção aproximada, som e vibração.
- O ponteiro não precisa ser perfeitamente estável o tempo todo.
- Em alguns momentos ele pode "se perder" ou oscilar para manter a brincadeira divertida e compensar imprecisão natural de GPS/bússola.
- Quando o procurador estiver mais perto, o sinal pode ficar mais claro e confiante.

## Captura Automática

Regra inicial:

- Raio de captura sugerido: 8 metros para testes.
- Confirmar proximidade por cerca de 3 segundos.
- Evitar captura por uma única leitura instável de GPS.
- Ao capturar, avisar procurador e escondido com feedback visual, som e vibração.

## Progressão de Raio

- Início da busca: raio pequeno.
- Primeiros 30% do tempo: radar ajuda pouco para incentivar movimento.
- Meio da partida: raio aumenta gradualmente.
- Últimos 20 ou 10 segundos: rush final com raio maior.

## Ambientes

O app deve recomendar local aberto ou misto.

Não prometer boa experiência em ambiente fechado.

Presets futuros:

- Aberto.
- Misto.
- Menor.

## Decisões CEO Pendentes

- Confirmar nomes públicos dos estados do radar.
