# 04 - Fluxo do Produto

## Fluxo Principal

O fluxo principal do MVP deve ser simples e rápido. O app existe para iniciar uma brincadeira presencial, não para prender o usuário em cadastro, feed ou configuração pesada.

1. Usuário abre o app.
2. Escolhe criar sala ou entrar com código/link.
3. Criador da sala vira o procurador.
4. Criador compartilha o link com os amigos.
5. Amigos entram na sala com apelido.
6. Cada jogador escolhe um avatar pré-pronto.
7. O app solicita permissão de localização para participação ativa.
8. Todos marcam "preparado".
9. Criador configura regras básicas.
10. Criador inicia o jogo.
11. Escondidos recebem tempo para se esconder.
12. Cada escondido pode marcar "estou escondido" para acelerar a liberação.
13. Quando todos estiverem escondidos ou o tempo de esconder acabar, o procurador é liberado.
14. Procurador usa radar/proximidade para buscar.
15. Captura acontece automaticamente por proximidade.
16. Nos segundos finais, entra o rush final com raio maior.
17. Partida termina por captura de todos ou fim do tempo.
18. Resultado mostra vencedor: procurador ou escondidos sobreviventes.
19. Grupo pode jogar novamente na mesma sala.

## Telas Necessárias

### 1. Tela Inicial

Objetivo: começar uma partida com o mínimo de fricção.

Elementos:

- Logo/nome Pique Esconde.
- Botão principal: Criar sala.
- Ação secundária: Entrar com código.
- Entrada automática caso o app seja aberto por link de convite.

### 2. Criar Sala

Objetivo: criar uma sala temporária.

Elementos:

- Nome/apelido do criador.
- Escolha de avatar pré-pronto.
- Confirmação de que o criador será o procurador.
- Aviso de que localização será necessária para jogar.
- Botão para criar sala.

### 3. Lobby da Sala

Objetivo: reunir o grupo antes da partida.

Elementos:

- Campo de apelido.
- Escolha de avatar pré-pronto.
- Solicitação/estado de permissão de localização.
- Confirmação de entrada.

### 4. Lobby da Sala

Objetivo: reunir o grupo antes da partida.

Elementos:

- Código/link da sala.
- Botão de compartilhar convite.
- Lista de jogadores com apelido e avatar.
- Status de cada jogador: entrou, preparado.
- Indicação do procurador.
- Botão "preparado".
- Botão do criador para configurar regras.
- Botão do criador para iniciar quando todos estiverem prontos.

### 5. Configurar Regras

Objetivo: permitir que o criador ajuste a partida sem complexidade.

Elementos:

- Tempo total de partida.
- Tempo para esconder.
- Limite inicial: até 60 segundos para esconder.
- Tipo de ambiente: aberto, misto ou menor.
- Modo de radar/proximidade.
- Resumo das regras.

### 6. Tempo de Esconder

Objetivo: dar tempo para os escondidos se posicionarem.

Para escondidos:

- Contagem regressiva.
- Botão "estou escondido".
- Aviso de que a localização será usada durante a partida.

Para o procurador:

- Tela de espera.
- Contagem de quantos já marcaram "escondido".
- Aviso de que ele será liberado quando todos estiverem escondidos.

### 7. Busca com Radar

Objetivo: guiar o procurador sem entregar localização exata.

Elementos:

- Radar visual.
- Intensidade de sinal.
- Seta ou direção aproximada.
- Tempo restante.
- Jogadores restantes com avatar/apelido.
- Feedback sonoro e vibração.
- Aviso de mudança de fase do raio.

### 8. Tela do Escondido Durante a Busca

Objetivo: manter o escondido informado sem dar vantagem excessiva.

Elementos:

- Tempo restante.
- Status da partida.
- Avisos: procurador liberado, radar aumentou, rush final.
- Feedback quando for capturado.
- Sem mapa exato do procurador.

### 9. Captura

Objetivo: confirmar automaticamente que um jogador foi encontrado.

Elementos:

- Feedback para o procurador: jogador encontrado.
- Feedback para o escondido: você foi encontrado.
- Avatar/apelido do jogador capturado.
- Som/vibração/animação.
- Atualização da lista de jogadores restantes.

### 10. Resultado

Objetivo: fechar a partida e incentivar nova rodada.

Elementos:

- Vencedor: procurador ou escondidos.
- Jogadores encontrados com avatar/apelido.
- Jogadores que sobreviveram com avatar/apelido.
- Tempo final.
- Botão jogar novamente.
- Botão compartilhar resultado.
- Botão sair da sala.

## Avatares

Avatares pré-prontos devem fazer parte do MVP, porque ajudam a diferenciar jogadores no lobby e deixam a partida mais divertida sem exigir foto, cadastro ou dados pessoais.

Direção recomendada:

- Avatares de rosto/busto em estilo cartoon, alinhados com a referência visual do projeto.
- Escolha rápida ao entrar na sala.
- Biblioteca inicial de 4 avatares, com 2 masculinos e 2 femininos, variação de aparência, cores e acessórios.
- Cuidado de inclusão visual desde a primeira versão.
- Sem upload de foto no MVP.
- Avatar usado no lobby, lista de jogadores, captura e resultado.
- Durante o jogo, avatar pode aparecer em pistas e eventos, mas sem revelar localização exata.

## Estados Importantes

- App aberto sem sala.
- Criando sala.
- Entrando por link.
- Entrando por código.
- Sala aguardando jogadores.
- Jogador não preparado.
- Jogador preparado.
- Avatar escolhido.
- Regras em configuração.
- Jogo iniciado.
- Escondidos se escondendo.
- Escondido confirmado.
- Procurador aguardando liberação.
- Procurador liberado.
- Busca em andamento.
- Captura automática.
- Rush final.
- Partida encerrada.
- Sala expirada.
- Jogador desconectado.
- Localização sem permissão.
- Internet instável.
- Bateria baixa.

## Regras do Produto

- A sala é temporária.
- Limite rígido inicial: até 8 jogadores por sala.
- Quem cria a sala é o procurador inicial.
- O líder/procurador escolhe manualmente o próximo procurador em novas rodadas.
- Se o líder/procurador cair, a liderança passa automaticamente para o próximo jogador disponível.
- Jogadores podem voltar para a mesma sala após desconexão.
- O convite acontece por link e código.
- Jogadores entram com apelido simples.
- Jogadores escolhem avatar pré-pronto ao entrar ou criar sala.
- Avatares diferenciam jogadores sem exigir foto ou perfil.
- O jogo depende de grupo; não existe experiência principal para jogador sozinho.
- Todos precisam marcar "preparado" antes do criador iniciar.
- Após o início, escondidos têm um tempo para se esconder.
- O botão "estou escondido" acelera a liberação do procurador.
- O procurador é liberado quando todos marcam "estou escondido" ou quando o tempo de esconder acaba.
- Localização é usada apenas durante a partida.
- Quem negar localização não participa como jogador ativo.
- O app deve recomendar local aberto ou misto e não prometer boa experiência em ambiente fechado.
- O procurador não vê mapa exato dos escondidos.
- Captura é automática por proximidade.
- O raio do radar aumenta com o tempo.
- O rush final aumenta bastante o alcance do procurador.
- Procurador vence se capturar todos antes do fim.
- Escondidos vencem se ao menos um não for capturado até o fim.
- Ao jogar novamente, o grupo permanece na mesma sala e uma nova rodada começa com as regras atuais ou ajustadas pelo criador.
- Ao encerrar a partida, dados temporários de localização devem parar de ser usados.

## Compartilhamento

O compartilhamento deve ser pensado como card social de resultado, não como compartilhamento de localização real.

Regra fixa: o app não compartilha GPS, localização, mapa real, endereço, coordenadas ou rota em redes sociais.

Pode incluir:

- Nome do jogo.
- Resultado da partida.
- Avatares/apelidos dos vencedores.
- Tempo de partida.
- Quantidade de capturas.
- Frase curta, como "Sobrevivi ao Pique Esconde" ou "Peguei geral no Pique Esconde".

Não deve incluir no MVP:

- Localização exata.
- Mapa real da partida.
- Rota dos jogadores.
- Endereço ou coordenadas.

## Integrações

Integrações necessárias ou prováveis:

- GPS/localização do dispositivo.
- Realtime para sala, status, posição e eventos de captura.
- Compartilhamento nativo do celular para enviar link da sala.
- Vibração e som para feedback de radar/captura.
- Deep link para abrir a sala diretamente pelo convite.

Integrações evitadas no MVP:

- Login social obrigatório.
- Feed social.
- Chat complexo.
- Pagamento.
- Ranking global.
