# 08 - Próximos Passos

## Decisões Pendentes

- Texto final de permissão de localização.
- Nome e comportamento dos presets de ambiente.
- Regra final de expiração da sala.
- Formato visual final do card social.
- Critério exato para considerar uma sala abandonada.

Decisões já encaminhadas:

- Duração padrão: 60 segundos para esconder e 3 minutos para procurar.
- Tempo de esconder pode ser configurado, com máximo inicial de 60 segundos.
- Card social entra no MVP para ajudar divulgação.
- Card social não compartilha GPS, mapa real, rota, endereço ou coordenadas.
- Avatares iniciais: 4 opções.
- Direção dos avatares: rosto/busto cartoon, próximo da imagem de referência.
- Diversidade inicial: 2 avatares masculinos e 2 femininos, com cuidado de inclusão visual.
- Limite rígido inicial de sala: até 8 jogadores, evitando lobbies grandes.
- O limite de 8 jogadores aparece para o usuário.
- Troca de procurador em nova rodada: manual, escolhida pelo líder/procurador no lobby.
- O líder pode promover outro jogador da lista.
- Se o líder/procurador cair, liderança passa para o próximo jogador disponível.
- Jogadores podem voltar para a mesma sala após desconexão.
- Sala temporária deve expirar quando todos saírem ou após limite de inatividade.

## Tarefas Imediatas

1. Criar wireframes das telas principais.
2. Definir guia visual com base na imagem de referência.
3. Desenhar 4 avatares iniciais.
4. Definir card social de resultado.
5. Escrever textos de permissão de localização.
6. Detalhar modelo de dados.
7. Detalhar eventos realtime.
8. Montar projeto Expo.
9. Configurar Supabase.
10. Implementar sala, lobby e convite por link.
11. Implementar fluxo de partida.
12. Implementar GPS, radar e captura automática.
13. Testar em celular real com grupo pequeno.

## Materiais Necessários

- Imagem de referência visual já salva em `docs/design/referencias/pique-esconde-referencia.png`.
- Lista final de telas.
- Paleta inicial.
- Logo provisório ou wordmark.
- Quatro avatares iniciais.
- Textos curtos de permissão, privacidade e localização.
- Configuração inicial do Supabase.
- Celulares reais para teste.
- Local aberto ou misto para piloto.

## Cronograma Inicial

### Semana 1 - Protótipo

- Wireframes.
- Fluxo navegável.
- Lobby visual com avatares.
- Radar simulado.
- Resultado e card social simulado.

### Semana 2 - Base Técnica

- Projeto Expo.
- Estrutura de rotas.
- Supabase.
- Criação/entrada de sala.
- Lobby realtime.
- Convite por link/código.

### Semana 3 - Jogo Real

- Permissão de localização.
- Atualização de posição.
- Radar/proximidade.
- Captura automática.
- Rush final.
- Resultado e jogar novamente.

### Semana 4 - Piloto

- Teste com 4 a 6 pessoas.
- Ajuste de raio, tempo e feedback.
- Ajuste de textos.
- Validação do card social.
- Preparação da próxima versão.

## Responsáveis

- Produto: definir regras, fluxo e critérios de sucesso.
- Design: wireframes, visual, avatares e card social.
- App: Expo, telas, navegação e experiência de jogo.
- Realtime/backend: Supabase, salas, eventos e estado da partida.
- Testes: validação em celular real e piloto presencial.

No MVP, uma mesma pessoa pode acumular vários papéis. O importante é manter essas responsabilidades visíveis para não misturar decisão de produto com implementação técnica.

## Texto Inicial de Permissão

Sugestão de texto antes de pedir localização:

> O Pique Esconde usa sua localização apenas durante a partida para calcular o radar e as capturas. Não mostramos seu ponto exato para outros jogadores e não compartilhamos GPS em redes sociais.

Texto curto para tela de entrada:

> Para jogar, precisamos da sua localização durante esta partida.

Texto para quem negar:

> Sem localização, você não pode participar como jogador ativo nesta rodada.

## Regra Inicial de Sala

- A sala continua ativa enquanto houver jogadores conectados.
- Se todos saírem, a sala é encerrada.
- Se a sala ficar sem atividade por um período definido, ela expira automaticamente.
- Se restar apenas 1 jogador ativo, a sala expira após 6 minutos sem novos jogadores.
