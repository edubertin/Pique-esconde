# 02 - Fluxo do Jogo

## Estados Principais

- `lobby`: jogadores entram, ficam prontos e ajustam regras.
- `hiding`: escondidos tem tempo para se esconder.
- `seeking`: procurador usa radar para buscar.
- `finished`: resultado, card social e jogar novamente.

## Lobby

O lobby mostra codigo/link da sala, QR code, lista de jogadores, lider/procurador, status de preparo e regras atuais. O lider so inicia quando todos os nao-lideres estiverem prontos.

Se o lider muda regras no lobby, jogadores que estavam prontos voltam para aguardando e precisam confirmar novamente.

## Rodada

Ao iniciar, o backend cria um snapshot das regras em `pe_game_sessions`. Depois disso, radar, captura, timers e resultado usam a sessao congelada, nao valores editaveis da sala.

## Encerramento

A rodada termina quando todos os escondidos sao capturados ou quando o tempo de busca acaba. O resultado destaca o procurador se ele vencer ou o escondido que ficou mais tempo sem ser capturado se os escondidos vencerem.

## Jogar Novamente

O grupo volta para o lobby da mesma sala. A sala nao precisa ser recriada, e o lider pode ajustar regras ou promover outro procurador.

## Fontes Internas

- [Spec - Game Loop](specs/game-loop.md)
- [Spec - Rooms and Lobby](specs/rooms-and-lobby.md)
- [Realtime Events](technical/realtime-events.md)
