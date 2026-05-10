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
- A tela do procurador usa o logo oficial no topo, radar grande no centro e HUD branco translucido abaixo do radar.
- O HUD agrupa tempo restante, escondidos restantes, barra de calor, status e alvo aproximado.
- O ponteiro não precisa ser perfeitamente estável o tempo todo.
- Em alguns momentos ele pode "se perder" ou oscilar para manter a brincadeira divertida e compensar imprecisão natural de GPS/bússola.
- Quando o procurador estiver mais perto, o sinal pode ficar mais claro e confiante.

## Pistas Derivadas

O backend calcula a pista do radar a partir das coordenadas reais e devolve apenas dados derivados para o app:

- Estado de proximidade: frio, morno, quente ou sem sinal.
- Direcao aproximada com ruido controlado.
- Confianca do ponteiro, subindo com o tempo mas limitada a cerca de 90%.
- Alvo mais proximo, sem expor latitude/longitude.
- Estado do sinal para apagar indicadores quando a leitura estiver instavel.

## Captura Automática

Regra inicial:

- Raio de captura e tempo de confirmação são derivados do preset congelado da rodada.
- No preset médio atual: 5 metros por 2 segundos contínuos.
- O botao de captura deve chamar a mesma validacao de GPS do backend.
- Evitar captura por uma única leitura instável de GPS.
- Ao capturar, avisar procurador e escondido com feedback visual, som e vibração.

## Ponto De Esconderijo

Quando o jogador toca em "Estou escondido", o backend salva o ponto GPS atual como ancora do esconderijo.

Exceção DEV: `Alvo DEV` não depende de ponto GPS real; ele é alvo sintético de calibração.

Regra inicial:

- O escondido pode se mover ate 10 metros do ponto salvo.
- Se sair desse raio, recebe aviso visual.
- Se persistir fora do raio, pode ser removido da rodada.

## Perda De Sinal

Regra inicial:

- 15 segundos sem GPS: estado de aviso/sinal instavel.
- 30 segundos sem GPS: remocao da rodada por sinal perdido.
- A remocao deve voltar o jogador para a tela inicial com aviso especifico.
- Exceção DEV: `Alvo DEV` não é eliminado por perda de sinal GPS real. Jogadores reais continuam sujeitos à regra.

## Tela Dos Escondidos

O escondido nao ve mapa nem direcao exata. A tela usa um coracao pulsando para comunicar risco:

- Calmo: procurador longe ou sem pista confiavel.
- Perto: procurador em aproximacao.
- Perigo: procurador em raio critico, inicialmente 8 metros.

O backend devolve apenas o nivel de perigo derivado da distancia entre procurador e escondido.

## Progressão de Raio

- Início da busca: raio pequeno.
- Primeiros 30% do tempo: radar ajuda pouco para incentivar movimento.
- Meio da partida: raio aumenta gradualmente.
- Últimos 20 ou 10 segundos: rush final com raio maior.

## Ambientes

O app deve recomendar local aberto ou misto.

Não prometer boa experiência em ambiente fechado.

Presets de pistas:

- Pequeno: quente 8m, morno 14m, frio 30m.
- Medio: quente 10m, morno 30m, frio 40m.
- Grande: quente 15m, morno 45m, frio 90m.

Implementacao MVP:

- O lider escolhe o ambiente no lobby.
- O backend congela o preset na rodada ativa.
- O radar usa o preset congelado da sessao, nao o argumento enviado pelo cliente.
- A captura tambem usa raio/confirmacao derivados do preset congelado.
- Pequeno usa captura mais conservadora; Medio mantem 5m/2s; Grande facilita teste em area aberta.

## Pendencias De Design

- Testar o HUD do radar em telas pequenas e celulares reais, garantindo que os botoes nao fiquem cortados.
- Desenhar tela do escondido com coracao/pulso para sinalizar proximidade do procurador.
