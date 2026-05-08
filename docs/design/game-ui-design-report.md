# Relatório - Direção Game UI

## Diagnóstico

O logo e o store cover apontam para uma linguagem de jogo mobile casual com alto contraste, formas grandes, bordas grossas, cores vibrantes e leitura instantânea. A direção é forte: mundo ao ar livre, radar, pins, avatares e ação em grupo.

O risco principal é a interface ficar infantil ou poluída. A recomendação é separar:

- **Arte promocional**: mais rica, ilustrada e cheia de energia.
- **UI do app**: mais limpa, tátil, com botões grandes e hierarquia forte.

O app será usado em pé, em grupo, possivelmente andando ou correndo. Por isso, a UI precisa parecer jogo, mas funcionar como ferramenta rápida.

## Pattern Recomendado

Começar com o pattern **Arcade Card UI**.

Esse pattern combina:

- Cards claros com borda forte.
- Botões grandes em estilo arcade/mobile game.
- Estados visuais por cor.
- Avatares circulares.
- Badges compactos.
- Radar como peça central da tela de jogo.
- Pouca informação por tela.

## Atualização de Implementação

O protótipo mobile já começou a aplicar essa direção em Expo/React Native.

Decisões aplicadas:

- Home limpa, sem header e sem texto institucional longo.
- Logo maior, centralizado e alinhado com os botões.
- Botões principais com largura alinhada ao logo.
- Especificações mínimas na home: `2-8 jogadores · sala temporária · GPS só na partida`.
- Lobby com banner visual usando `pique-esconde-store-cover.png`.
- Páginas com menos texto auxiliar e mais foco na ação principal.
- Cards, badges, botões e radar padronizados com o pattern Arcade Card UI.

Assets usados no app:

- `apps/mobile/assets/images/pique-esconde-logo.png`
- `apps/mobile/assets/images/pique-esconde-store-cover.png`

Referências de qualidade:

- Clash Royale para botões robustos, hierarquia e acabamento premium.
- Brawl Stars para energia visual, leitura rápida e cards.
- Among Us para simplicidade de sala/lobby.
- Pokémon GO para jogo físico-digital.
- Apple Find My para proximidade/direção sem mapa explícito.

Não copiar a estética desses produtos; usar apenas como benchmark de clareza.

## Compatibilidade com Expo

A direção proposta é segura para Expo/React Native e builds APK/IPA.

Evitar no MVP:

- Efeitos gráficos pesados demais.
- Blur/glass complexo em todas as telas.
- Sombras nativas inconsistentes.
- Dependência de SVGs muito complexos.
- Animações contínuas pesadas em várias telas.

Usar:

- `View`, `Text`, `Pressable`, `ScrollView`.
- `expo-image` para assets como logo e avatares.
- `expo-haptics` para feedback de captura/radar.
- `expo-audio` ou solução equivalente moderna para sons curtos, quando entrarmos em áudio.
- Reanimated apenas quando houver necessidade real de animação mais rica.

## Paleta Inicial

Base atual aprovada:

| Token | Cor | Uso |
| --- | --- | --- |
| `navy` | `#071A3D` | Texto forte, contorno, botões secundários, moldura premium. |
| `pink` | `#FF2D8D` | Ação principal, captura, energia, destaque. |
| `lime` | `#B6F000` | Vitória, sinal forte, radar positivo. |
| `blue` | `#0A84FF` | Céu, tecnologia, radar, links. |
| `green` | `#33C759` | Status pronto/ativo. |
| `yellow` | `#FFCC00` | Alerta, rush final, atenção. |
| `surface` | `#FFFFFF` | Cards e superfícies. |
| `background` | `#F7FBFF` | Fundo limpo. |
| `muted` | `#59708F` | Texto secundário. |
| `line` | `#D8E6F5` | Bordas leves. |

Recomendação:

- Manter `navy` como base de contraste.
- Usar `pink` apenas para ações principais ou momentos fortes.
- Usar `lime/yellow` para jogo, radar, vitória e rush.
- Não deixar tudo azul/rosa; alternar com branco e navy para profissionalizar.

## Tipografia

Expo/React Native permite começar com fonte do sistema. Para MVP, isso é aceitável.

Hierarquia recomendada:

- Título de tela: 28-34px, peso 900.
- Contador/tempo: 48-64px, peso 900, tabular nums.
- Botões: 16-18px, peso 900.
- Labels/badges: 12-14px, peso 800.
- Texto auxiliar: 14-16px, peso 400-600.

Importante:

- Não usar letra pequena em telas de ação.
- Não usar texto longo durante partida.
- Evitar fonte decorativa dentro do app; deixar a personalidade maior para logo e assets.

## Botões

### Botão Primário

Uso:

- Criar sala.
- Entrar.
- Permitir localização.
- Estou escondido.
- Jogar novamente.

Estilo:

- Fundo `pink`.
- Texto branco.
- Altura mínima 56px.
- Borda arredondada 16-18px.
- Peso 900.
- Leve borda navy ou sombra curta para sensação de botão de jogo.

Implementável em React Native:

```txt
Pressable
backgroundColor: pink
borderRadius: 16
minHeight: 56
borderWidth: 2
borderColor: navy
```

### Botão Secundário

Uso:

- Regras.
- Compartilhar link.
- Trocar procurador.

Estilo:

- Fundo `navy`.
- Texto branco.
- Mesmo tamanho do primário.
- Menos destaque que o primário por posição/hierarquia, não por tamanho.

### Botão Ghost

Uso:

- Sair da sala.
- Agora não.
- Voltar.

Estilo:

- Fundo branco ou transparente.
- Borda `line`.
- Texto `ink/navy`.
- Para ações destrutivas leves, texto `danger`.

### Botão Perigoso

Uso futuro:

- Encerrar sala.
- Sair durante partida.

Estilo:

- Fundo branco.
- Borda `danger`.
- Texto `danger`.
- Evitar fundo vermelho cheio salvo confirmação crítica.

## Cards

### Card Base

Uso:

- Lobby.
- Regras.
- Permissão.
- Resultado.

Estilo:

- Fundo branco.
- Borda `line` ou `navy` em telas mais fortes.
- Raio 16-20px.
- Padding 16-20px.
- Gap interno 12-16px.

Recomendação:

- Não usar cards dentro de cards.
- Em telas de jogo, reduzir cards e priorizar HUD.

### Card de Jogador

Uso:

- Lista do lobby.
- Resultado.
- Capturados/sobreviventes.

Elementos:

- Avatar circular.
- Apelido.
- Badge de status.
- Indicador de líder/procurador.

Status por cor:

- Preparado: `green`.
- Aguardando: `yellow`.
- Capturado: `pink` ou `danger`.
- Desconectado: `muted`.
- Líder/procurador: `navy`.

## Badges

Badges devem ser pequenos, legíveis e coloridos.

Exemplos:

- `Líder`
- `Preparado`
- `Aguardando`
- `Escondido`
- `Capturado`
- `Rush final`

Pattern:

```txt
rounded capsule
paddingHorizontal 10
paddingVertical 5
fontSize 12
fontWeight 900
```

## Lobby

O lobby é a tela social mais importante.

Recomendação de estrutura:

1. Topo com código da sala e contador `4/8`.
2. Botão de compartilhar link.
3. Bloco do procurador/líder.
4. Lista de jogadores.
5. Ação principal no fim.

Hierarquia:

- Código precisa ser copiável/visível.
- `4/8` deve aparecer claramente, porque é uma decisão do produto.
- Botão "Sair da sala" deve existir, mas não competir com "Iniciar" ou "Preparado".

Pattern recomendado:

- Jogadores em cards horizontais.
- Avatar à esquerda.
- Nome/status no centro.
- Badge à direita.

## Radar

O radar deve ser o momento mais memorável do app.

Pattern recomendado:

- Radar circular grande no centro.
- Tempo no topo.
- Restantes no topo ou lateral.
- Sinal abaixo: `frio`, `morno`, `quente`, `muito perto`.
- Ponteiro aproximado, com pequena oscilação.
- Pulso visual quando o sinal aumenta.

Importante:

- Não parecer mapa.
- Não mostrar ponto exato do escondido.
- Quanto mais perto, mais confiante o ponteiro.
- Rush final pode mudar cor para `yellow/pink` e aumentar intensidade.

Expo:

- MVP pode usar `View` com círculos absolutos.
- Depois pode evoluir com Reanimated para pulso/rotação.
- Haptics entram em proximidade e captura.

## Avatares

Começar com 4 avatares pré-prontos.

Direção:

- Rosto/busto cartoon.
- Borda circular branca + contorno colorido.
- Expressões amigáveis.
- Jovem/adulto casual.
- Não parecer infantil demais.

Uso:

- Lobby.
- Captura.
- Resultado.
- Card social.

Não usar upload de foto no MVP.

## Card Social

O card deve parecer peça promocional curta, não relatório.

Conteúdo:

- Logo.
- Frase curta.
- Placar da pessoa.
- Avatares/resultado.
- QR/link ou "Disponível na loja".

Não incluir:

- GPS.
- Mapa real.
- Rota.
- Endereço.
- Coordenadas.

Pattern:

- Fundo navy ou cena ilustrada.
- Logo no topo.
- Texto grande no centro.
- Placar em badge.
- QR pequeno no rodapé.

## Recomendações por Tela

### Home

Usar o logo como sinal principal, em tamanho médio/forte e alinhado com os botões. A home não deve virar store cover nem landing page.

Ação principal:

- Criar sala.

Ação secundária:

- Entrar com código.

Texto:

- Evitar texto institucional.
- Manter apenas especificações curtas quando necessário.
- Não exibir header duplicado com "Pique Esconde" se o logo já está presente.

### Criar/Entrar Sala

Usar formulário curto:

- Apelido.
- Avatar.
- Ação.

Evitar qualquer texto longo.

### Permissão de Localização

Visual limpo e confiável.

Usar ícone/radar e texto curto:

> Usamos localização só durante a partida.

Botão primário:

- Permitir localização.

### Lobby

Precisa parecer um menu de jogo, não uma lista administrativa.

Atualização aplicada:

- Incluir banner com a store cover no topo.
- Manter pouco texto.
- Destacar código da sala e contador `4/8`.
- Preservar ações essenciais: compartilhar, preparado, iniciar, editar regras e sair da sala.

Prioridade:

- Jogadores e status.
- Código/link.
- Preparado/iniciar.

### Regras

Usar linhas grandes e controles simples.

Para MVP:

- Tempo para esconder.
- Tempo para procurar.
- Ambiente padrão.
- Captura automática.

### Tempo de Esconder

Contador gigante.

Ação:

- Estou escondido.

Texto mínimo.

### Radar

Tela mais visual do app.

Usar:

- Radar grande.
- Tempo.
- Restantes.
- Sinal.
- Haptics/som depois.

### Captura

Feedback de impacto.

Pattern:

- Avatar capturado.
- Texto grande.
- Vibração/som.
- Continuar.

### Resultado

Foco em jogar de novo.

Ordem:

1. Resultado.
2. Vencedores/capturados.
3. Jogar novamente.
4. Compartilhar resultado.
5. Sair.

## Prioridades de Implementação

1. Criar tokens formais de design em `src/theme`.
2. Evoluir `GameButton` para variantes: primary, secondary, ghost, danger.
3. Criar `PlayerCard` com avatar, status e badge.
4. Criar `Badge`.
5. Melhorar `Panel` para suportar card padrão e card forte.
6. Refinar o radar como componente central.
7. Criar card social visual real.
8. Substituir assets padrão do Expo por assets do Pique Esconde.

## Riscos

- Logo grande demais fazer a home parecer anúncio.
- UI colorida demais prejudicar leitura.
- Botões pequenos em contexto de movimento.
- Lobby parecer tabela administrativa.
- Radar parecer app de rastreamento.
- Card social parecer vazamento de localização.
- Visual infantil afastar público jovem/adulto casual.

## Decisões Pendentes

- Fonte final do app.
- Estilo final dos 4 avatares.
- Nomes públicos do radar: `frio/morno/quente` ou outra linguagem.
- Se o botão principal terá sombra/volume forte ou visual mais flat.
- Como será o QR/link do card social.
- Nível de animação do radar no MVP.
