# Test Run - Bloqueio de Apelidos Duplicados por Sala

Data: 2026-05-11
Responsavel: Quinn QA
Tipo: Manual
Ambiente: Staging / Dispositivo físico
Dispositivo: Android + iOS (dois dispositivos para TC-NIC-05)
Sistema: Expo / Supabase
Commit: a385a30

## Objetivo

- Validar que dois jogadores não conseguem entrar na mesma sala com apelidos equivalentes
- Verificar normalização case-insensitive e acento-insensitive
- Confirmar que a race condition está coberta

## Escopo Testado

- Fluxo de entrada na sala (`join-room`)
- RPC `pe_join_room` com constraint de unicidade
- Mensagem de erro inline abaixo do campo de apelido
- Fluxo normal de entrada sem duplicata (regressão)

## Casos Executados

| Caso | Cenário | Resultado | Observações |
| --- | --- | --- | --- |
| TC-NIC-01 | Entrar com nome idêntico ao de jogador já na sala | Pendente | Esperado: bloqueado com mensagem de erro |
| TC-NIC-02 | "ana" vs "ANA" — case diferente | Pendente | Esperado: bloqueado |
| TC-NIC-03 | "Ana" vs "Aná" / "ÀNA" — acento diferente | Pendente | Esperado: bloqueado |
| TC-NIC-04 | "Ana" vs "Ana Lima" — nomes distintos | Pendente | Esperado: entrada permitida |
| TC-NIC-05 | Race condition: dois dispositivos, mesmo nome, <500ms | Pendente | Exige dois dispositivos físicos simultâneos |
| TC-NIC-06 | Nickname com 30 chars vs primeiros 24 chars idênticos | Pendente | Esperado: bloqueado (truncamento coerente) |
| TC-NIC-07 | "  Ana  " / "A  na" — espaços extras | Pendente | Esperado: mesma chave que "Ana" |
| TC-NIC-08 | Mesmo nome em salas diferentes | Pendente | Esperado: permitido (unicidade é por sala) |
| TC-NIC-09 | Fluxo normal sem duplicata não regride | Pendente | Caminho feliz completo até lobby |
| TC-NIC-10 | Migration com dados pré-existentes | Pendente | Verificar: `SELECT COUNT(*) FROM pe_players WHERE nickname_key IS NULL` = 0 |

## Verificação pós-migration (SQL)

```sql
-- Deve retornar 0
SELECT COUNT(*) FROM pe_players WHERE nickname_key IS NULL;

-- Deve retornar 0 linhas
SELECT room_id, nickname_key, COUNT(*)
FROM pe_players
GROUP BY room_id, nickname_key
HAVING COUNT(*) > 1;
```

## Evidências

- Screenshots:
- Vídeos:
- Logs:

## Bugs Encontrados

-

## Riscos ou Dúvidas

- TC-NIC-05 (race condition) é difícil de reproduzir manualmente — considerar teste automatizado futuro
- Mensagem de erro está hardcoded em PT-BR no `room-store.tsx`; usuário em EN-US verá PT-BR (dívida técnica conhecida, não bloqueante para piloto nacional)
- Verificar se fluxo de reconexão (jogador que saiu tenta entrar de novo com mesmo apelido) não conflita com a constraint

## Decisão Final

Status: Pendente

Resumo:
- Aguardando execução dos casos TC-NIC-01 a TC-NIC-10
- Migration deve ser aplicada no Supabase antes de executar os testes
