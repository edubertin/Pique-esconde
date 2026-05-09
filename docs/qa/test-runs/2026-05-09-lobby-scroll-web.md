# Test Run - Lobby Scroll Web

Data: 2026-05-09
Responsavel: Codex
Tipo: Agente IA / Regressao visual e funcional
Ambiente: Web
Dispositivo: Mobile viewport simulado
Sistema: Windows / Edge headless
Commit: worktree local

## Objetivo

- Validar se a lista de jogadores do lobby suporta ate 8 jogadores.
- Confirmar que apenas os 4 primeiros jogadores ficam visiveis inicialmente.
- Confirmar que o lider fica sempre no topo da lista.
- Confirmar que a lista interna possui scroll funcional sem quebrar o layout do card.

## Escopo Testado

Fluxo executado:

```txt
Home
Criar sala
Permitir localizacao
Lobby
Convidar ate 8/8
Validar lista de jogadores
Rolar lista interna
Validar ultimo jogador visivel apos scroll
```

Viewport usado:

```txt
390 x 844
```

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-LOBBY-001 | Passou | O botao `Convidar` adicionou jogadores demo ate `8/8`. |
| TC-LOBBY-002 | Passou | O lider `Dudu` ficou acima de `Ana` na lista. |
| TC-LOBBY-003 | Passou | Os 4 primeiros jogadores ficaram dentro da area visivel da lista. |
| TC-LOBBY-004 | Passou | O quinto jogador ficou fora da area visivel antes da rolagem. |
| TC-LOBBY-005 | Passou | A lista rolou internamente e `Caio` ficou visivel no final. |
| TC-TECH-001 | Passou | `npm run lint` executado sem erros. |
| TC-TECH-002 | Passou | `npx tsc --noEmit` executado sem erros. |

## Evidencias

- URL final testada: `http://localhost:8082/lobby`
- Contador validado: `8/8`
- Container da lista:

```json
{
  "top": 383,
  "bottom": 683,
  "height": 300,
  "overflowY": "auto"
}
```

- Ordem inicial medida:

```json
[
  { "label": "Dudu", "top": 396, "bottom": 417 },
  { "label": "Ana", "top": 472, "bottom": 493 },
  { "label": "Rafa", "top": 548, "bottom": 569 },
  { "label": "Bia", "top": 624, "bottom": 645 },
  { "label": "Lu", "top": 700, "bottom": 721 },
  { "label": "Thi", "top": 776, "bottom": 797 },
  { "label": "Nina", "top": 852, "bottom": 873 },
  { "label": "Caio", "top": 928, "bottom": 949 }
]
```

- Resultado apos rolagem:

```json
{
  "scrollTop": 298,
  "caioVisibleInScroller": true,
  "caioTop": 630,
  "caioBottom": 651
}
```

## Bugs Encontrados

- Nenhum bug confirmado nesta rodada.

## Riscos ou Duvidas

- O teste foi executado em web com viewport mobile simulado; ainda precisa validacao futura em Expo Go/dev build no Android e iOS.
- O botao `Convidar` continua sendo comportamento demo/local, ainda nao representa convite real por link.

## Decisao Final

Status: Aprovado

Resumo:
- A lista do lobby esta adequada para testar salas com 8 jogadores.
- O scroll interno funciona sem ocupar a tela inteira.
- A lideranca permanece no topo da tabela.
