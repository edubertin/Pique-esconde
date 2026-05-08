# 07 - Roadmap

## Fase 1 - Descoberta

Objetivo: fechar as regras essenciais do jogo antes de codar.

Decisões já tomadas:

- Número mínimo de jogadores: 2.
- Número ideal de jogadores: 4.
- Limite rígido inicial: até 8 jogadores por sala.
- O limite de 8 jogadores aparece para o usuário.
- A duração da partida pode ser decidida pelo criador da sala.
- Duração padrão sugerida: 60 segundos para esconder e 3 minutos para procurar.
- Tempo para se esconder pode ser configurado, com máximo inicial de 60 segundos.
- O botão "estou escondido" serve para acelerar a liberação do procurador, não para travar a partida.
- Se o tempo de esconder acabar, o procurador é liberado automaticamente.
- O criador da sala é sempre o primeiro procurador.
- Em novas rodadas, o procurador/líder escolhe manualmente o próximo procurador.
- Se o procurador/líder cair, a liderança passa automaticamente para o próximo jogador disponível.
- Jogadores podem voltar para a mesma sala após desconexão.
- No MVP, começar com configuração padrão de ambiente e evoluir para presets aberto, misto e menor.
- O app pede localização quando o jogador entra na sala.
- Quem negar localização não participa como jogador ativo.
- O app não deve prometer bom funcionamento em ambiente fechado.
- A comunicação deve recomendar local aberto ou misto.
- Sala temporária expira quando todos saem ou após inatividade.
- Sugestão inicial de expiração: 30 minutos sem atividade.

Pendências desta fase:

- Refinar textos finais de permissão de localização.
- Confirmar regra final de sala expirada após testes.
- Nenhuma pendência crítica de produto nesta fase.

## Fase 2 - Protótipo

Objetivo: validar fluxo, telas e linguagem antes da implementação completa de GPS/realtime.

Decisões:

- Criar protótipo navegável sem GPS real.
- Simular o radar no protótipo.
- Usar avatares placeholder com boa direção visual.
- Validar tela inicial, criação de sala, lobby, regras, espera, radar, captura e resultado.

Critério de avanço:

- Uma pessoa entende rapidamente como criar sala e chamar amigos.
- O lobby parece divertido e claro.
- A lógica de esconder/procurar fica compreensível sem explicação longa.

## Fase 3 - MVP

Objetivo: construir uma primeira versão jogável em celular real.

Decisões:

- App em Expo + React Native + Expo Router.
- Mobile-first, com web como apoio de prototipação.
- Supabase Realtime no MVP.
- Supabase Postgres como banco inicial.
- Sessão temporária por sala, sem login completo.
- Captura automática por proximidade.
- Raio inicial sugerido de captura: 8m para testes.
- Confirmação de proximidade por cerca de 3 segundos.
- Radar com intensidade e direção aproximada.
- Sem mapa exato dos escondidos.
- Escondido vê status e alertas, não localização do procurador.
- Resultado pode ser compartilhado como card social.
- Card social não compartilha GPS, mapa real, rota, endereço ou coordenadas.
- Card social entra no MVP por potencial de divulgação.
- Biblioteca inicial de avatares: 4 opções, com diversidade visual e estilo próximo da referência do projeto.

Critério de avanço:

- Um grupo de 2 a 8 pessoas consegue jogar uma partida completa.
- A localização funciona em celular real.
- O radar orienta sem revelar posição exata.
- A captura automática funciona sem falsos positivos constantes.
- O grupo consegue jogar novamente sem criar outra sala.

## Fase 4 - Piloto

Objetivo: testar com grupos reais em ambiente físico.

Plano inicial:

- Testar com 4 a 6 pessoas.
- Preferir parque, condomínio, campus, clube ou área aberta controlada.
- Observar se o grupo entende a dinâmica sem ajuda.
- Medir se a partida termina corretamente.
- Medir se as pessoas querem jogar novamente.
- Ajustar raio, tempo, radar e textos de permissão com base no teste.

Critério de sucesso:

- O grupo cria sala, entra, joga e encerra sem orientação externa.
- Pelo menos uma nova rodada é iniciada espontaneamente.
- Jogadores entendem que o app usa localização temporária durante o jogo.
- A experiência parece divertida, não um app de monitoramento.

## Fase 5 - Evolução

Possíveis evoluções após validar o MVP:

- Presets completos de ambiente: aberto, misto e menor.
- Avatares refinados.
- Mais feedback sonoro e háptico.
- Card social visualmente mais forte.
- Melhorias de rush final.
- Troca manual ou automática de procurador.
- Modos de jogo alternativos.
- Skins e personalização.
- Ranking local da sala.
- Backend próprio com Socket.IO, se Supabase não atender latência/escala.
