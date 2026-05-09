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

Regra de início:

- O líder só pode iniciar quando todos os não-líderes estiverem `Preparado`.
- Se faltar alguém, o lobby mostra quem ainda precisa preparar.
- Não há expulsão automática por demora no lobby.
- O líder pode remover manualmente jogadores que estejam travando a sala.

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

## Sair Durante a Rodada

- Se um escondido comum sair e ainda restarem pelo menos 2 jogadores na sala, a rodada continua.
- Se o procurador sair durante a rodada, a rodada é interrompida, a sala volta para o lobby e outro jogador assume a liderança.
- Se qualquer saída deixar menos de 2 jogadores, a rodada é interrompida e a sala volta para o lobby com aviso de jogadores insuficientes.
- Quem saiu da partida volta para a tela inicial com aviso local.
- Quem permanece na sala vê o estado atualizado via realtime.

## Decisões CEO Pendentes

- Nenhuma decisão pendente no momento.
