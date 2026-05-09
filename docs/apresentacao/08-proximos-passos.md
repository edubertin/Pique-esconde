# 08 - Próximos Passos

## Decisões Pendentes

- Texto final de permissão de localização.
- Nome e comportamento dos presets de ambiente.
- Limpeza automática de salas expiradas no backend.
- Formato visual final do card social.
- Critério exato para considerar uma sala abandonada fora do app aberto.

Decisões já encaminhadas:

- Duração padrão: 60 segundos para esconder e 3 minutos para procurar.
- Tempo de esconder pode ser configurado, com máximo inicial de 60 segundos.
- Card social entra no MVP para ajudar divulgação.
- Card social não compartilha GPS, mapa real, rota, endereço ou coordenadas.
- Avatares iniciais: 4 opções.
- Direção dos avatares: rosto/busto cartoon, próximo da imagem de referência.
- Diversidade inicial: 2 avatares masculinos e 2 femininos, com cuidado de inclusão visual.
- Limite rígido inicial de sala: até 8 jogadores, evitando lobbies grandes.
- O limite de 8 jogadores aparece para o usuário.
- Troca de procurador em nova rodada: manual, escolhida pelo líder/procurador no lobby.
- O líder pode promover outro jogador da lista.
- Se o líder/procurador cair, liderança passa para o próximo jogador disponível.
- O líder só inicia a partida quando todos os não-líderes estiverem preparados.
- A tentativa de iniciar com alguém não preparado avisa toda a sala em realtime, com texto adaptado por papel.
- Não há kick automático no lobby; se alguém travar a sala, o líder remove manualmente.
- Jogadores podem voltar para a mesma sala após desconexão.
- Sala temporária deve expirar quando todos saírem ou após limite de inatividade.
- Se um escondido sai durante a partida e ainda restam pelo menos 2 jogadores, a partida continua.
- Se o procurador sai durante a partida, a rodada volta ao lobby e outro jogador assume a liderança.
- Se uma saída deixa menos de 2 jogadores, a rodada volta ao lobby com aviso.

## Tarefas Imediatas

1. Implementar permissão real de localização no dispositivo.
2. Criar envio temporário de posição durante a partida.
3. Implementar radar aproximado por distância, sem mapa exato.
4. Implementar captura automática por proximidade com tolerância de alguns segundos.
5. Calibrar som/haptics em celular real.
6. Implementar convite por link/deep link e compartilhamento nativo.
7. Testar em dois ou mais celulares no mesmo espaço físico.
8. Ajustar textos de permissão, aviso de GPS e estados de erro.

Concluído nesta etapa:

- Wireframes e direção visual inicial.
- Projeto Expo montado.
- Supabase configurado.
- Sala real com código.
- Lobby realtime.
- Entrada por código.
- Remoção pelo líder.
- Bloqueio de início quando há jogador não preparado.
- Aviso realtime no lobby com quem falta preparar.
- Promoção de líder/procurador.
- Rodada real sem GPS.
- Timer real de esconder/procurar.
- Timeout de esconder remove quem não confirmou "Estou escondido" a tempo.
- Captura simulada usando jogadores reais.
- Resultado e rematch na mesma sala.
- Regras reais de saída durante partida.
- QA técnico e smoke visual web.

## Materiais Necessários

- Imagem de referência visual já salva em `docs/design/referencias/pique-esconde-referencia.png`.
- Lista final de telas.
- Paleta inicial.
- Logo provisório ou wordmark.
- Quatro avatares iniciais.
- Textos curtos de permissão, privacidade e localização.
- Configuração inicial do Supabase.
- Celulares reais para teste.
- Local aberto ou misto para piloto.

## Cronograma Inicial

### Semana 1 - Protótipo

Status: concluída.

- Wireframes.
- Fluxo navegável.
- Lobby visual com avatares.
- Radar simulado.
- Resultado e card social simulado.

### Semana 2 - Base Técnica

Status: majoritariamente concluída.

- Projeto Expo.
- Estrutura de rotas.
- Supabase.
- Criação/entrada de sala.
- Lobby realtime.
- Entrada por código.
- Convite por link/deep link ainda pendente.

### Semana 3 - Jogo Real

- Status: em andamento.

- Permissão de localização.
- Atualização de posição.
- Radar/proximidade.
- Captura automática.
- Rush final.
- Resultado e jogar novamente.

Já concluído dentro desta fase:

- Rodada real sem GPS.
- Estados reais de jogadores.
- Timer real de rodada.
- Captura simulada em jogadores reais.
- Resultado e rematch.
- Regras de saída/encerramento da rodada.

### Semana 4 - Piloto

- Teste com 4 a 6 pessoas.
- Ajuste de raio, tempo e feedback.
- Ajuste de textos.
- Validação do card social.
- Preparação da próxima versão.

## Responsáveis

- Produto: definir regras, fluxo e critérios de sucesso.
- Design: wireframes, visual, avatares e card social.
- App: Expo, telas, navegação e experiência de jogo.
- Realtime/backend: Supabase, salas, eventos e estado da partida.
- Testes: validação em celular real e piloto presencial.

No MVP, uma mesma pessoa pode acumular vários papéis. O importante é manter essas responsabilidades visíveis para não misturar decisão de produto com implementação técnica.

## Texto Inicial de Permissão

Sugestão de texto antes de pedir localização:

> O Pique Esconde usa sua localização apenas durante a partida para calcular o radar e as capturas. Não mostramos seu ponto exato para outros jogadores e não compartilhamos GPS em redes sociais.

Texto curto para tela de entrada:

> Para jogar, precisamos da sua localização durante esta partida.

Texto para quem negar:

> Sem localização, você não pode participar como jogador ativo nesta rodada.

## Regra Inicial de Sala

- A sala continua ativa enquanto houver jogadores conectados.
- Se todos saírem, a sala é encerrada.
- Se a sala ficar sem atividade por um período definido, ela expira automaticamente.
- Se restar apenas 1 jogador ativo, a sala expira após 6 minutos sem novos jogadores.
- Se o líder/procurador sair em lobby, outro jogador assume a liderança.
- Se o procurador sair durante uma rodada, a rodada é interrompida e a sala volta para o lobby.
- Se um escondido sair durante a rodada e ainda restarem pelo menos 2 jogadores, a rodada continua.
- Se qualquer saída deixar menos de 2 jogadores na rodada, a sala volta para o lobby com aviso.
