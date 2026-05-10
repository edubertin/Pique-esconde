# 09 - Relatorio Geral e Futuras Implementacoes

Atualizado em: 2026-05-10

## Resumo Executivo

O Pique Esconde chegou a uma base jogavel de MVP tecnico. O fluxo principal esta funcionando: criar sala, entrar no lobby, preparar jogadores, iniciar rodada, esconder, procurar pelo radar, capturar, ver resultado, jogar novamente e sair.

A arquitetura atual usa Expo/React Native no app e Supabase para sala, realtime, regras de rodada, GPS temporario e captura. O foco agora deixa de ser "fazer o jogo existir" e passa a ser "fazer o jogo ficar confiavel e divertido em celular real".

## Estado Atual

Implementado:

- Sala temporaria com codigo.
- Lobby realtime com jogadores, lider/procurador, pronto, remocao e promocao.
- Rodada real com fase de esconder e fase de procurar.
- Timers de esconder/procurar.
- GPS temporario durante a partida.
- Confirmacao de esconderijo com leitura recente.
- Radar de proximidade com direcao aproximada, distancia aproximada, confianca e status de sinal.
- Captura por proximidade com regra oficial de 5m por 2s.
- Resultado final congelado com snapshot retornado pelo backend.
- Rematch na mesma sala.
- Saida de jogadores durante lobby/partida.
- Sala finalizada disponivel por 2 minutos para compartilhar ou jogar novamente.
- Limpeza oportunistica de salas expiradas e dados temporarios.
- Ferramenta DEV de GPS/radar para calibracao sem depender de deslocamento fisico.

Validado ate aqui:

- Fluxos principais em web/local.
- Smoke tecnico no Supabase dev.
- Resultado sem depender do Realtime para renderizar instantaneamente.
- Radar DEV funcionando apos jogar uma rodada e iniciar outra.

## Principais Riscos Restantes

GPS em campo:

- O radar pode variar muito conforme aparelho, ambiente, precisao e permissao.
- A calibracao feita em desktop/DEV ajuda a testar regra, mas nao substitui teste fisico.

Captura automatica:

- A regra 5m/2s reduz falso positivo, mas precisa de validacao com pessoas andando.
- Lugares fechados podem gerar salto de coordenada.

Dependencia de cliente ativo:

- A rotina server-side `pe_run_maintenance_tick` ja existe e foi validada manualmente no Supabase dev.
- Ainda falta configurar o agendamento automatico, como Supabase Cron, e monitorar execucoes.

Entrada na sala:

- O codigo manual funciona, mas convite/deep link ainda e uma friccao importante.

Experiencia sensorial:

- Radar, som e haptics precisam ficar divertidos, nao apenas corretos.

## Proximas Implementacoes Recomendadas

### 1. QA em Celular Real

Objetivo: descobrir problemas que so aparecem com GPS real, permissao, sensores e rede movel.

Escopo:

- Testar com dois celulares reais.
- Usar HTTPS tunnel ou build nativo.
- Rodar fluxo completo pelo menos 5 vezes.
- Testar ambiente aberto, misto e um local com sinal ruim.
- Registrar falso positivo/falso negativo de captura.

Saida esperada:

- Lista de ajustes de radar/captura.
- Decisao sobre raio, tempo de confirmacao e tolerancia de sinal.

### 2. Calibracao do Radar e Captura

Objetivo: transformar a base funcional em uma experiencia gostosa de jogar.

Escopo:

- Ajustar faixas frio/morno/quente.
- Ajustar ruido e suavizacao da seta.
- Melhorar estado "sem sinal" para nao assustar o jogador quando ha leitura recente.
- Revisar tela do escondido com alertas simples de risco.
- Validar captura 5m/2s em movimento.

Saida esperada:

- Parametros iniciais aprovados para piloto.
- Test run documentado com distancia real aproximada.

### 3. Convite e Compartilhamento

Objetivo: reduzir atrito para trazer amigos para a sala.

Escopo:

- Botao de convite com share nativo.
- Texto curto com codigo da sala.
- Deep link quando a base nativa estiver pronta.
- Card social final sem GPS, mapa, endereco ou coordenada.

Saida esperada:

- Jogador consegue chamar outro sem explicar manualmente o codigo.

### 4. Feedback de Jogo

Objetivo: deixar a partida mais clara e divertida.

Escopo:

- Haptics no radar e captura.
- Sons curtos para aproximacao, captura e resultado.
- Rush final mais perceptivel.
- Microcopy de permissao/localizacao revisada.
- Polimento visual do HUD do radar.

Saida esperada:

- Partida mais expressiva e menos dependente de texto.

### 5. Robustez de Backend

Objetivo: preparar o sistema para piloto e futura producao.

Escopo:

- Configurar Supabase Cron para chamar `pe_run_maintenance_tick`.
- Monitorar execucoes da rotina server-side de timers e limpeza.
- Regras de retencao de GPS temporario.
- Logs de eventos importantes de rodada.
- Monitoramento basico de erro.

Saida esperada:

- Menos dependencia de cliente ativo.
- Banco mais limpo.
- Debug mais simples quando algo falhar em campo.

### 6. Build Nativo e Piloto

Objetivo: validar o MVP como jogo real.

Escopo:

- Gerar build nativo de teste.
- Testar permissao de localizacao em iOS/Android.
- Rodar piloto com 4 a 6 pessoas.
- Observar se o grupo entende o jogo sem ajuda.
- Medir se querem jogar novamente.

Saida esperada:

- Decisao clara: ajustar MVP, preparar beta fechado ou rever regra central.

## Ordem Sugerida

1. QA real em dois celulares.
2. Calibracao de radar/captura.
3. Convite/share nativo.
4. Feedback sonoro/haptics.
5. Agendamento e monitoramento do tick/limpeza server-side.
6. Build nativo.
7. Piloto com 4 a 6 pessoas.

## Criterios Para Dizer Que Esta Pronto Para Piloto

- Uma sala com 4 pessoas joga do inicio ao fim.
- Resultado aparece imediatamente para todos.
- Jogar novamente funciona sem criar nova sala.
- O radar ajuda sem mostrar posicao exata.
- A captura nao dispara cedo demais com frequencia.
- GPS temporario para ao sair/finalizar.
- Card/compartilhamento nao vaza localizacao.
- Bugs conhecidos estao documentados com decisao clara.
