# ADR 005 - GPS temporario durante a partida ativa

## Status

Aceito. Substitui a decisao anterior deste arquivo, que dizia que GPS ficaria ativo somente na fase de busca.

## Contexto

O jogo requer localizacao dos jogadores para calcular proximidade, salvar o ponto de esconderijo e validar captura. Manter o GPS ativo no lobby, resultado ou fora da sala coleta mais dados do que o necessario e aumenta consumo de bateria.

A implementacao atual usa GPS em duas fases da rodada:

- `hiding`: para confirmar que o escondido tem leitura recente e salvar o ponto de esconderijo.
- `seeking`: para atualizar sinais temporarios, radar derivado, perigo para escondidos e captura.

## Decisao

O GPS fica ativo apenas durante uma partida ativa, nas fases `hiding` e `seeking`. O app deve parar a sincronizacao de localizacao no lobby, resultado, telas legais, home e apos saida da sala.

O procurador nunca recebe mapa exato, rota, endereco ou coordenadas dos escondidos. O backend usa a localizacao bruta apenas para gerar sinais derivados e validar captura.

## Consequencias

+ A decisao fica alinhada com o fluxo real de esconderijo com GPS recente.
+ A coleta continua limitada a partida ativa.
+ O radar e a captura usam dados temporarios sem expor coordenadas na interface.
+ O teste de campo deve validar permissao, sinal, bateria e perda de GPS nas duas fases.
- A politica de retencao precisa apagar localizacao bruta rapidamente apos a rodada.
- O app precisa comunicar que GPS e usado durante a partida, nao somente durante a busca.
