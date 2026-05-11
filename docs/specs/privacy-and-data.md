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
- Rodadas ativas não expiram por `expires_at` antigo do lobby; o backend limpa essa expiração ao iniciar e o cleanup de salas expiradas atua apenas em `lobby` ou `finished`.
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

## Janelas de Retenção Formalizadas

As seguintes janelas estão implementadas e aplicadas automaticamente a cada tick de manutenção (cron a cada minuto) pela função `pe_enforce_retention_policy()`, introduzida na migration `202605110005_retention_policy_enforcement.sql`.

### `pe_player_locations` — GPS bruto

| Condição | Janela | Fundamento |
|---|---|---|
| Sessão ativa (`hiding` ou `seeking`) | Mantido | Necessário para radar e captura |
| Sessão encerrada (status `finished` ou ausente) | Apagado após 5 minutos | Graça para a tela de resultado carregar |
| Qualquer linha com `updated_at` antigo | Apagado após 2 horas | Teto absoluto — segurança contra sessões abandonadas |

### `pe_player_hide_spots` — posição bloqueada

Apagado pelo `pe_cleanup_expired_state()` existente quando não há sessão ativa correspondente e a linha tem mais de 10 minutos.

### `pe_game_sessions` — eventos da partida

Nunca deletados automaticamente. Retidos indefinidamente para as views de métricas de produto. Não contêm coordenadas GPS.

### `pe_rooms`

Expiradas pelo `pe_cleanup_expired_state()` existente via `expires_at` e por esvaziamento de jogadores.

### Princípio geral

Dado bruto de localização é apagado em até 5 minutos após o encerramento da rodada/partida. O teto absoluto de 2 horas garante que nenhum dado GPS permaneça no banco independentemente do estado da sessão. Nenhum dado de localização é retido para fins analíticos.

## Decisões CEO Pendentes

- Verificar requisitos legais de idade mínima, termos de uso e loja antes de publicação.
