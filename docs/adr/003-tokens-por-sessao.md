# ADR 003 — Tokens por sessão em vez de autenticação permanente

## Status
Aceito

## Contexto
A maioria dos apps exige cadastro e login para identificar usuários. Para um jogo casual e efêmero como esconde-esconde, criar conta é fricção desnecessária — o jogador quer entrar numa sala e jogar, não gerenciar credenciais.

## Decisão
Jogadores recebem um token único por sessão de jogo, sem necessidade de cadastro, login ou persistência de identidade entre partidas.

## Consequências
+ Entrada imediata: scan do QR e já está no jogo
+ Sem dados pessoais armazenados permanentemente
+ Simplifica o backend (sem tabela de usuários, sem auth flow)
- Sem histórico de partidas por jogador
- Impossível reconectar à mesma sessão após fechar o app
- Sem perfil ou ranking persistente entre partidas
