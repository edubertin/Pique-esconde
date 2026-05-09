# Known Issues and Risks

Registro de bugs conhecidos, riscos aceitos e limitacoes do MVP.

## Como Registrar

```md
## KI-000 - Titulo curto

Status: Aberto | Em analise | Aceito no MVP | Resolvido
Severidade: Alta | Media | Baixa
Area:
Detectado em:
Commit/versao:

Descricao:
- 

Impacto:
- 

Passos para reproduzir:
1. 
2. 
3. 

Comportamento esperado:
- 

Comportamento atual:
- 

Decisao:
- 

Link para test run:
- 
```

## Bugs Conhecidos

Nenhum bug conhecido registrado ainda.

## Riscos do MVP

## R-001 - GPS pode oscilar em ambiente fechado

Status: Aceito no MVP
Severidade: Alta
Area: Localizacao

Descricao:
- GPS e sensores do celular podem ter baixa precisao em ambiente fechado, predios, garagens ou locais com sinal ruim.

Impacto:
- Radar pode indicar direcao ou distancia instavel.
- Captura automatica pode ter falso positivo ou falso negativo.

Decisao:
- O MVP deve recomendar ambiente aberto ou misto.
- O app nao deve prometer funcionamento perfeito em ambiente fechado.

## R-002 - Realtime pode sofrer atraso em rede ruim

Status: Aberto
Severidade: Media
Area: Realtime

Descricao:
- Internet ruim pode atrasar atualizacoes de status, localizacao e captura.

Impacto:
- Lobby pode demorar para atualizar.
- Procurador pode receber sinal atrasado.
- Resultado pode aparecer com atraso entre aparelhos.

Decisao:
- Validar no piloto com celulares reais antes de ajustar arquitetura.

## R-003 - Captura automatica precisa evitar falso positivo

Status: Aberto
Severidade: Alta
Area: Captura

Descricao:
- Captura por proximidade pode disparar cedo demais se uma leitura de GPS vier imprecisa.

Impacto:
- Jogador pode ser capturado sem o procurador estar realmente perto.

Decisao:
- Usar confirmacao por tempo ou leituras consecutivas no MVP.

## R-004 - Card social nao pode vazar localizacao

Status: Aberto
Severidade: Alta
Area: Privacidade

Descricao:
- Card social ajuda divulgacao, mas nao pode expor coordenadas, mapa, rota, endereco ou local real da partida.

Impacto:
- Risco de privacidade e perda de confianca.

Decisao:
- Card deve conter somente logo, placar simples, texto promocional e possivelmente QR code/link da loja no futuro.

