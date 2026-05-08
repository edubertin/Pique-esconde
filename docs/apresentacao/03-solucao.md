# 03 - Solução

## Proposta

O Pique Esconde permite que uma pessoa crie uma sala temporária, convide amigos por link e inicie uma partida presencial de pique-esconde com apoio de localização em tempo real.

Quem cria a sala assume o papel inicial de procurador. Essa pessoa configura as regras da partida, inicia o jogo e usa uma experiência de radar/proximidade para procurar os jogadores escondidos.

## Funcionalidades Principais

- Criar sala temporária.
- Compartilhar convite por link.
- Entrar na sala com apelido simples.
- Marcar presença como "preparado".
- Definir o criador da sala como procurador.
- Permitir que o procurador configure regras básicas da partida.
- Iniciar partida.
- Permitir que escondidos marquem status como "escondido".
- Liberar o procurador apenas quando todos os participantes estiverem escondidos ou quando uma regra de tempo permitir.
- Mostrar radar/proximidade para o procurador durante a busca.
- Capturar automaticamente jogadores encontrados por proximidade.
- Encerrar partida por vitória do procurador, vitória dos escondidos ou fim do tempo.

## Jornada do Usuário

### Criador / Procurador

1. Abre o app.
2. Cria uma sala temporária.
3. Compartilha o link com os amigos.
4. Aguarda os participantes entrarem.
5. Configura as regras do jogo.
6. Marca que está pronto.
7. Inicia a partida.
8. Espera os escondidos confirmarem que estão escondidos.
9. Recebe liberação para procurar.
10. Usa o radar/proximidade para encontrar os jogadores.
11. Captura automaticamente jogadores encontrados ao entrar no raio de captura.
12. Vence se encontrar todos antes do fim do tempo.

### Escondido

1. Recebe o link.
2. Entra na sala.
3. Escolhe um apelido.
4. Marca que está preparado.
5. Quando o jogo começa, vai se esconder.
6. Marca o status como "escondido".
7. Tenta não ser encontrado até o fim do tempo.
8. Vence se não for encontrado.

## Estados da Partida

- Sala criada.
- Aguardando jogadores.
- Jogadores preparados.
- Jogo iniciado.
- Escondidos se escondendo.
- Todos escondidos.
- Procurador liberado.
- Busca em andamento.
- Rush final.
- Partida encerrada.

## Regras Configuráveis

Regras que o criador da sala pode configurar no MVP ou logo após o MVP:

- Tempo total da partida.
- Tempo para os escondidos se esconderem.
- Quantidade mínima de jogadores.
- Área ou raio máximo de jogo.
- Modo de indicação de proximidade.
- Raio de captura.
- Tipo de ambiente da partida.
- Condição de vitória.

Para não deixar a configuração pesada, o app pode evoluir com presets em vez de números técnicos:

- Local aberto: parques, campos, praças e áreas amplas.
- Local misto: condomínios, clubes, campus e churrascos em áreas médias.
- Local menor: quintais, áreas internas grandes ou espaços mais limitados.

Cada preset pode ajustar automaticamente raio de detecção, raio de captura, tolerância do GPS e intensidade do rush final.

## Progressão do Radar

A partida deve ter tensão progressiva:

- No início da busca, o raio do procurador é pequeno para obrigar movimento real.
- Nos primeiros 30% do tempo, o radar ajuda pouco e exige exploração do espaço.
- Depois, o raio aumenta gradualmente.
- Nos últimos 20 ou 10 segundos, o raio aumenta bastante para criar um "rush final".

Essa mecânica evita que o jogo fique parado e cria uma reta final emocionante. A vitória acontece se o procurador encontrar todos antes do fim do tempo. Caso contrário, vencem os jogadores que não foram encontrados.

## Captura Automática

O botão "fui pego" não deve ser a mecânica principal. A captura acontece automaticamente quando o procurador entra no raio de captura de um escondido.

Regra inicial sugerida:

- Captura quando a distância entre procurador e escondido fica entre 5m e 8m.
- Confirmar a proximidade por alguns segundos ou por atualizações consecutivas.
- Tocar som, vibrar e exibir feedback nos dois celulares.
- Remover o jogador capturado da lista ativa de escondidos.

Essa tolerância é importante porque GPS pode oscilar dependendo de aparelho, internet, árvores, prédios e espaço físico. A configuração exata pode ser ajustada pelo criador da sala no futuro, preferencialmente por presets de ambiente.

## Benefícios

- Usa o digital para incentivar movimento físico.
- Transforma encontros comuns em uma brincadeira organizada.
- Não exige cadastro pesado.
- Funciona como experiência social de grupo.
- Usa uma brincadeira conhecida, mas com mecânica moderna.
- Pode viralizar visualmente por vídeos curtos e situações engraçadas.

## Diferenciais

- Jogo físico-digital baseado em uma brincadeira clássica.
- Sala temporária com convite por link.
- Localização usada como mecânica temporária, não como vigilância.
- Radar/proximidade em vez de mapa tradicional.
- Progressão de raio para criar ritmo e tensão.
- Experiência pensada para grupos presenciais e consumo ocasional.

## Decisão Pendente: Localização

Ainda precisamos definir como a localização será usada na experiência:

- Se o procurador verá posição exata, direção aproximada ou apenas intensidade de proximidade.
- Com que frequência a localização será atualizada.
- Como evitar sensação de monitoramento.
- Como lidar com GPS impreciso, internet ruim e bateria baixa.
- Como encerrar e apagar dados temporários ao fim da partida.
- Como calibrar raio de captura por tipo de ambiente.
