# 04 - Lobby e Convites

## Entrada na Sala

Jogadores entram com apelido simples, avatar pre-pronto e permissao de localizacao para participar ativamente.

## Convites

O lobby oferece:

- codigo curto da sala;
- copiar codigo;
- link de convite;
- QR code em tela cheia com logo;
- acao nativa de compartilhar quando disponivel.

O link usa `EXPO_PUBLIC_WEB_BASE_URL` quando configurado. Em producao, o valor esperado e:

```txt
https://pique-esconde.eduardobertin.com.br
```

## Sala Temporaria

Salas continuam ativas enquanto houver jogadores e podem expirar por inatividade. Se restar apenas um jogador ativo, a sala pode expirar apos cerca de 6 minutos sem novos jogadores.

## Cuidados

Codigos e links de sala devem ser compartilhados apenas com o grupo desejado. O app nao deve ser usado para convidar desconhecidos para encontros fisicos sem combinacao previa.

## Fontes Internas

- [Spec - Rooms and Lobby](specs/rooms-and-lobby.md)
- [Invite Link Utility](../apps/mobile/src/utils/invite-link.ts)
- [QR Modal](../apps/mobile/src/components/room-qr-modal.tsx)
