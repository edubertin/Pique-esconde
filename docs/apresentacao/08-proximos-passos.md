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
- A interface usa o nickname de quem vai procurar sempre que possível; "escondidos" permanece como nome do grupo vencedor.
- Resultado é uma tela terminal: sem voltar no topo, com ações de jogar novamente, sair e compartilhar.

## Tarefas Imediatas

Pausa atual: não avançar para a próxima grande camada até fechar documentação, QA e revisão do fluxo já implementado.

1. Revisar documentação e QA do fluxo atual de salas/rodada sem GPS.
2. Repetir smoke manual curto em duas abas quando houver alteração de UI ou regra.
3. Manter as migrations aplicadas no Supabase alinhadas com o repositório.
4. Só depois iniciar a próxima camada grande: localização, radar real e captura automática por proximidade.

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
- Proteção para voltar ao lobby quando a partida fica com menos de 2 jogadores.
- Resultado visualmente simplificado, sem voltar no topo e sem resumo duplicado.
- Linguagem do fluxo atualizada para destacar o nickname de quem vai procurar.
- Validação manual assistida confirmou os fluxos principais funcionando.
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

- Próximo bloco grande, ainda não iniciado nesta pausa:
  - Permissão de localização.
  - Atualização de posição.
  - Radar/proximidade.
  - Captura automática.
  - Rush final.

Já concluído dentro desta fase:

- Rodada real sem GPS.
- Estados reais de jogadores.
- Timer real de rodada.
- Captura simulada em jogadores reais.
- Resultado e rematch.
- Regras de saída/encerramento da rodada.
- Fluxo visual validado manualmente no app web local.

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

## Atualizacao 2026-05-09 - Proximos Passos GPS/Radar

Base atual:

- Salas, realtime de lobby, rodada, resultado e rematch estao funcionando.
- GPS/radar tem primeira versao integrada ao Supabase.
- Mobile web com GPS real precisa de HTTPS/tunnel; `localhost` e IP local nao sao suficientes no celular.
- Desktop com dois browsers nao e teste confiavel de GPS real; serve para fluxo e ferramenta DEV.

Antes de seguir para a proxima camada grande:

- Limpar mensagens/debug visuais que ainda aparecem no jogo.
- Rodar QA pesado em sala, hide phase, seeker radar, captura, sair e jogar novamente.
- Testar com dois celulares reais via tunnel HTTPS ou build nativo.
- Calibrar movimento do radar para ficar divertido, mas legivel.
- Conferir se o GPS instavel nao domina a experiencia quando ha leitura valida recente.
- Documentar bugs restantes como conhecidos, sem misturar com features novas.

Decisao operacional:

- Continuar usando ferramenta DEV para aproximar/afastar distancia no radar.
- Usar celular real para permissao e sensor.
- Nao abrir nova grande camada ate estabilizar a pagina de jogo.

## Atualizacao 2026-05-09 - Resultado e Backend

Base atual:

- Fluxos `Resultado -> Jogar novamente -> Lobby` e `Resultado -> Sair -> Home` foram estabilizados no cliente.
- O app usa guard central de rota e snapshot terminal do resultado para evitar piscadas causadas por eventos realtime atrasados.
- `Sair -> Home -> Criar sala` foi validado apos uma rodada completa.
- A tela de Resultado ainda pode aguardar o `room.result` final chegar pelo Supabase Realtime antes de preencher vencedor/estatisticas.

Proxima atualizacao recomendada:

- Evoluir `pe_finish_round`, `pe_try_capture_nearest` e caminhos de timeout/tick para retornar o snapshot final completo da rodada no mesmo retorno da acao.
- Fazer a finalizacao ser idempotente: se a rodada ja estiver encerrada, a RPC retorna o mesmo resultado existente sem recalcular.
- Adicionar `gameSessionId` e `finishedAt` ao payload de `result`.
- Aplicar o snapshot final imediatamente no `room-store`; usar Realtime posterior apenas como confirmacao.
- Manter uma tela contextual de "apurando resultado" apenas como fallback de rede, sem popup modal.
