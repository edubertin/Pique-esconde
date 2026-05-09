# Test Run - Lobby e Jogar Novamente

Data: 2026-05-08
Responsavel: Codex
Tipo: Agente IA / Revisao de regra e prototipo
Ambiente: Web
Dispositivo: Desktop
Sistema: Windows
Commit: 8bec69f

## Objetivo

- Validar as decisoes recentes de lobby, nova rodada e troca de procurador.
- Confirmar que o resultado nao possui mais botao de trocar procurador.
- Confirmar que nova rodada volta para o lobby da mesma sala.

## Escopo Testado

- Lobby com codigo, jogadores, limite e acoes.
- Acoes do lobby em grid compacto.
- Resultado com `Jogar novamente`, `Sair` e `Compartilhar`.
- Regra documentada de promover procurador pelo lobby.
- Regra documentada de expiracao com 1 jogador por 6 minutos.

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-003 | Parcial | Lobby agora usa estado local; limite real entre aparelhos ainda depende de backend. |
| TC-004 | Parcial | `Sair` altera estado local; precisa execucao real no browser. |
| TC-010 | Parcial | `Jogar novamente` reseta estado local e volta para `/lobby`; precisa execucao real. |
| Checklist de nova rodada | Parcial | Promocao de lider existe localmente; realtime ainda pendente. |

## Evidencias

- `apps/mobile/app/lobby.tsx`
- `apps/mobile/app/result.tsx`
- `docs/specs/game-loop.md`
- `docs/specs/rooms-and-lobby.md`
- `docs/technical/data-model.md`
- `docs/technical/realtime-events.md`

## Bugs Encontrados

- Nenhum bug funcional confirmado nesta rodada.

## Riscos ou Duvidas

- Promover lider/procurador pelo lobby ainda nao sincroniza entre aparelhos.
- Expiracao em 6 minutos com 1 jogador ainda nao existe em backend.
- A sala local ainda nao substitui Supabase Realtime.

## Decisao Final

Status: Parcial

Resumo:
- A arquitetura de fluxo esta coerente: resultado fecha a rodada, lobby decide a proxima.
- Estado local da sala foi iniciado para validar funcionalmente antes do Supabase.
