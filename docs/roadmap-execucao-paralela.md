# Plano de Execucao Paralela - Fase 0

Documento operacional para manter o Pique Esconde avancando enquanto o teste de campo com 2 jogadores ainda nao retornou evidencias.

Responsavel principal: Product Owner.

Validadores:

- Product Manager: protege foco estrategico e evita feature prematura.
- System Architect: valida riscos tecnicos, Supabase, GPS, realtime e privacidade.
- QA Engineer: valida gates, severidade, evidencias e Go/No-Go.

## Regra de Ouro

Avancar somente no que reduz risco operacional, privacidade, estabilidade e preparo de teste.

Nao alterar a hipotese central do gameplay antes do campo:

- O radar orienta sem mostrar posicao exata.
- A captura automatica parece justa.
- O grupo entende o uso de GPS.
- O grupo consegue jogar e quer repetir.

## Pode Avancar Agora

| Trilho | Dono | Prioridade | Trabalho liberado |
| --- | --- | --- | --- |
| QA e Gate Fase 0 | QA Engineer | Must | Templates de test-run, severidade, evidencias, Go/No-Go e resumo Fase 0 |
| Estabilidade sala/lobby | Developer + Product Owner | Must | Refresh, reconexao, duplicacao, rematch, snapshot, resultado e saida |
| Privacidade e seguranca | System Architect + Product Owner | Must | Card social, microcopy de GPS, rotas legais, ausencia de coordenadas e hardening de grants |
| Cron e operacao | System Architect + QA Engineer | Must | Confirmar Supabase Cron/tick, runbook de verificacao e falhas recentes |
| Convite e entrada | Product Owner + Developer | Should | Link, codigo, QR, share e reducao de explicacao manual |
| Observabilidade minima | System Architect + Product Manager | Should | Eventos agregados sem lat/lng, rota, endereco, token ou nome real |
| Preparacao de piloto | Product Owner + QA Engineer | Should | Roteiro 4-6 pessoas, formulario leve e checklist operacional |

## Deve Esperar o Campo

- Calibragem fina de frio, morno, quente, ruido, suavizacao e direcao.
- Mudanca no raio ou tempo de captura, atualmente 5m/2s, salvo bug evidente.
- Haptics, som, rush final, animacoes e polish emocional.
- Tutorial maior ou onboarding longo.
- Novas mecanicas como zona segura, espectador, ranking, perfil, chat ou matchmaking.
- Mudanca grande de arquitetura realtime antes de confirmar problema em celular real.
- Piloto com 4-6 pessoas antes do gate da Fase 0.
- Beta Android antes do gate do piloto fechado.

## Ordem Executavel

1. `E1-H2` - Classificacao de bugs por severidade.
   - Dono: QA Engineer.
   - Fazer agora.
   - Motivo: permite decidir quando o teste de campo voltar.

2. `E5-H1` - Confirmar Supabase Cron/tick no ambiente de teste.
   - Dono: System Architect.
   - Fazer agora.
   - Motivo: timers, expiracao, perda de sinal e limpeza nao podem depender de sorte.

3. `TECH-P0-01` - Auditar RLS/grants e RPCs de manutencao.
   - Dono: System Architect.
   - Fazer agora.
   - Motivo: `pe_cleanup_expired_state()` nao deve ficar exposta para `anon` em piloto/prod.

4. `TECH-P0-02` - Isolar RPCs DEV em ambiente de piloto/prod.
   - Dono: System Architect + Developer.
   - Fazer agora.
   - Motivo: UI escondida por `__DEV__` nao e barreira de seguranca.

5. `E3-H2` - Refresh/queda sem duplicar ou perder sala.
   - Dono: Developer.
   - Fazer agora.
   - Motivo: risco conhecido de PWA/lobby e duplicacao.

6. `E3-H3` - Jogar novamente sem recriar sala.
   - Dono: Developer.
   - Fazer agora.
   - Motivo: rematch e central para provar diversao e repeticao.

7. `E4-H2` - Card social sem localizacao.
   - Dono: Product Owner + QA Engineer.
   - Fazer agora.
   - Motivo: gate absoluto de privacidade.

8. `LEGAL-P0-01` - Validar rotas legais publicas.
   - Dono: System Architect + Product Owner.
   - Fazer agora.
   - Motivo: `/privacy`, `/terms`, `/support` e `/data-deletion` precisam abrir em HTTPS publico.

9. `E1-H1` - Roteiro de campo com 2 celulares reais.
   - Dono: QA Engineer.
   - Status: preparado em `docs/qa/field-test-2-players.md`.
   - Execucao depende das 2 pessoas em campo.

10. `E3-H1` - Entrada por link, codigo, QR ou share.
    - Dono: Product Owner + Developer.
    - Fazer agora como reducao de atrito.
    - Medir eficacia depois do campo.

11. `E4-H1` - Microcopy de localizacao e seguranca.
    - Dono: Product Owner.
    - Fazer agora.
    - Campo valida se foi compreendida.

12. `E5-H2` - Metricas agregadas sem localizacao sensivel.
    - Dono: Product Manager + System Architect.
    - Desenhar agora; implementar com cuidado.
    - Eventos sugeridos: sala criada, jogador entrou, permissao concedida/negada, rodada iniciada, escondido confirmado, captura confirmada, resultado visto, rematch acionado e erro por categoria.

13. `E6-H1` e `E6-H2` - Piloto 4-6 pessoas e percepcao de justica.
    - Dono: Product Owner + QA Engineer.
    - Preparar agora.
    - Execucao bloqueada ate Fase 0 aprovada.

## Trilho Tecnico P0

Ordem recomendada pelo System Architect:

1. Hardening de grants/RLS e manutencao server-side.
2. Isolamento ou remocao de RPCs DEV em piloto/prod.
3. Confirmacao de Cron/tick no ambiente alvo.
4. Gate operacional de GPS antes da partida.
5. Validacao de rotas legais publicas.
6. Observabilidade minima sem dados sensiveis.

Checklist tecnico:

- [ ] `anon` nao executa manutencao server-side critica.
- [ ] `anon` nao executa RPCs DEV em piloto/prod.
- [ ] Snapshots nao retornam lat/lng, rota, endereco ou token.
- [ ] Card social nao contem localizacao sensivel.
- [ ] Cron/tick tem historico de execucao recente.
- [ ] Rotas legais abrem fora de uma sala.
- [ ] Eventos agregados nao guardam coordenadas nem identificador permanente.

## Trilho de QA

Pode avancar ate Go tecnico provisorio.

Go final depende do retorno do teste de campo ou de decisao explicita aceitando o risco.

Atividades:

- Criar template de test-run Fase 0.
- Padronizar severidade.
- Definir evidencias esperadas.
- Organizar resumo Fase 0.
- Executar smoke interno sem screenshots por padrao.
- Registrar pendencias do teste de campo.

Severidades:

- `S0`: sistema inutilizavel, perda/corrupcao de dados, falha de seguranca, bloqueio total do fluxo principal ou vazamento de localizacao.
- `S1`: fluxo principal falha para parte dos usuarios, crash recorrente ou erro sem workaround confiavel.
- `S2`: funcionalidade importante degradada com workaround aceitavel.
- `S3`: problema visual, texto, alinhamento ou fluxo secundario.
- `S4`: observacao ou melhoria sem impacto funcional imediato.

## Gate Quando o Teste 2P Voltar

Aprovado para preparar 4-6 pessoas se:

- Pelo menos 1 rodada completa foi concluida.
- Lobby sincronizou nos dois aparelhos.
- Radar foi util ou ao menos compreensivel.
- Captura foi compreensivel.
- Resultado e rematch funcionaram.
- Nao houve vazamento de localizacao.

Repetir 2P se:

- Houve bug alto em lobby, GPS, captura, resultado ou rematch.
- Houve duplicacao, refresh manual obrigatorio ou estado confuso com workaround.

Bloquear se:

- Qualquer fluxo expos GPS, mapa, rota, endereco ou coordenadas.
- Bug impediu completar partida.
- Jogador ficou preso sem saida clara.
- Cron/tick ou sala ficaram em estado irrecuperavel.

## Metricas de Foco

- Tempo ate primeira partida iniciada: alvo abaixo de 3 minutos.
- Conclusao de rodada no piloto fechado: alvo 80%+.
- Rematch espontaneo: alvo 60%+.
- Capturas percebidas como injustas: abaixo de 10%.
- Vazamento de localizacao: tolerancia zero.
- Intervencao manual necessaria: deve cair a cada rodada de teste.

## Nao Fazer Agora

- Nao abrir feature grande.
- Nao calibrar radar/captura por opiniao interna.
- Nao trocar 5m/2s sem evidencia de campo, salvo bug evidente.
- Nao criar login completo, ranking, chat, mapa exato ou matchmaking.
- Nao publicar beta antes dos gates.
- Nao registrar coordenadas, rotas, enderecos, tokens ou nomes reais em metricas/logs.
