# 05 - Escopo do MVP

## Essencial

O MVP precisa provar que um grupo consegue criar uma partida presencial, jogar com localização temporária e se divertir usando radar/proximidade.

Funcionalidades essenciais:

- App em Expo/React Native.
- Tela inicial com criar sala e entrar por código/link.
- Criação de sala temporária.
- Limite rígido inicial de até 8 jogadores por sala, evitando lobbies grandes.
- Convite por link compartilhável.
- Entrada por código.
- Apelido simples.
- Escolha de avatar pré-pronto.
- Lobby com lista de jogadores.
- Status de jogadores: entrou, preparado, escondido, capturado.
- Criador da sala como procurador.
- Configuração básica de regras.
- Tempo total da partida configurável pelo criador.
- Tempo para esconder configurável pelo criador, com máximo inicial de 60 segundos.
- Duração padrão sugerida: 60 segundos para esconder e 3 minutos para procurar.
- Tipo de ambiente inicial ou configuração padrão.
- Início da partida pelo procurador.
- Fluxo dos escondidos para marcar "estou escondido".
- Liberação do procurador quando todos estiverem escondidos ou quando o tempo de esconder acabar.
- Solicitação de localização ao entrar na sala.
- Bloqueio de participação ativa para quem negar localização.
- Captura de localização somente durante a partida.
- Realtime para sala, status e eventos.
- Radar/proximidade para o procurador.
- Sem mapa exato dos escondidos.
- Sem compartilhamento social de GPS, mapa real, rota, endereço ou coordenadas.
- Captura automática por proximidade.
- Progressão de raio durante a partida.
- Rush final nos últimos segundos.
- Resultado da partida.
- Jogar novamente usando a mesma sala e o mesmo grupo, voltando para o lobby.
- Compartilhar card social de resultado da partida, sem GPS ou mapa real.
- Escolher manualmente o próximo procurador pelo lobby em nova rodada.
- Permitir retorno de jogador desconectado para a mesma sala.
- Passar liderança automaticamente para o próximo jogador disponível se o líder/procurador cair.
- Encerramento da sala/partida.
- Parar uso de localização ao finalizar.

## Desejável

Funcionalidades boas, mas que não podem atrasar a validação principal:

- Presets de ambiente completos: aberto, misto e menor.
- Sons e vibrações mais refinados.
- Animações de radar e captura.
- Tutorial rápido antes da primeira partida.
- Personalização visual simples da sala.
- Detecção de internet instável.
- Alerta de bateria baixa.
- Ajuste fino do raio de captura pelo criador.
- Histórico mínimo apenas da partida atual.
- Modo espectador para capturados.

## Fora do MVP

Itens que ficam explicitamente fora da primeira versão:

- Login completo com conta permanente.
- Perfil social.
- Upload de foto.
- Chat entre jogadores.
- Feed público.
- Ranking global.
- Loja de skins.
- Monetização.
- Grupos permanentes.
- Sistema de amigos.
- Mapa exato dos jogadores.
- Histórico permanente de localização.
- Replay de rotas.
- Compartilhamento de GPS, mapa real, rota, endereço ou coordenadas em redes sociais.
- Moderação social avançada.
- Partidas públicas abertas.
- Matchmaking.
- Sistema de níveis/XP.
- Modo competitivo oficial.
- Painel administrativo completo.
- Backend próprio com Socket.IO, salvo se Supabase não atender o teste inicial.

## Critérios de Aceite

O MVP está pronto quando um grupo consegue completar uma partida real de ponta a ponta:

1. Um jogador cria uma sala.
2. O app gera link/código de convite.
3. Outros jogadores entram com apelido e avatar.
4. O lobby mostra todos os participantes e seus status.
5. O criador, como procurador, configura regras básicas.
6. Todos marcam "preparado".
7. O procurador inicia a partida.
8. Escondidos recebem tempo para se esconder.
9. Escondidos marcam "estou escondido".
10. O procurador é liberado.
11. O radar indica proximidade sem mostrar mapa exato.
12. O sistema captura automaticamente quando o procurador chega perto.
13. O raio muda com o tempo e entra em rush final.
14. A partida termina corretamente por captura total ou fim do tempo.
15. O resultado mostra vencedor e participantes.
16. O grupo consegue iniciar nova rodada sem criar uma nova sala.
17. Ao jogar novamente, o grupo volta para o lobby.
18. O líder pode promover outro jogador como próximo procurador no lobby.
19. O app para de usar localização ao terminar.

Critérios técnicos mínimos:

- Funcionar em celular real.
- Pedir permissão de localização de forma clara.
- Manter localização ativa apenas durante a partida.
- Sincronizar estado da sala em tempo real.
- Tolerar pequenas oscilações de GPS sem capturas falsas constantes.
- Não exigir cadastro completo.

## Riscos de Escopo

- Tentar fazer rede social antes de validar o jogo.
- Colocar login, perfil e ranking cedo demais.
- Exigir mapa exato e reduzir a diversão.
- Investir muito em arte/animação antes de testar a mecânica.
- Configuração de regras ficar complexa demais.
- Web parecer validada, mas GPS/radar no celular não funcionar bem.
- Supabase Realtime não atender a latência necessária para captura em movimento.
- GPS impreciso em locais fechados gerar frustração.
- Bateria e internet prejudicarem partidas longas.
- O visual parecer infantil demais para consumidores adultos.
