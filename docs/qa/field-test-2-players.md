# Roteiro de Teste de Campo - 2 Jogadores

Responsavel principal: QA Engineer.

Objetivo: validar se 2 pessoas conseguem jogar uma partida completa do Pique Esconde em celulares reais, com GPS, radar, captura, resultado e rematch, sem expor localizacao sensivel.

## Resultado Esperado do Teste

Ao final do teste, deve ser possivel responder:

- O app funcionou em celular real?
- O GPS foi compreendido e aceito pelos jogadores?
- O radar ajudou sem mostrar mapa exato?
- A captura pareceu justa?
- O lobby sincronizou corretamente entre os 2 aparelhos?
- Resultado, jogar novamente e sair funcionaram?
- Algum fluxo expos GPS, mapa, rota, endereco ou coordenadas?

## Pessoas e Papeis

Pessoa A:

- Comeca como lider/procurador.
- Cria a sala.
- Compartilha codigo, link ou QR.
- Faz o papel de procurador na primeira rodada.

Pessoa B:

- Entra na sala.
- Faz o papel de escondido.
- Valida convite, permissao de localizacao, esconderijo, radar e captura.

Depois da primeira rodada, inverter os papeis se houver tempo.

## Ambiente Recomendado

- Local aberto ou semiaberto.
- Evitar ruas movimentadas, escadas, garagens, locais perigosos ou areas privadas sem permissao.
- Ter sinal de internet movel ou Wi-Fi estavel.
- Bateria acima de 40% nos dois aparelhos.
- Brilho da tela alto o suficiente para uso externo.
- Distancia inicial recomendada: 10m a 30m entre os jogadores.

## Materiais

- 2 celulares reais.
- App instalado via APK Android ou PWA/HTTPS estavel.
- Link publico ou URL de teste.
- Bloco de notas para registrar bugs.
- Opcional: gravacao de tela nos dois celulares.
- Opcional: fita mental de distancia aproximada: 5m, 10m, 20m.

## Dados do Teste

Preencher antes de iniciar:

| Campo | Valor |
| --- | --- |
| Data | |
| Local | |
| Versao/commit | |
| Ambiente | APK Android / PWA HTTPS / Outro |
| Celular A | |
| Celular B | |
| Rede A | Wi-Fi / 4G / 5G |
| Rede B | Wi-Fi / 4G / 5G |
| Clima/local | Aberto / semiaberto / fechado |
| Responsavel pelo teste | |

## Checklist Antes de Comecar

- [ ] Os dois celulares estao com bateria suficiente.
- [ ] O app abre nos dois celulares.
- [ ] A origem e segura para GPS, como APK ou HTTPS.
- [ ] O local e seguro para andar e procurar.
- [ ] Os dois jogadores entenderam que o app nao deve mostrar mapa exato.
- [ ] Os dois jogadores sabem que o teste pode falhar e que isso deve ser registrado.
- [ ] Nenhum arquivo `.env`, token, chave ou credencial sera fotografado, gravado ou compartilhado.

## Criterios de Passou/Falhou

Passou:

- Os 2 jogadores completam pelo menos 1 rodada real.
- O lobby atualiza nos dois aparelhos.
- O radar mostra proximidade sem mapa exato.
- A captura acontece de forma compreensivel.
- O resultado aparece corretamente.
- "Jogar novamente" volta para o lobby da mesma sala.
- Nenhum fluxo mostra GPS, mapa, rota, endereco ou coordenadas.

Falhou:

- Um jogador nao consegue entrar ou permanecer na sala.
- GPS nao funciona mesmo em ambiente seguro/adequado.
- O radar nao muda com a distancia.
- Captura acontece longe demais ou nao acontece muito perto.
- Um jogador fica preso em tela errada.
- Resultado/rematch quebra a sala.
- Qualquer tela, card, log visivel ou compartilhamento mostra localizacao sensivel.

## Roteiro Principal - Rodada 1

### 1. Abrir o App

Passos:

1. Pessoa A abre o app.
2. Pessoa B abre o app.
3. Verificar se a tela inicial aparece corretamente nos dois celulares.

Esperado:

- Botoes principais aparecem sem corte.
- Textos sao legiveis.
- Nenhum erro tecnico aparece.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### 2. Criar Sala

Passos:

1. Pessoa A toca em "Criar sala".
2. Informa apelido.
3. Escolhe avatar.
4. Confirma criacao.

Esperado:

- Sala e criada.
- Pessoa A entra como lider/procurador.
- Codigo, link ou QR da sala fica disponivel.

Resultado:

- [ ] Passou
- [ ] Falhou
- Codigo da sala:
- Observacoes:

### 3. Entrar na Sala

Passos:

1. Pessoa B usa codigo, link ou QR.
2. Informa apelido.
3. Escolhe avatar.
4. Confirma entrada.

Esperado:

- Pessoa B entra no lobby correto.
- Pessoa A ve Pessoa B no lobby sem precisar recarregar.
- Pessoa B ve Pessoa A como lider/procurador.

Resultado:

- [ ] Passou
- [ ] Falhou
- Metodo usado: codigo / link / QR / share
- Observacoes:

### 4. Permissao de Localizacao

Passos:

1. Nos dois celulares, avancar ate a permissao de localizacao.
2. Ler a explicacao da tela.
3. Aceitar permissao.

Esperado:

- O texto explica uso temporario de localizacao.
- O app nao promete mapa exato.
- Os dois jogadores conseguem continuar.

Resultado:

- [ ] Passou
- [ ] Falhou
- A explicacao ficou clara? sim / nao
- Observacoes:

### 5. Preparar e Iniciar

Passos:

1. Pessoa B marca "Preparado", se aplicavel.
2. Pessoa A confirma regras.
3. Pessoa A inicia partida.

Esperado:

- O estado de pronto aparece para os dois.
- A partida so inicia quando as condicoes forem atendidas.
- Os dois aparelhos mudam para a fase correta.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### 6. Fase de Esconder

Passos:

1. Pessoa B se afasta para um ponto seguro.
2. Pessoa B toca em "Estou escondido".
3. Pessoa A aguarda a liberacao.

Esperado:

- Pessoa B ve estado de escondido.
- Pessoa A ve que o procurador sera liberado.
- A transicao para busca acontece corretamente.

Resultado:

- [ ] Passou
- [ ] Falhou
- Distancia aproximada inicial:
- Observacoes:

### 7. Radar do Procurador

Passos:

1. Pessoa A abre/observa a tela de radar.
2. Pessoa A caminha lentamente em direcao a Pessoa B.
3. Pessoa A para em 3 distancias aproximadas: longe, medio, perto.
4. Pessoa B observa sua propria tela enquanto esta escondida.

Esperado:

- Radar muda conforme a distancia.
- Nao aparece mapa exato.
- Nao aparecem latitude, longitude, rota, endereco ou coordenadas.
- Pessoa B nao ve posicao exata do procurador.

Resultado:

- [ ] Passou
- [ ] Falhou
- Longe: frio / morno / quente / outro
- Medio: frio / morno / quente / outro
- Perto: frio / morno / quente / outro
- Observacoes:

### 8. Captura

Passos:

1. Pessoa A se aproxima de Pessoa B.
2. Ficar perto por cerca de 2 segundos.
3. Observar se a captura acontece.

Esperado:

- Captura acontece apenas quando os jogadores estao realmente perto.
- Os dois celulares atualizam o estado.
- A captura nao parece injusta para Pessoa B.

Resultado:

- [ ] Passou
- [ ] Falhou
- Distancia percebida no momento da captura:
- Captura pareceu justa? sim / nao
- Observacoes:

### 9. Resultado

Passos:

1. Aguardar tela de resultado.
2. Verificar vencedor.
3. Verificar avatar/destaque.
4. Verificar acoes disponiveis.

Esperado:

- Resultado aparece nos dois celulares.
- Vencedor faz sentido.
- Acoes "Jogar novamente", "Sair" e compartilhamento aparecem corretamente, se aplicavel.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### 10. Jogar Novamente

Passos:

1. Pessoa A ou B toca em "Jogar novamente".
2. Verificar retorno ao lobby.
3. Verificar se a sala e a mesma.
4. Se possivel, inverter procurador/escondido.

Esperado:

- Os dois voltam ao lobby da mesma sala.
- Nao ha duplicacao de jogador.
- A sala fica pronta para nova rodada.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

## Roteiro Secundario - Robustez

Executar apenas se a rodada principal passou ou se houver tempo.

### A. Refresh ou Reabrir App

Passos:

1. Com os dois jogadores no lobby, Pessoa B fecha e reabre o app ou atualiza a pagina.
2. Observar se retorna para a sala.

Esperado:

- Sessao e restaurada quando ainda valida.
- Nao cria jogador duplicado.
- Se nao restaurar, o app mostra saida clara.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### B. Perda de Sinal de GPS

Passos:

1. Durante a partida, Pessoa B desativa GPS ou bloqueia permissao temporariamente, se for seguro.
2. Aguardar aviso de instabilidade.
3. Reativar GPS.

Esperado:

- App mostra aviso claro de sinal instavel.
- Nao mostra dados sensiveis.
- Estado final e compreensivel.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### C. Sair da Sala

Passos:

1. Pessoa B toca em "Sair".
2. Pessoa A observa o lobby ou rodada.

Esperado:

- Pessoa B sai sem ficar presa.
- Pessoa A ve atualizacao.
- Se a partida nao puder continuar com 1 jogador, app explica o motivo.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

### D. Card Social

Passos:

1. Abrir card social depois do resultado.
2. Verificar conteudo.
3. Tentar compartilhar, se disponivel.

Esperado:

- Card mostra resultado, logo/avatar/frase.
- Nao mostra GPS, mapa, rota, endereco, coordenadas ou local real.

Resultado:

- [ ] Passou
- [ ] Falhou
- Observacoes:

## Registro de Bugs

Para cada falha, registrar:

| Campo | Valor |
| --- | --- |
| ID | BUG- |
| Severidade | Bloqueador / Alta / Media / Baixa |
| Tela | |
| Pessoa afetada | A / B / ambos |
| Passo do roteiro | |
| Esperado | |
| Obtido | |
| Reproduziu de novo? | Sim / Nao |
| Evidencia | Screenshot / video / log / relato |
| Decisao | Corrigir / aceitar no MVP / investigar |

Guia de severidade:

- Bloqueador: impede completar partida ou expoe localizacao sensivel.
- Alta: quebra lobby, GPS, captura, resultado ou rematch.
- Media: confunde jogador, exige refresh manual ou gera estado temporario incoerente.
- Baixa: texto, visual ou polish que nao impede o teste.

## Perguntas Pos-Teste

Responder em voz alta ou por anotacao curta:

1. Voce entendeu por que o app pediu localizacao?
2. O radar ajudou ou confundiu?
3. A captura pareceu justa?
4. Em algum momento pareceu que o app estava monitorando demais?
5. Quanto tempo demorou ate comecar a primeira partida?
6. Voce jogaria outra rodada agora?
7. Chamaria mais pessoas para testar?

## Decisao Final do Teste

Marcar uma opcao:

- [ ] Aprovado para repetir com 4 a 6 pessoas.
- [ ] Repetir teste com 2 pessoas apos correcoes.
- [ ] Bloqueado por bug critico.

Resumo final:

- Partidas completas:
- Bugs bloqueadores:
- Bugs altos:
- Capturas percebidas como injustas:
- Houve vazamento de localizacao? sim / nao
- Tempo ate primeira partida:
- Rematch funcionou? sim / nao

## Proximo Passo

Se aprovado:

- Agendar piloto fechado com 4 a 6 pessoas.

Se nao aprovado:

- Corrigir bugs bloqueadores/altos.
- Repetir este roteiro antes de aumentar o grupo.
