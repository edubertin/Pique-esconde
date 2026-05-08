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
- Sugestão inicial: 30 minutos sem atividade.
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
- Botão de compartilhar.
- Lista de jogadores.
- Avatar e apelido.
- Status de cada jogador.
- Quem é o procurador/líder.
- Botão "preparado".
- Configuração de regras para o líder.
- Botão iniciar para o líder.

## Status

Estados principais:

- Entrou.
- Preparado.
- Escondendo.
- Escondido.
- Procurando.
- Capturado.
- Desconectado.

## Decisões CEO Pendentes

- Nenhuma decisão pendente no momento.
