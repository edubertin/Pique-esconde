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

### Unicidade de apelido

- Apelidos são únicos por sala — o mesmo apelido não pode ser usado por dois jogadores na mesma sala.
- A comparação ignora maiúsculas/minúsculas e acentuação: "Ana", "ANA" e "Aná" são tratados como equivalentes.
- O apelido exibido na sala preserva o que o jogador digitou; a normalização é usada apenas para verificar unicidade.
- Se o apelido escolhido já estiver em uso (ou for equivalente a um já existente), o jogador recebe uma mensagem de erro e pode escolher outro nome.
- A regra é aplicada no banco de dados — não apenas na interface — para prevenir condições de corrida.

## Lobby

O lobby mostra:

- Código/link da sala.
- Ícone de copiar código da sala.
- Botão de convidar por link/código nas ações inferiores.
- Lista de jogadores.
- Avatar e apelido.
- Status de cada jogador.
- Quem é o procurador/líder.
- A lista de jogadores permite promover outro jogador como líder/procurador.
- Botão "preparado".
- Resumo compacto das regras atuais: ambiente, esconder e busca.
- Caixa de regras clicável que abre a tela de configuração.
- Botão iniciar para o líder.
- Botão sair da sala.
- Banner visual fora do painel principal.
- Tabela de jogadores em área própria com até 4 linhas visíveis antes do scroll.

Regra de início:

- O líder só pode iniciar quando todos os não-líderes estiverem `Preparado`.
- Se faltar alguém, a tentativa do líder gera aviso realtime para toda a sala.
- O líder vê quem ainda precisa preparar.
- O jogador pendente vê um chamado direto para tocar em `Preparado`.
- Jogadores já prontos veem que estão aguardando os pendentes.
- Não há expulsão automática por demora no lobby.
- O líder pode remover manualmente jogadores que estejam travando a sala.
- O líder pode alterar regras apenas no lobby.
- Ao alterar regras, jogadores que estavam `Preparado` voltam para `Aguardando`.
- Jogadores que não são líderes podem ver as regras, mas não editar.

## Regras Da Sala

Configuração editável no MVP:

- Ambiente: Pequeno, Medio ou Grande.
- Tempo para esconder: 30s, 45s ou 60s.
- Tempo para procurar: 2min, 3min ou 5min.

Regras derivadas:

- O ambiente ajusta alcance de radar e captura no backend.
- A captura continua sendo validada no servidor.
- O app nunca envia latitude/longitude de outros jogadores para configurar regras.

Congelamento:

- `pe_rooms` guarda a configuracao editavel enquanto a sala esta no lobby.
- `pe_game_sessions` recebe um snapshot das regras quando a rodada inicia.
- Depois que a rodada comeca, mudar a sala nao altera a sessao ativa.
- Ao iniciar uma rodada ativa, `expires_at` da sala é limpo para evitar que o cleanup de lobby apague uma partida em andamento.
- O cleanup de salas expiradas remove apenas salas em `lobby` ou `finished`.

Atalho DEV:

- Em modo DEV, o player sintético `Alvo DEV` pode ser marcado automaticamente como `Escondido` ao iniciar a rodada.
- Esse atalho é limitado ao `Alvo DEV`; jogadores reais continuam precisando tocar em `Estou escondido`.
- `Alvo DEV` não é eliminado por falta de sinal GPS real durante busca DEV.

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
