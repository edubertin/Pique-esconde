# QA Test Cases

Casos de teste manuais para validar o MVP do Pique Esconde.

## Modelo de Caso de Teste

```md
## TC-000 - Nome do caso

Area:
Prioridade: Alta | Media | Baixa
Tipo: Fluxo | Funcional | Visual | Privacidade | Regressao
Ambiente:

Pre-condicoes:
- 

Passos:
1. 
2. 
3. 

Resultado esperado:
- 

Resultado obtido:
- 

Status: Nao executado | Passou | Falhou | Bloqueado
Evidencias:
- Screenshot/video/log:

Observacoes:
- 
```

## Casos Base do MVP

## TC-001 - Criar Sala

Area: Sala
Prioridade: Alta
Tipo: Fluxo

Pre-condicoes:
- App aberto na tela inicial.

Passos:
1. Tocar em "Criar sala".
2. Informar apelido.
3. Escolher avatar.
4. Confirmar criacao da sala.

Resultado esperado:
- Sala temporaria e criada.
- Usuario entra como lider/procurador inicial.
- Codigo ou link de convite fica disponivel.

Status: Nao executado

## TC-002 - Entrar com Codigo

Area: Sala
Prioridade: Alta
Tipo: Fluxo

Pre-condicoes:
- Existe uma sala ativa.

Passos:
1. Tocar em "Entrar com codigo".
2. Informar codigo valido.
3. Informar apelido.
4. Escolher avatar.
5. Confirmar entrada.

Resultado esperado:
- Jogador entra no lobby correto.
- Lista de jogadores e atualizada.
- Limite de jogadores continua visivel.

Status: Nao executado

## TC-003 - Lobby com Limite de Jogadores

Area: Lobby
Prioridade: Alta
Tipo: Funcional

Pre-condicoes:
- Sala ativa com jogadores entrando.

Passos:
1. Entrar com jogadores ate o limite permitido.
2. Verificar informacao de limite.
3. Tentar entrada acima do limite.

Resultado esperado:
- Sala aceita ate 8 jogadores.
- O app informa o limite ao usuario.
- A entrada acima do limite e bloqueada com mensagem clara.

Status: Nao executado

## TC-004 - Sair da Sala

Area: Lobby
Prioridade: Alta
Tipo: Funcional

Pre-condicoes:
- Jogador esta dentro de uma sala.

Passos:
1. Tocar em "Sair da sala".
2. Confirmar saida, se houver confirmacao.

Resultado esperado:
- Jogador sai da sala.
- Lobby dos demais jogadores atualiza.
- Se o lider sair, a lideranca passa para outro jogador disponivel.

Status: Nao executado

## TC-005 - Permissao de Localizacao Aceita

Area: Localizacao
Prioridade: Alta
Tipo: Privacidade

Pre-condicoes:
- Jogador esta entrando ou preparando partida.

Passos:
1. Avancar ate a tela de permissao.
2. Ler o texto de explicacao.
3. Aceitar permissao de localizacao.

Resultado esperado:
- App explica uso temporario da localizacao.
- Jogador consegue participar como ativo.
- O app nao promete funcionamento perfeito em ambiente fechado.

Status: Nao executado

## TC-006 - Permissao de Localizacao Negada

Area: Localizacao
Prioridade: Alta
Tipo: Privacidade

Pre-condicoes:
- Jogador esta entrando ou preparando partida.

Passos:
1. Avancar ate a permissao de localizacao.
2. Negar permissao.

Resultado esperado:
- Jogador nao participa como ativo.
- App explica que sem localizacao nao e possivel jogar a rodada.
- Nenhum dado de localizacao e coletado.

Status: Nao executado

## TC-007 - Fase de Esconder

Area: Jogo
Prioridade: Alta
Tipo: Funcional

Pre-condicoes:
- Sala tem pelo menos 2 jogadores.
- Lider iniciou partida.

Passos:
1. Verificar contador de esconder.
2. Jogadores escondidos tocam em "Estou escondido".
3. Aguardar todos marcarem ou o tempo acabar.

Resultado esperado:
- Botao acelera o jogo.
- Se todos marcarem escondido, procurador e liberado.
- Se o tempo acabar, procurador tambem e liberado.

Status: Nao executado

## TC-008 - Radar sem Mapa Exato

Area: Radar
Prioridade: Alta
Tipo: Privacidade

Pre-condicoes:
- Procurador esta na fase de busca.

Passos:
1. Abrir tela de radar.
2. Observar indicadores de proximidade.
3. Verificar se existe mapa, rota, endereco ou coordenada.

Resultado esperado:
- Radar mostra intensidade e direcao aproximada.
- Nao ha mapa exato dos escondidos.
- Nao ha coordenadas, rota ou endereco.

Status: Nao executado

## TC-009 - Captura Automatica

Area: Jogo
Prioridade: Alta
Tipo: Funcional

Pre-condicoes:
- Procurador esta proximo de um escondido.

Passos:
1. Aproximar o procurador do escondido.
2. Manter proximidade pelo tempo de confirmacao.
3. Observar mudanca de estado.

Resultado esperado:
- Captura acontece automaticamente.
- Estado do jogador muda para capturado.
- Demais telas recebem atualizacao.

Status: Nao executado

## TC-010 - Resultado e Jogar Novamente

Area: Resultado
Prioridade: Alta
Tipo: Fluxo

Pre-condicoes:
- Partida foi encerrada.

Passos:
1. Abrir resultado.
2. Verificar vencedor.
3. Tocar em "Jogar novamente".

Resultado esperado:
- Resultado mostra quem venceu.
- Se o procurador venceu, o avatar em destaque é o procurador.
- Se os escondidos venceram, o avatar em destaque é o escondido que ficou mais tempo sem ser capturado.
- Em vitória dos escondidos, a tela explica o destaque com texto curto, como `Ficou mais tempo escondido`.
- Jogador volta para o lobby da mesma sala.
- Sala continua reutilizavel.
- Lider pode promover o proximo procurador manualmente pelo lobby.
- Resultado possui acao para sair da sala.

Status: Nao executado

## TC-011 - Card Social sem GPS

Area: Social
Prioridade: Alta
Tipo: Privacidade

Pre-condicoes:
- Partida foi encerrada.

Passos:
1. Abrir card social.
2. Verificar conteudo visual e textual.
3. Compartilhar ou simular compartilhamento.

Resultado esperado:
- Card mostra logo e placar simples.
- Card nao mostra GPS, mapa, rota, endereco ou coordenadas.
- Card e entendivel fora do app.

Status: Nao executado

## TC-012 - Responsividade Mobile/Web

Area: UX
Prioridade: Media
Tipo: Visual

Pre-condicoes:
- App rodando em web ou Expo.

Passos:
1. Abrir telas principais em viewport pequena.
2. Abrir telas principais em viewport media.
3. Verificar botoes, texto, imagem e background.

Resultado esperado:
- Background cobre toda a tela.
- Conteudo principal fica legivel.
- Nao ha sobreposicao incoerente.
- Botoes continuam tocaveis.

Status: Nao executado
