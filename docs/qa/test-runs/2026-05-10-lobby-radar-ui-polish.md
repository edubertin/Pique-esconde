# 2026-05-10 - Lobby and radar UI polish

## Objetivo

Validar o ciclo visual de lobby e radar apos os ajustes finais de interface.

## Mudancas validadas

- Lobby sem botao de voltar no topo.
- Banner do lobby fora do painel branco translucido.
- Caixa de regras clicavel abrindo `/rules`.
- Header `Lobby: CODIGO` com icone de copiar.
- Tabela de jogadores em rosa claro translucido, com linhas compactas.
- Botoes do lobby fora do painel: `Iniciar partida` em uma linha, `Convidar` e `Sair` na linha abaixo.
- Radar com logo maior, painel geral removido, HUD branco translucido com tempo/restantes/barra de calor/status/alvo.
- Botoes do radar alinhados ao padrao: `Capturar` rosa, `Rush final` verde e `Sair` vermelho forte.

## Execucao

Ambiente: Expo web em `http://localhost:8082`.

Fluxo via Playwright:

1. Abrir home.
2. Criar sala.
3. Usar GPS DEV.
4. Confirmar lobby com `Dudu` e `Alvo DEV`.
5. Confirmar ausencia de texto `Voltar`.
6. Confirmar tabela de jogadores.
7. Confirmar botoes `Iniciar partida`, `Convidar` e `Sair`.
8. Clicar na caixa `Regras` e confirmar navegacao para `/rules`.

## Resultado

Passou.

Observacao: o smoke automatizado usa `data-testid="lobby-copy-code"` para o botao de copiar porque o icone nao expoe texto visivel confiavel no web renderer.
