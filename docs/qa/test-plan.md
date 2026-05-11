# QA Test Plan

## Objetivo

Orientar testes manuais, revisoes por agentes de IA e futuras automacoes do MVP do Pique Esconde.

O objetivo principal e provar que um grupo consegue criar uma sala, entrar, preparar a partida, jogar com localizacao temporaria, concluir a rodada e jogar novamente sem quebrar regras de privacidade ou fluxo.

## Escopo Atual

Este plano cobre o MVP mobile/web em Expo:

- Fluxo navegavel do app.
- Criacao e entrada em sala.
- Lobby e estados dos jogadores.
- Configuracao basica de regras.
- Permissao de localizacao.
- Fase de esconder.
- Radar/proximidade.
- Captura automatica.
- Resultado e jogar novamente.
- Card social sem dados de GPS.
- Responsividade em telas mobile e web.

## Fora do Escopo Agora

- Testes automatizados.
- Testes de carga reais.
- Testes com GPS real em multiplas cidades.
- Publicacao em loja.
- Validacao juridica formal.

## Areas Criticas

### Produto

- O usuario entende rapidamente como criar ou entrar em uma sala.
- O jogo exige grupo, mas nao trava desnecessariamente.
- O fluxo de esconder/procurar fica claro sem explicacao longa.
- O botao "jogar novamente" evita recriar sala toda hora.

### Sala e Lobby

- Sala aceita minimo de 2 jogadores.
- Sala mostra limite de ate 8 jogadores.
- Jogador consegue sair da sala.
- Jogador consegue voltar para a sala apos queda.
- Lider/procurador pode passar lideranca em novas rodadas.
- Se lider/procurador cair, a lideranca passa para outro jogador disponivel.

### Localizacao e Privacidade

- O app pede localizacao antes da partida ativa.
- Quem nega localizacao nao joga como participante ativo.
- A localizacao e usada apenas durante a partida.
- O app nao mostra mapa exato dos escondidos.
- O card social nao revela GPS, rota, mapa, endereco ou coordenadas.

### Jogo

- Todos podem marcar "estou escondido".
- O fim do tempo de esconder libera o procurador automaticamente.
- Radar mostra intensidade e direcao aproximada.
- Captura automatica ocorre por proximidade confirmada.
- Rush final aumenta a pressao sem entregar localizacao exata demais.

### UX e Visual

- Telas funcionam em celular pequeno.
- Textos nao sobrepoem botoes ou imagens.
- Background cobre a tela sem quebrar o layout.
- Acoes principais sao claras e acessiveis.
- O visual mantem energia de game casual.

## Tipos de Teste

- Teste de fluxo: valida jornada completa de ponta a ponta.
- Teste funcional: valida regras e estados especificos.
- Teste de regressao: garante que mudancas novas nao quebraram fluxo existente.
- Teste visual: verifica responsividade, alinhamento, contraste e leitura.
- Teste de privacidade: verifica se nenhum dado sensivel aparece indevidamente.
- Teste de agente: revisao feita por IA seguindo checklist e evidencias.
- Teste exploratorio: tentativa livre de quebrar fluxo, estados e navegacao.

## Roteiros de Campo

- [Teste de campo com 2 jogadores](field-test-2-players.md): roteiro pratico para validar GPS, radar, captura, resultado, rematch, convite e privacidade com apenas duas pessoas.

## Ambientes

Preencher durante cada execucao:

- Plataforma: Web, Expo Go Android, Expo Go iOS, build Android ou build iOS.
- Dispositivo:
- Sistema operacional:
- Navegador, se web:
- Commit testado:
- Data:
- Responsavel:

## Criterio de Pronto para MVP

O MVP pode avancar para piloto quando:

- 2 a 8 jogadores completam uma partida real.
- A sala e o lobby funcionam sem intervencao externa.
- A permissao de localizacao e compreendida.
- O radar ajuda a encontrar sem mostrar posicao exata.
- Capturas automaticas funcionam com poucos falsos positivos.
- Resultado e jogar novamente funcionam.
- Nenhum fluxo compartilha GPS fora da partida.

## Orientacoes para Agentes de IA

- Leia `docs/apresentacao/05-escopo-do-mvp.md`, `docs/specs/` e `docs/qa/regression-checklist.md` antes de avaliar uma feature.
- Reporte falhas de forma direta, com tela, passo, resultado esperado e resultado obtido.
- Nao esconda limitacoes com frases genericas como "parece ok".
- Diferencie bug, risco, decisao pendente e limitacao aceita do MVP.
- Nao implemente testes automatizados sem pedido explicito.
- Quando uma falha for encontrada, registre ou sugira registro em `known-issues.md`.
