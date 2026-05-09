# Test Run - Base GPS/Radar Web + Mobile

Data: 2026-05-09
Responsaveis: Usuario + Codex/Arquiteto
Tipo: Manual exploratorio
Ambiente: Expo web em `localhost:8082`, Supabase dev, HTTPS tunnel `https://pique-esconde-58865.loca.lt`
Base testada ate: `07a460a`

## Objetivo

Validar a primeira base real de GPS/radar depois da camada de salas, lobby, rodada e resultado.

## Cenarios testados

### Tunnel HTTPS

Resultado: Parcialmente aprovado

- URL HTTPS serviu o app no celular.
- URL antiga de tunnel ficou instavel/408 e foi substituida.
- Conclusao: mobile web deve usar HTTPS/tunnel ou build nativo.

### Permissao de GPS no celular

Resultado: Parcialmente aprovado

- O celular conseguiu validar permissao/primeira leitura em origem HTTPS.
- Em origem local/IP HTTP, o navegador bloqueou ou nao mostrou popup corretamente.
- O app foi ajustado para nao tratar permissao pendente como negacao final imediatamente.

### Lobby com permissao

Resultado: Aprovado com ressalvas

- Jogador sem permissao nao deve entrar em acao ativa da partida.
- `Preparado` e `Iniciar partida` levam para permissao quando necessario.
- Ainda precisa reteste completo em dois celulares reais.

### Esconderijo com GPS recente

Resultado: Parcial

- Botao `Estou escondido` aguarda GPS.
- Supabase exige leitura recente para salvar esconderijo.
- Em desktop/web sem sensor real pode ficar aguardando sinal.

### Radar do procurador

Resultado: Parcial

- Radar recebe dados derivados e ferramenta DEV consegue simular distancia.
- Direcao/instabilidade visual ainda precisam calibracao.
- Desktop com GPS real nao e confiavel; usar DEV no procurador durante testes de bancada.

### Captura

Resultado: Parcial

- Captura automatica funcionou em teste quando a distancia simulada ficou em 0m.
- Precisa validar janela de confirmacao, falso positivo e falso negativo em campo.

### Navegacao e loops

Resultado: Ajustado, precisa reteste

- Houve erro `history.replaceState()` por repeticao de `router.replace`.
- Foi criado `useSafeRouter` para evitar replacements repetidos.
- Precisa reteste prolongado no celular depois de reload limpo.

## Bugs/observacoes

- Celular em web precisa HTTPS para GPS.
- Dois browsers no mesmo PC nao simulam bem dois GPS reais.
- Procurador no desktop deve usar DEV GPS para teste logico.
- O radar ainda pode mostrar instabilidade por tempo demais.
- Mensagens de debug nao devem aparecer para jogador comum em build final.

## Decisao

A base da base esta pronta para limpeza e QA pesado. Nao iniciar nova camada grande antes de estabilizar GPS/radar/captura.
