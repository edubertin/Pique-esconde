# Test Runs

Esta pasta guarda relatorios de execucao de testes manuais, exploratorios ou revisoes feitas por agentes de IA.

## Convencao de Nome

Use o formato:

```txt
YYYY-MM-DD-area-ambiente.md
```

Exemplos:

```txt
2026-05-08-lobby-web.md
2026-05-08-radar-expo-android.md
2026-05-08-regressao-geral.md
```

## Modelo de Relatorio

```md
# Test Run - Titulo

Data:
Responsavel:
Tipo: Manual | Agente IA | Exploratorio | Regressao
Ambiente:
Dispositivo:
Sistema:
Commit:

## Objetivo

- 

## Escopo Testado

- 

## Casos Executados

| Caso | Resultado | Observacoes |
| --- | --- | --- |
| TC-000 | Passou/Falhou/Bloqueado |  |

## Evidencias

- Screenshots:
- Videos:
- Logs:

## Bugs Encontrados

- 

## Riscos ou Duvidas

- 

## Decisao Final

Status: Aprovado | Reprovado | Parcial | Bloqueado

Resumo:
- 
```

## Orientacoes

- Registre o que foi realmente executado.
- Nao marque como aprovado algo que foi apenas lido.
- Quando houver falha, descreva passo, esperado, obtido e impacto.
- Se a falha for relevante para o futuro, copie para `docs/qa/known-issues.md`.

