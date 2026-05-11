# Roadmap - Piloto e Beta Controlado

Documento de produto e execucao para levar o Pique Esconde de MVP tecnico para piloto fechado e beta controlado.

Responsavel principal: Product Owner.

Validadores:

- Product Manager: valida direcao estrategica, prioridade e metricas.
- QA Engineer: valida criterios de aceite, gates e evidencias.
- System Architect: valida riscos tecnicos, Supabase, GPS, realtime e privacidade.

## Objetivo Estrategico

Levar o Pique Esconde de "funciona tecnicamente" para "e jogavel, confiavel e divertido em celular real".

North Star provisoria:

- Grupos conseguem jogar uma partida presencial completa sem ajuda externa e querem jogar novamente.

## Principios

- Nao abrir features grandes antes de validar campo real.
- Android e o canal principal ate o beta controlado.
- GPS e mecanica temporaria de jogo, nao monitoramento.
- Metricas e logs nao podem guardar coordenadas, rotas, endereco ou identidade real.
- Qualquer card, convite ou compartilhamento deve evitar GPS, mapa, rota, endereco e coordenadas.
- O app nao deve depender de explicacao tecnica para uma partida presencial simples.

Plano operacional enquanto o teste de campo nao retorna:

- [Plano de execucao paralela da Fase 0](roadmap-execucao-paralela.md)

## Gates de Fase

| Fase | Objetivo | Gate de saida |
| --- | --- | --- |
| Fase 0 - Congelar MVP tecnico para campo | Provar que a base atual roda em celular real | 5 partidas completas em 2 celulares reais, no maximo 1 falha critica reproduzivel aberta, card/convite sem vazamento de localizacao |
| Fase 1 - Piloto fechado | Validar diversao e compreensao com grupo presencial | 80% dos grupos completam rodada sem intervencao, 60% jogam segunda rodada, menos de 10% das capturas sao percebidas como injustas, 0 vazamento de localizacao |
| Fase 2 - Iteracao pos-piloto | Corrigir aprendizados e fechar parametros de beta | P0 zerados, 10+ partidas reais, conclusao acima de 75%, 3 grupos testados, decisao documentada de raio/tempo/ambiente |
| Fase 3 - Beta Android controlado | Validar repetibilidade com usuarios menos assistidos | 20 a 50 usuarios, Android estavel, 70% das salas com 2+ jogadores iniciam partida, 70% chegam ao resultado, 40% jogam novamente, nenhum incidente de privacidade |

## Fase 0 - Congelar MVP Tecnico Para Campo

Objetivo: parar de abrir grandes features e transformar a base atual em uma versao testavel em celulares reais.

Prioridade P0:

- Executar QA com 2 celulares reais via APK Android ou HTTPS estavel.
- Validar loop completo: criar sala, entrar, preparar, esconder, procurar, capturar, resultado e jogar novamente.
- Validar GPS real, permissao, radar, captura 5m/2s e perda de sinal.
- Confirmar Supabase Cron/tick ativo no ambiente usado para teste.
- Registrar bugs com severidade clara: bloqueador, alto, medio ou aceito.

Prioridade P1:

- Revisar microcopy de localizacao e seguranca fisica.
- Validar convite por link, codigo, QR e share em celular real.
- Verificar que card social nao expoe GPS, mapa, rota, endereco ou coordenadas.

Prioridade P2:

- Ajustar pequenos pontos visuais no HUD do radar e tela do escondido.
- Polir mensagens de erro e estados de sincronizacao.

Metricas de saida:

- 5 partidas completas em celulares reais.
- No maximo 1 falha critica reproduzivel aberta.
- Nenhum vazamento de localizacao em UI, card ou compartilhamento.

## Fase 1 - Piloto Fechado

Objetivo: validar se a mecanica e compreendida e divertida em um grupo presencial real.

Escopo:

- 4 a 6 pessoas.
- Ambiente aberto ou misto.
- Observacao presencial.
- Sem anuncio publico.

Prioridade P0:

- Radar orienta sem entregar posicao exata.
- Captura automatica nao parece injusta.
- Jogadores entendem por que o app pede localizacao.
- Resultado e "Jogar novamente" funcionam sem recriar sala.
- Saida, queda ou refresh nao deixam jogador preso.

Prioridade P1:

- Calibrar faixas frio, morno e quente por ambiente.
- Ajustar ruido e suavizacao da direcao.
- Melhorar feedback do escondido: calmo, perto e perigo.
- Implementar ou validar haptics/som minimos para aproximacao, captura e resultado.

Prioridade P2:

- Melhorar card social visual.
- Refinar avatares e animacoes.
- Ajustar rush final para ficar mais emocionante.

Metricas de sucesso:

- 80%+ dos grupos completam uma rodada sem intervencao.
- 60%+ iniciam uma segunda rodada espontaneamente.
- Menos de 10% das capturas sao percebidas como injustas.
- 0 vazamento de localizacao.
- Tempo ate primeira partida iniciada abaixo de 3 minutos.

## Fase 2 - Iteracao Pos-Piloto

Objetivo: transformar aprendizados de campo em versao pronta para beta controlado.

Prioridade P0:

- Corrigir bloqueadores de GPS, lobby/realtime, captura e sessao.
- Fechar parametros iniciais por ambiente: pequeno, medio e grande.
- Definir politica final de retencao para GPS e eventos.
- Instrumentar metricas minimas de produto sem coletar localizacao sensivel permanente.

Prioridade P1:

- Melhorar convite nativo para reduzir explicacao manual.
- Melhorar onboarding contextual curto, sem tutorial pesado.
- Criar checklist operacional de sessao de teste: local, numero de jogadores, aparelho, rede e resultado.

Prioridade P2:

- Ajustar tom visual se o publico adulto perceber o app como infantil demais.
- Melhorar som, haptics e animacao de forma incremental.

Metricas de saida:

- Bugs P0 zerados.
- 10+ partidas reais registradas.
- Taxa de conclusao de partida acima de 75%.
- Pelo menos 3 grupos diferentes testados.
- Decisao documentada sobre raio, tempo de confirmacao e ambientes recomendados.

## Fase 3 - Beta Android Controlado

Objetivo: validar repetibilidade com grupos menos assistidos.

Escopo:

- 20 a 50 usuarios.
- Convites controlados.
- Android primeiro.

Prioridade P0:

- Distribuicao estavel de APK ou canal equivalente.
- Fluxo de convite funcionando sem suporte manual.
- Monitoramento basico de erros, cron, lobby, resultado e eventos criticos.
- Suporte e canal de seguranca claros.
- Termos, privacidade, idade minima e uso em local seguro revisados.

Prioridade P1:

- Testar grupos em diferentes ambientes: parque, condominio, campus e clube.
- Medir funil: sala criada, jogadores entram, partida inicia, partida termina e rematch.
- Coletar feedback qualitativo pos-partida: clareza, justica, diversao e seguranca.

Prioridade P2:

- Deixar card social mais compartilhavel.
- Refinar presets.
- Avaliar modo espectador para capturados apenas se capturados ficarem ociosos demais.

Metricas de sucesso:

- 70%+ das salas com 2+ jogadores iniciam partida.
- 70%+ das partidas iniciadas chegam ao resultado.
- 40%+ das salas jogam novamente.
- Maioria clara responde que jogaria de novo.
- Nenhum incidente de privacidade ou localizacao.
- Nenhum bug recorrente exige intervencao manual para continuar jogando.

## Epicos

| Epico | Resultado esperado |
| --- | --- |
| E1 - QA de Campo e Congelamento | Provar que o jogo completa rodadas reais em celular sem suporte externo |
| E2 - GPS, Radar e Captura Justa | Fazer radar orientar sem mapa exato e captura parecer justa |
| E3 - Lobby, Convite e Rematch | Reduzir atrito de entrada e garantir que queda/refresh nao prenda jogador |
| E4 - Privacidade, Seguranca e Legal | Manter localizacao temporaria, sem vazamento e com termos adequados |
| E5 - Metricas e Observabilidade | Medir funil e falhas sem dados sensiveis |
| E6 - Piloto e Iteracao | Aprender com grupos reais e fechar parametros de jogo |
| E7 - Beta Android Controlado | Distribuir com estabilidade, suporte e monitoramento |

## Backlog Priorizado

| ID | Historia | Prioridade | Criterio de aceite principal | Dependencias |
| --- | --- | --- | --- | --- |
| E1-H1 | Como PO/QA, quero um roteiro de campo com 2 celulares reais para validar o loop completo. | Must/F0 | Given 2 celulares e build valido, when o roteiro e executado, then criar sala, entrar, esconder, buscar, capturar, resultado e rematch tem evidencia registrada. | APK/PWA HTTPS, checklist QA |
| E1-H2 | Como time, quero classificar bugs por severidade para decidir avanco de fase. | Must/F0 | Given uma falha encontrada, when registrada, then ela tem severidade, reproducao, impacto, evidencia e decisao: corrigir, aceitar ou bloquear. | Known issues, test run |
| E2-H1 | Como jogador, quero radar legivel em ambiente real para procurar sem ver posicao exata. | Must/F0 | Given procurador em busca, when escondido muda de distancia, then radar muda frio/morno/quente e direcao aproximada sem latitude, longitude, mapa ou rota. | GPS real, backend radar |
| E2-H2 | Como jogador, quero captura 5m/2s validada em campo para nao parecer injusta. | Must/F0 | Given procurador fica dentro do raio pelo tempo necessario, when o backend confirma captura, then ambos os celulares veem estado capturado e resultado consistente. | GPS real, RPC captura |
| E2-H3 | Como jogador, quero tratamento claro de perda de sinal para entender quando sai da rodada. | Must/F0 | Given jogador fica sem GPS, when passa 15s e depois 30s, then recebe aviso de instabilidade e remocao com mensagem especifica. | Cron/tick, location sync |
| E3-H1 | Como convidado, quero entrar por link, codigo ou QR no celular sem explicacao manual. | Should/F0 | Given sala criada, when recebo convite/link/QR/share, then consigo chegar a sala correta com o codigo preenchido ou copiavel. | Base URL, QR, share nativo |
| E3-H2 | Como jogador, quero refresh/queda sem duplicar ou perder minha sala. | Must/F0 | Given estou no lobby ou partida, when fecho/reabro ou atualizo, then volto ao estado correto ou recebo saida clara sem duplicar jogador. | Storage sessao, snapshot |
| E3-H3 | Como grupo, quero jogar novamente sem recriar sala. | Must/F0 | Given resultado final, when toco "Jogar novamente", then todos voltam ao lobby da mesma sala e podem trocar procurador/regras. | Snapshot final, rematch |
| E4-H1 | Como responsavel pelo produto, quero microcopy de seguranca antes do campo. | Should/F0 | Given usuario entra no fluxo de localizacao/convite, when le a tela, then entende uso temporario, local seguro e que GPS nao e navegacao precisa. | Textos PT-BR |
| E4-H2 | Como usuario, quero card social sem localizacao. | Must/F0 | Given resultado aberto, when gero/compartilho card, then nao ha GPS, mapa, rota, endereco, coordenadas ou local real. | Social card, share |
| E5-H1 | Como operacao, quero confirmar Supabase Cron/tick no ambiente de teste. | Must/F0 | Given partida sem cliente ativo, when timer vence, then cron/tick muda fase ou encerra rodada e nao expoe lat/lng. | Supabase Cron aplicado |
| E6-H1 | Como PO, quero piloto fechado com 4-6 pessoas para medir diversao real. | Must/F1 | Given grupo em ambiente aberto/misto, when joga sem ajuda externa, then completude, rematch, tempo ate primeira partida e capturas injustas sao medidos. | Fase 0 aprovada |
| E6-H2 | Como time, quero capturar percepcao de justica do radar/captura. | Must/F1 | Given cada captura, when a rodada termina, then jogadores classificam como justa/injusta e motivo e registrado sem localizacao sensivel. | Formulario leve |
| E6-H3 | Como grupo, quero saida, queda e refresh sem travar a partida. | Must/F1 | Given jogador sai ou cai, when a rodada continua ou volta ao lobby, then ninguem fica preso em tela invalida. | Regras saida/reconexao |
| E6-H4 | Como PO, quero decidir parametros por ambiente apos piloto. | Must/F2 | Given dados de 10+ partidas, when revisados, then raio, tempo, presets e tolerancia de sinal tem decisao documentada. | Metricas e feedback |
| E5-H2 | Como produto, quero metricas agregadas sem localizacao sensivel. | Must/F2 | Given sala/rodada/rematch, when evento e registrado, then mede funil sem coordenadas, rota, endereco, nome real ou identificador permanente. | Modelo eventos |
| E4-H3 | Como responsavel legal/produto, quero politica final de retencao. | Must/F2 | Given partida finalizada, when janela de retencao expira, then localizacao bruta e apagada e eventos restantes sao agregados/temporarios. | Cleanup, docs legais |
| E3-H4 | Como novo jogador, quero onboarding curto antes da primeira partida. | Should/F2 | Given primeira entrada, when vejo onboarding, then entendo objetivo, permissao, radar aproximado e seguranca em menos de 60s. | Microcopy, UI |
| E7-H1 | Como beta tester Android, quero instalar build estavel sem suporte manual. | Must/F3 | Given convite beta, when instalo o app, then consigo abrir, entrar em sala e jogar sem comandos tecnicos. | Distribuicao Android |
| E7-H2 | Como operacao, quero monitorar erros de lobby, cron, radar e resultado. | Must/F3 | Given beta ativo, when ocorre falha, then erro aparece em monitoramento com contexto tecnico sem localizacao bruta. | Observabilidade |
| E7-H3 | Como produto, quero termos, privacidade, idade e suporte prontos para beta. | Must/F3 | Given usuario beta, when acessa paginas legais/suporte, then encontra regras de uso, menores, localizacao, exclusao e contato. | Revisao legal |
| E7-H4 | Como PO, quero decisao go/no-go do beta. | Must/F3 | Given metricas do beta, when revisadas, then decisao e tomada: ampliar, iterar ou pausar, com criterios objetivos. | Metricas beta |

## Sequencia de Implementacao

1. Preparar build/ambiente e roteiro de Fase 0.
2. Rodar 5 partidas reais com 2 celulares, cobrindo GPS, radar, captura, perda de sinal, convite, QR, share, resultado e rematch.
3. Corrigir apenas P0/P1 que bloqueiem campo; nao abrir features fora deste roadmap.
4. Validar Supabase Cron/tick no ambiente usado para piloto.
5. Executar piloto fechado com 4-6 pessoas em ambiente aberto/misto.
6. Consolidar metricas e feedback; ajustar radar/captura/reconexao/convite.
7. Fechar retencao, metricas agregadas, onboarding curto e checklist operacional.
8. Preparar beta Android com distribuicao, monitoramento, suporte e paginas legais.
9. Rodar beta com 20-50 usuarios e decidir go/no-go.

## Definition of Ready

Uma historia esta pronta para desenvolvimento ou teste quando:

- Esta no formato "Como [usuario], quero [funcionalidade], para [valor]".
- Tem fase, prioridade MoSCoW, metrica de sucesso e gate associado.
- Tem criterios Given/When/Then testaveis.
- Define ambiente alvo: web HTTPS, APK Android, Expo Go ou producao.
- Define evidencia esperada: test run, screenshot, video, logs ou metrica.
- Lista dependencias de backend, build, Supabase, dispositivo ou decisao de produto.
- Confirma que nao exige login completo, perfil, ranking, chat, mapa exato ou outro item fora de escopo.

## Definition of Done

Uma historia esta pronta quando:

- Codigo completo e testado, quando houver codigo.
- Criterios de aceite atendidos em ambiente definido.
- Documentacao/test run atualizado.
- Bugs encontrados classificados por severidade.
- Nenhum fluxo expoe GPS, mapa, rota, endereco ou coordenadas.
- Lint, TypeScript e smoke aplicaveis executados.
- Validacao em celular real feita para historias de GPS, convite, share ou build nativo.
- Code review concluido.
- Product Owner aceita com base no gate da fase.

## Fora de Escopo Agora

- Login completo, perfil permanente, amigos, feed, chat e ranking global.
- Monetizacao, loja de skins, XP e competitivo oficial.
- Mapa exato, historico de rotas, replay, endereco ou coordenadas.
- Matchmaking publico.
- Backend proprio com Socket.IO, salvo se Supabase falhar em latencia ou confiabilidade no beta.
- Publicacao ampla em loja antes de validar campo.
