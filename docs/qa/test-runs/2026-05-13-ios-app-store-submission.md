# 2026-05-13 - iOS App Store Submission

## Objetivo

Registrar a geracao, envio e submissao da primeira build iOS do Pique Esconde para revisao da Apple.

## Contexto

- Plataforma: iOS.
- Bundle ID: `com.eduardobertin.piqueesconde`.
- App Store Connect Apple ID: `6768520532`.
- Versao: `1.0.2`.
- Build number: `1`.
- Perfil EAS: `production`.
- Distribuicao: `STORE`.

## Evidencias

- Build EAS concluida com sucesso.
- Build EAS ID: `3796080a-2af9-46db-8036-24965b0049ab`.
- Artefato gerado: IPA de producao para App Store.
- Envio ao App Store Connect/TestFlight concluido com sucesso.
- App colocado em revisao na Apple em 2026-05-13, conforme confirmacao manual no App Store Connect.

## Configuracoes Confirmadas

- `ios.config.usesNonExemptEncryption`: `false`.
- Texto de permissao de localizacao em pt-BR explica radar/captura e que a posicao exata nao e exibida em mapa para outros jogadores.
- App Privacy configurado com:
  - Localizacao precisa: funcionalidade do app, vinculada ao usuario, sem rastreamento.
  - Conteudos de jogos: funcionalidade do app, vinculados ao usuario, sem rastreamento.
  - ID de usuario: funcionalidade do app, vinculado ao usuario, sem rastreamento.
- Politica de privacidade: `https://pique-esconde.eduardobertin.com.br/privacy`.
- Classificacao etaria calculada: `4+`.
- Direitos de conteudo: app nao contem, exibe ou acessa conteudo de terceiros.
- Preco inicial: gratis.

## Resultado

Status: Submetido para revisao da Apple.

## Pendencias

- Aguardar resultado da revisao da Apple.
- Testar a build em TestFlight/iPhone real quando estiver disponivel.
- Se a Apple rejeitar, registrar o motivo e corrigir apenas o necessario.
- Para nova build iOS, incrementar `ios.buildNumber` antes de enviar.
