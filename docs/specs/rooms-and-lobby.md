# Spec - Rooms and Lobby

## Objetivo

Definir salas temporárias, entrada por convite e lobby antes da partida.

## Sala

- Sala é temporária.
- Sala tem código e link compartilhável.
- Sala suporta até 8 jogadores no limite rígido inicial.
- O limite de 8 jogadores aparece para o usuário na interface.
- Sala continua ativa enquanto houver jogadores conectados.
- Se todos saírem, a sala é encerrada.
- Se ficar sem atividade, expira automaticamente.
- Expira após 6 minutos se restar apenas 1 jogador ativo.
- Se ficar sem atividade sem jogadores ativos, expira imediatamente.
- Jogadores podem voltar para a mesma sala após desconexão ou problema temporário.
- Se o procurador/líder cair, a liderança passa automaticamente para o próximo jogador disponível.

## Entrada

Jogador entra com:

- Apelido simples.
- Avatar pré-pronto.
- Permissão de localização.

Sem login completo no MVP.

## Lobby

O lobby mostra:

- Código/link da sala.
- Botão de convidar por link/código.
- Lista de jogadores.
- Avatar e apelido.
- Status de cada jogador.
- Quem é o procurador/líder.
- A lista de jogadores permite promover outro jogador como líder/procurador.
- Botão "preparado".
- Configuração de regras para o líder.
- Botão iniciar para o líder.
- Botão sair da sala.

## Status

Estados principais:

- Entrou.
- Preparado.
- Escondendo.
- Escondido.
- Procurando.
- Capturado.
- Desconectado.

## Sair da Sala

- Jogador pode sair da sala pelo lobby.
- Se um jogador comum sair, a lista do lobby atualiza para todos.
- Se o líder/procurador sair antes da partida, a liderança passa para o próximo jogador disponível.
- Se restar apenas 1 jogador, a sala fica aguardando novos jogadores por até 6 minutos.
- Se ainda houver apenas 1 jogador após 6 minutos, a sala expira.
- Se todos saírem, a sala é encerrada.

## Decisões CEO Pendentes

- Nenhuma decisão pendente no momento.
