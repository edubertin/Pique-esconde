# Spec - Privacy and Data

## Objetivo

Definir o mínimo de dados necessários para operar o MVP com privacidade por design.

## Dados Coletados no MVP

- Apelido temporário.
- Avatar escolhido.
- ID temporário do jogador na sala.
- Status de jogo.
- Localização durante a partida.
- Eventos de partida.

## Dados Evitados no MVP

- Nome completo.
- Foto do usuário.
- Perfil permanente.
- Lista de amigos.
- Feed social.
- Histórico permanente de localização.
- Rotas.
- Endereço.
- Coordenadas em cards sociais.

## Localização

- Usada apenas durante a partida.
- Não exibida como mapa exato para outros jogadores.
- Não compartilhada em redes sociais.
- Deve parar ao encerrar a partida ou sair da sala.

## Retenção de Dados

Política inicial proposta:

- Localização bruta: manter apenas durante a partida ativa e apagar ao fim da rodada/partida.
- Última localização em memória/realtime: usada somente para calcular radar e captura.
- Eventos da partida: manter por até 24 horas para depuração básica do MVP.
- Sala temporária: expira quando todos saem.
- Se restar apenas 1 jogador ativo, expira após 6 minutos sem novos jogadores.
- Apelido e avatar da sala: manter enquanto a sala estiver ativa ou dentro da janela curta de reconexão.
- Card social: gerado sem GPS, mapa real, rota, endereço ou coordenadas.
- Dados agregados anônimos: podem ser mantidos para métricas de produto, como partidas criadas, partidas concluídas e quantidade de jogadores, desde que não identifiquem pessoas nem trajetos.

Princípio:

Guardar o mínimo necessário pelo menor tempo possível. Quando a finalidade do dado acabar, ele deve ser apagado ou anonimizado.

## Compartilhamento Social

Permitido:

- Card de resultado.
- Avatares.
- Apelidos.
- Placar.
- Tempo de partida.
- Mensagem promocional.

Proibido:

- GPS.
- Mapa real.
- Rota.
- Endereço.
- Coordenadas.

## Decisões CEO Pendentes

- Verificar requisitos legais de idade mínima, termos de uso e loja antes de publicação.
