# Test Run - Fluxo Navegavel Web

Data: 2026-05-08
Responsavel: Codex
Tipo: Agente IA / Regressao de fluxo por revisao de rotas
Ambiente: Web
Dispositivo: Desktop
Sistema: Windows
Commit: 8bec69f

## Objetivo

- Validar se o fluxo navegavel principal do prototipo esta coerente com o MVP.
- Conferir destinos de botoes apos as mudancas de menu, lobby e resultado.

## Escopo Testado

Fluxo previsto:

```txt
Home
Criar sala
Permitir localizacao
Lobby
Regras
Lobby
Iniciar partida
Estou escondido
Status escondido
Radar
Captura
Resultado
Jogar novamente
Lobby
Sair
```

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-001 | Parcial | Criacao de sala existe no estado local/mock; precisa execucao real no browser. |
| TC-002 | Parcial | Entrada por codigo existe no estado local/mock; precisa execucao real no browser. |
| TC-005 | Parcial | Texto e rota existem; permissao nativa ainda nao implementada. |
| TC-010 | Parcial | `Jogar novamente` aponta para `/lobby`; precisa execucao no browser. |
| Navegacao geral | Parcial | Rotas estao definidas via Expo Router; precisa clique real ponta a ponta. |

## Evidencias

- `apps/mobile/app/index.tsx`
- `apps/mobile/app/create-room.tsx`
- `apps/mobile/app/location-permission.tsx`
- `apps/mobile/app/lobby.tsx`
- `apps/mobile/app/rules.tsx`
- `apps/mobile/app/hide-phase.tsx`
- `apps/mobile/app/hider-status.tsx`
- `apps/mobile/app/seeker-radar.tsx`
- `apps/mobile/app/capture.tsx`
- `apps/mobile/app/result.tsx`

## Bugs Encontrados

- Nenhum bug de rota confirmado por execucao real nesta rodada.

## Riscos ou Duvidas

- Estado local de sala foi iniciado, mas ainda nao sincroniza entre aparelhos.
- O botao `Convidar` adiciona amigos demo; ainda nao abre share nativo.
- O fluxo de permissao ainda nao aciona permissao real do dispositivo.

## Decisao Final

Status: Parcial

Resumo:
- Fluxo navegavel esta desenhado e agora possui estado local inicial.
- Precisa de test run com navegador para evidenciar cliques reais.
