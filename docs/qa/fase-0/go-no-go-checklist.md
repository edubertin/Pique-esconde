# Checklist Go/No-Go - Fase 0

Use este checklist antes de aprovar avanco para piloto com 4-6 pessoas.

## Dados da Decisao

Data:
Responsavel:
Build/versao:
Commit:
Ambiente:
Resumo dos test-runs avaliados:

## Go Tecnico

- [ ] App abre sem erro critico.
- [ ] Criar sala funciona.
- [ ] Entrar na sala funciona.
- [ ] Lobby sincroniza os 2 jogadores.
- [ ] Refresh/reabertura nao duplica jogador.
- [ ] Permissao de GPS e compreendida.
- [ ] Partida inicia corretamente.
- [ ] Fase de esconder funciona.
- [ ] Radar funciona sem mapa exato.
- [ ] Captura atualiza os dois aparelhos.
- [ ] Resultado aparece corretamente.
- [ ] Jogar novamente retorna ao lobby da mesma sala.
- [ ] Sair da sala nao prende jogador.
- [ ] Card social nao expoe localizacao.
- [ ] Cron/tick foi confirmado no ambiente alvo.
- [ ] Rotas legais publicas abrem em HTTPS.

## Privacidade

- [ ] Nenhuma UI mostra lat/lng de jogadores.
- [ ] Nenhum snapshot usado pelo cliente retorna lat/lng, rota ou endereco.
- [ ] Nenhum card/compartilhamento mostra GPS, mapa, rota, endereco ou coordenadas.
- [ ] Nenhum log/evidencia contem token, secret, chave ou credencial.
- [ ] RPCs DEV/debug nao ficam disponiveis em piloto/prod.
- [ ] Manutencao server-side critica nao fica exposta para `anon`.

## Bugs Abertos

| Severidade | Quantidade | Pode avancar? |
| --- | --- | --- |
| S0 |  | Nao |
| S1 |  | Nao |
| S2 |  | Apenas com workaround aceito |
| S3 |  | Sim |
| S4 |  | Sim |

## Criterios de Go

Go somente se:

- [ ] Nenhum S0 aberto.
- [ ] Nenhum S1 aberto.
- [ ] S2 abertos tem workaround aceito.
- [ ] Pelo menos 1 rodada completa foi concluida em teste de campo 2P.
- [ ] Nao houve vazamento de localizacao.
- [ ] Resultado e rematch funcionaram.
- [ ] QA e Product Owner aceitaram a decisao.

## Criterios de No-Go

No-Go se qualquer item abaixo for verdadeiro:

- [ ] Bug impede completar partida.
- [ ] Jogador fica preso sem saida clara.
- [ ] GPS, mapa, rota, endereco ou coordenadas aparecem indevidamente.
- [ ] RPC DEV/debug ou manutencao critica esta exposta em ambiente de piloto/prod.
- [ ] Cron/tick falha e deixa sala/partida presa.
- [ ] Resultado/rematch quebra sala.

## Decisao

Decisao: Go | Go com restricoes | No-Go | Bloqueado aguardando campo

Restricoes, se houver:

-

Responsaveis:

- Product Owner:
- QA Engineer:
- System Architect:
- Product Manager:

