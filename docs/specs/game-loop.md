# Spec - Game Loop

## Objetivo

Definir o fluxo jogável principal do Pique Esconde no MVP.

## Regras Base

- O jogo depende de grupo presencial.
- Número mínimo: 2 jogadores.
- Número ideal: 4 jogadores.
- Limite rígido inicial: até 8 jogadores por sala.
- Quem cria a sala é o primeiro procurador.
- Em novas rodadas, o líder/procurador escolhe manualmente quem será o próximo procurador.
- A escolha manual do próximo procurador acontece no lobby, promovendo um jogador da lista.
- Duração padrão: 60 segundos para esconder e 3 minutos para procurar.
- O criador pode configurar a duração da partida.
- O tempo para esconder pode ser configurado, com máximo inicial de 60 segundos.

## Fluxo

1. Criador cria sala.
2. Criador compartilha link/código.
3. Jogadores entram com apelido e avatar.
4. App solicita localização para participação ativa.
5. Jogadores marcam "preparado".
6. Criador configura regras.
7. Criador inicia partida.
8. Escondidos têm tempo para se esconder.
9. Escondidos devem marcar "estou escondido" para continuar ativos na rodada.
10. Se todos os escondidos confirmarem antes do tempo, o procurador é liberado.
11. Se o tempo de esconder acabar, quem ainda estiver sem confirmar sai da rodada e volta para a tela inicial com aviso.
12. Depois das remoções por timeout, o procurador é liberado se ainda houver pelo menos 2 jogadores.
13. Se as remoções por timeout deixarem menos de 2 jogadores, a sala volta para o lobby com aviso de jogadores insuficientes.
14. Procurador busca usando radar/proximidade.
15. Captura acontece automaticamente por proximidade.
16. Rush final aumenta o alcance do radar.
17. Partida termina quando todos são capturados ou o tempo acaba.
18. Resultado mostra vencedores.
19. Grupo pode jogar novamente na mesma sala.
20. Ao jogar novamente, todos voltam para o lobby.
21. No lobby, o líder pode manter ou promover outro jogador como próximo procurador.

## Jogar Novamente

- O botão "Jogar novamente" leva para o lobby da mesma sala.
- A sala não é recriada.
- O grupo pode ajustar regras antes da próxima rodada.
- O próximo procurador é definido no lobby.
- Não há botão "trocar procurador" na tela de resultado.

## Saída Durante a Rodada

- Jogador escondido pode sair durante a rodada.
- Se a saída de um escondido ainda deixar pelo menos 2 jogadores na sala, a rodada continua.
- Se o procurador sair, a rodada volta para o lobby, outro jogador assume a liderança e a sala exibe aviso de rodada interrompida.
- Se qualquer saída deixar menos de 2 jogadores, a rodada volta para o lobby com aviso de jogadores insuficientes.
- O jogador que saiu volta para a tela inicial com mensagem local.

## Vitória

- Procurador vence se capturar todos antes do fim do tempo.
- Escondidos vencem se ao menos um jogador não for capturado até o fim.

## Decisões CEO Pendentes

- Nenhuma decisão pendente no momento.

## Atualização - Destaque do Resultado

- A tela de resultado sempre mostra um jogador em destaque com seu avatar.
- Se o procurador vencer, o destaque é o procurador.
- Se os escondidos vencerem, o destaque é o escondido que ficou mais tempo sem ser capturado.
- Quando houver mais de um escondido sobrevivente, o destaque representa o melhor desempenho individual dos escondidos, não o único vencedor.
- O texto da tela deve explicar a referência. Exemplo: `Ficou mais tempo escondido`.
- O resumo ainda deve deixar claro que a vitória foi dos escondidos como grupo quando houver sobreviventes.
