# Regression Checklist

Checklist obrigatorio antes de considerar uma mudanca pronta.

## Uso

Preencha este checklist em cada feature, ajuste visual ou mudanca de regra.

```md
Commit/branch:
Responsavel:
Data:
Ambiente:

Resultado geral: Passou | Falhou | Parcial | Bloqueado
Observacoes:
```

## Checklist Geral

- [ ] App abre sem erro.
- [ ] Tela inicial exibe logo, botoes principais e especificacoes essenciais.
- [ ] Criar sala continua acessivel.
- [ ] Entrar com codigo continua acessivel.
- [ ] Navegacao entre telas principais funciona.
- [ ] Botao de voltar funciona onde existe.
- [ ] Textos principais continuam em portugues.
- [ ] Nao ha texto quebrado ou sobreposto em tela pequena.
- [ ] Background cobre a tela sem distorcer a experiencia.

## Sala e Lobby

- [ ] Usuario consegue criar sala com apelido.
- [ ] Usuario consegue escolher avatar.
- [ ] Sala mostra limite de 2 a 8 jogadores.
- [ ] Jogador consegue entrar com codigo.
- [ ] Jogador consegue sair da sala.
- [ ] Lobby mostra jogadores e status.
- [ ] Estado "preparado" aparece corretamente.
- [ ] Criador aparece como lider/quem vai procurar inicialmente.
- [ ] Mudanca de lider/quem vai procurar nao quebra a sala.
- [ ] Reconexao ou volta para sala nao cria jogador duplicado.

## Regras e Fluxo da Partida

- [ ] Lider consegue iniciar partida quando regra minima e atendida.
- [ ] App bloqueia partida sem jogadores suficientes.
- [ ] Tempo de esconder aparece corretamente.
- [ ] Botao "estou escondido" atualiza estado.
- [ ] Quem vai procurar e liberado quando todos escondem.
- [ ] Quem vai procurar e liberado quando o tempo acaba.
- [ ] Tempo de busca aparece corretamente.
- [ ] Rush final fica perceptivel.
- [ ] Partida encerra quando todos sao capturados.
- [ ] Partida encerra quando o tempo acaba.
- [ ] Jogar novamente reaproveita a sala.
- [ ] Jogar novamente volta para o lobby.
- [ ] Resultado possui acao de sair da sala.
- [ ] Troca de quem vai procurar nao aparece no resultado.
- [ ] Lider pode promover outro jogador pelo lobby.

## Localizacao e Privacidade

- [ ] Tela explica por que a localizacao e necessaria.
- [ ] Quem aceita localizacao consegue participar.
- [ ] Quem nega localizacao nao participa como ativo.
- [ ] Nenhuma tela mostra coordenadas reais.
- [ ] Nenhuma tela mostra endereco real.
- [ ] Nenhuma tela mostra mapa exato dos escondidos.
- [ ] Card social nao mostra GPS, mapa, rota, endereco ou coordenadas.
- [ ] Textos deixam claro que localizacao e temporaria durante a partida.

## Radar e Captura

- [ ] Radar comunica proximidade.
- [ ] Radar usa direcao aproximada, nao posicao exata.
- [ ] Quem vai procurar recebe feedback de aproximacao.
- [ ] Escondido nao ve localizacao do procurador.
- [ ] Captura automatica muda estado para capturado.
- [ ] Captura nao exige botao manual no MVP.
- [ ] Captura respeita tempo ou leituras de confirmacao.
- [ ] Resultado atualiza apos captura.

## Visual e UX

- [ ] Botoes principais tem area tocavel confortavel.
- [ ] Botoes principais mantem hierarquia visual.
- [ ] Avatares sao distinguiveis.
- [ ] Cards e paineis nao ficam apertados em celular pequeno.
- [ ] Cores mantem contraste suficiente.
- [ ] Conteudo essencial aparece sem rolagem excessiva.
- [ ] Fluxo pode ser entendido sem tutorial longo.

## Agentes de IA

- [ ] O agente citou arquivos ou telas avaliadas.
- [ ] O agente informou ambiente e commit, quando aplicavel.
- [ ] O agente separou bug, risco e decisao pendente.
- [ ] O agente nao marcou como aprovado algo que nao executou.
- [ ] Falhas foram registradas em `known-issues.md` ou em um test run.
