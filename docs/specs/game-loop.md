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
9. Escondidos podem marcar "estou escondido" para acelerar o início da busca.
10. Procurador é liberado quando todos estiverem escondidos ou quando o tempo de esconder acabar.
11. Procurador busca usando radar/proximidade.
12. Captura acontece automaticamente por proximidade.
13. Rush final aumenta o alcance do radar.
14. Partida termina quando todos são capturados ou o tempo acaba.
15. Resultado mostra vencedores.
16. Grupo pode jogar novamente na mesma sala.

## Vitória

- Procurador vence se capturar todos antes do fim do tempo.
- Escondidos vencem se ao menos um jogador não for capturado até o fim.

## Decisões CEO Pendentes

- Nenhuma decisão pendente no momento.
