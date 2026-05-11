# QA Fase 0

Estrutura operacional para organizar evidencias, bugs e decisao Go/No-Go enquanto o Pique Esconde avanca do MVP tecnico para o teste de campo e piloto fechado.

## Objetivo

Manter a validacao da Fase 0 rastreavel e objetiva:

- registrar o que foi executado;
- classificar falhas por severidade;
- separar bug, risco aceito e decisao pendente;
- impedir avanco para 4-6 pessoas sem evidencia minima;
- proteger privacidade e dados de localizacao.

## Arquivos

- [Template de test-run](test-run-template.md)
- [Template de bug](bug-template.md)
- [Checklist Go/No-Go](go-no-go-checklist.md)
- [Resumo da Fase 0](resumo-fase-0.md)

## Severidade

| Nivel | Nome | Definicao |
| --- | --- | --- |
| S0 | Critico | Impede completar partida, causa perda/corrupcao de dados, falha de seguranca ou vazamento de localizacao. |
| S1 | Alto | Quebra fluxo principal para parte dos usuarios, causa crash recorrente ou nao tem workaround confiavel. |
| S2 | Medio | Degrada funcionalidade importante, mas existe workaround aceitavel. |
| S3 | Baixo | Problema visual, texto, alinhamento ou fluxo secundario. |
| S4 | Observacao | Sugestao ou melhoria sem impacto funcional imediato. |

## Decisao

Go final da Fase 0 exige retorno do teste de campo com 2 jogadores ou decisao explicita aceitando o risco de seguir sem essa evidencia.

Enquanto isso, QA pode emitir apenas:

- `Go tecnico provisorio`
- `No-Go tecnico`
- `Bloqueado aguardando campo`

