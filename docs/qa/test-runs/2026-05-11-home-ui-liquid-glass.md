# Test Run - E3-H4 Home Screen Redesign (Liquid Glass UI)

Data: 2026-05-11
Responsavel: Quinn QA
Tipo: Manual
Ambiente: Web + Android
Dispositivo: Android físico + Expo Web (desktop)
Sistema: Expo / React Native
Branch: `codex/final-snapshot-cleanup`

## Objetivo

- Validar o redesign visual da home screen com superfície `liquidPanel` (glass card com LinearGradient)
- Confirmar que o `warningTile` com tint âmbar é legível nos dois modos de fundo
- Verificar que o botão "Como Jogar" navega corretamente para `/how-to-play`
- Validar a nova tela `/how-to-play` com 5 seções de conteúdo
- Confirmar que os pills legais independentes são tocáveis e estão com glass styling
- Executar regressão nos fluxos principais da home que não foram alterados

## Escopo Testado

- Home screen (`app/index.tsx`) — card `liquidPanel`, botão "Como Jogar", pills legais, notice tile
- Token de superfície `liquidPanel` — glass card com borda LinearGradient
- Token `warningTile` — âmbar glass (rgba 18%) no lugar do amarelo sólido
- Tela `/how-to-play` — layout LegalPage com 5 seções
- `RoomRouteGuard` — `/how-to-play` em `alwaysPublicPaths`
- Rotas legais existentes: `/privacy`, `/terms`, `/support`, `/data-deletion`, `/legal`

---

## Verificações Visuais

### Glass Card — `liquidPanel`

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| VIS-01 | Card glass renderiza com fundo translúcido visível sobre background da home | Web | Pendente | |
| VIS-02 | Card glass renderiza com fundo translúcido visível sobre background da home | Android | Pendente | |
| VIS-03 | Borda LinearGradient do card é visível (não colapsa para borda sólida ou invisível) | Web | Pendente | |
| VIS-04 | Borda LinearGradient do card é visível | Android | Pendente | Validar que expo-linear-gradient renderiza corretamente no APK |
| VIS-05 | Card não corta conteúdo (botões "Criar Sala" e "Entrar com Código" totalmente visíveis) | Web | Pendente | |
| VIS-06 | Card não corta conteúdo | Android | Pendente | |
| VIS-07 | Sombra / elevação do card visível e consistente com design | Web | Pendente | |
| VIS-08 | Sombra / elevação do card visível e consistente com design | Android | Pendente | |

### Warning Tile — âmbar glass

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| VIS-09 | Tint âmbar (rgba 18%) visível sobre fundo claro | Web | Pendente | |
| VIS-10 | Tint âmbar visível sobre fundo escuro / background da home | Web | Pendente | |
| VIS-11 | Tint âmbar visível e legível no Android | Android | Pendente | |
| VIS-12 | Texto do notice tile legível (contraste suficiente) sobre o tint âmbar | Web | Pendente | |
| VIS-13 | Tint âmbar é distinguível visualmente do glass card (`liquidPanel`) | Web | Pendente | Cores não devem se confundir |
| VIS-14 | Tint âmbar é distinguível visualmente do glass card (`liquidPanel`) | Android | Pendente | |

### Botão "Como Jogar" — variante ghost

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| VIS-15 | Botão "Como Jogar" renderiza abaixo do separador, com peso visual ghost (sem preenchimento sólido) | Web | Pendente | |
| VIS-16 | Botão "Como Jogar" renderiza abaixo do separador, com peso visual ghost | Android | Pendente | |
| VIS-17 | Separador entre botões principais e "Como Jogar" é visível e alinhado ao card | Web | Pendente | |
| VIS-18 | Hierarquia visual clara: "Criar Sala" > "Entrar com Código" > separador > "Como Jogar" | Web | Pendente | |

### Pills Legais — estilo independente com glass

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| VIS-19 | Cada pill legal renderiza individualmente sem container externo | Web | Pendente | |
| VIS-20 | Cada pill legal renderiza individualmente sem container externo | Android | Pendente | |
| VIS-21 | Pills têm glass styling (não fundo sólido branco/cinza) | Web | Pendente | |
| VIS-22 | Pills têm área de toque mínima de 36px de altura | Web | Pendente | |
| VIS-23 | Pills têm área de toque mínima de 36px de altura | Android | Pendente | Testar com dedo — margem de erro aceitável |

---

## Verificações de Navegação

### Rota `/how-to-play`

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| NAV-01 | Tocar em "Como Jogar" abre a tela `/how-to-play` | Web | Pendente | |
| NAV-02 | Tocar em "Como Jogar" abre a tela `/how-to-play` | Android | Pendente | |
| NAV-03 | Botão de voltar em `/how-to-play` retorna à home | Web | Pendente | |
| NAV-04 | Botão de voltar em `/how-to-play` retorna à home | Android | Pendente | Validar gesto de swipe também |
| NAV-05 | `/how-to-play` acessível quando há sala ativa (usuário em lobby) — sem redirecionamento de guarda | Web | Pendente | Exige ter sala ativa em paralelo |
| NAV-06 | `/how-to-play` acessível quando usuário está em fase de busca | Web | Pendente | |
| NAV-07 | Navegação para `/how-to-play` não destrói sessão/estado da sala | Web | Pendente | Voltar ao lobby após visitar a tela |

### Rotas legais existentes — regressão

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| NAV-08 | `/privacy` abre corretamente a partir da home | Web | Pendente | |
| NAV-09 | `/terms` abre corretamente a partir da home | Web | Pendente | |
| NAV-10 | `/support` abre corretamente a partir da home | Web | Pendente | |
| NAV-11 | `/data-deletion` abre corretamente a partir da home | Web | Pendente | |
| NAV-12 | `/legal` (hub) abre corretamente a partir da home | Web | Pendente | |
| NAV-13 | Todas as 5 rotas legais acessíveis sem sala ativa (`alwaysPublicPaths`) | Web | Pendente | |

---

## Verificações de Conteúdo — Tela `/how-to-play`

| # | Caso | Status | Observações |
|---|---|---|---|
| CTD-01 | Seção "Objetivo" presente e com conteúdo | Pendente | |
| CTD-02 | Seção "Radar" presente e com conteúdo | Pendente | |
| CTD-03 | Seção "Localização" presente e com conteúdo | Pendente | |
| CTD-04 | Seção "Segurança" presente e com conteúdo | Pendente | |
| CTD-05 | Seção "Como Começar" presente e com conteúdo | Pendente | |
| CTD-06 | Layout LegalPage aplicado (scroll, header, back button) | Pendente | |
| CTD-07 | Conteúdo longo rola sem cortar texto em telas pequenas | Pendente | Testar em viewport SE (375px) |

---

## Verificações do Notice Tile

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| NOT-01 | "Nenhuma sala ativa" aparece abaixo do card, não dentro dele | Web | Pendente | Validar posicionamento no DOM / layout |
| NOT-02 | "Nenhuma sala ativa" aparece abaixo do card | Android | Pendente | |
| NOT-03 | "Você saiu da partida" aparece corretamente após sair de uma sala | Web | Pendente | Exige fluxo de entrada → saída |
| NOT-04 | "Você saiu da partida" aparece corretamente após sair de uma sala | Android | Pendente | |
| NOT-05 | Notice tile âmbar não se confunde visualmente com o glass card | Web | Pendente | |
| NOT-06 | Notice desaparece após dismissal manual | Web | Pendente | |
| NOT-07 | Notice desaparece após navegação para outra tela e retorno à home | Web | Pendente | |
| NOT-08 | Sem notice exibido quando não há motivo (first open, sem sala prévia) | Web | Pendente | |

---

## Verificações de Regressão

### Fluxos principais da home

| # | Caso | Plataforma | Status | Observações |
|---|---|---|---|---|
| REG-01 | "Criar Sala" navega corretamente para fluxo de criação de sala | Web | Pendente | |
| REG-02 | "Criar Sala" navega corretamente para fluxo de criação de sala | Android | Pendente | |
| REG-03 | "Entrar com Código" navega corretamente para fluxo de entrada | Web | Pendente | |
| REG-04 | "Entrar com Código" navega corretamente para fluxo de entrada | Android | Pendente | |
| REG-05 | Home acessível sem sala ativa (rota pública) | Web | Pendente | |
| REG-06 | Home não exibe overflow em viewport SE (375px de largura) | Web | Pendente | Reduzir viewport no DevTools |
| REG-07 | Home não exibe overflow em tela Android pequena | Android | Pendente | Testar em dispositivo ou emulador 360px |
| REG-08 | Sem erro de console ao carregar a home (JS errors, warnings críticos) | Web | Pendente | Verificar DevTools → Console |
| REG-09 | LinearGradient não causa erro de importação no bundle web | Web | Pendente | `expo-linear-gradient` requer suporte web explícito |

---

## Evidências

- Screenshots:
- Vídeos:
- Logs:

## Bugs Encontrados

-

## Riscos ou Dúvidas

- `expo-linear-gradient` em web pode precisar de polyfill ou fallback CSS — confirmar que a borda LinearGradient não colapsa para `undefined` no Expo Web
- Glass effect com `rgba` pode ter comportamento diferente dependendo do `blurRadius` suportado por plataforma — Android pode não suportar `backdropFilter`
- Pills legais independentes sem container externo — verificar se o espaçamento entre eles se mantém consistente em diferentes tamanhos de tela
- Notice tile posicionado fora do card — confirmar que não há reordenação de layout em telas muito pequenas (flexbox wrap inesperado)

## Decisão Final

Status: Pendente

Resumo:
- Aguardando implementação das mudanças (E3-H4 + UI) e execução manual dos casos
- Prioridade de execução: VIS (glass + âmbar) → NAV (Como Jogar + rotas legais) → REG (regressão fluxo principal)
- Bloquear merge se qualquer caso REG falhar ou se LinearGradient colapsar em web/Android
