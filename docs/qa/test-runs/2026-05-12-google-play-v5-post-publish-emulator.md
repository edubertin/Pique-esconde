# 2026-05-12 - Google Play v5 pos-publicacao no emulador

## Objetivo

Confirmar que a versao `1.0.2 (5)` enviada ao Google Play aparece corretamente para teste e pode ser instalada pela Play Store no emulador.

## Contexto

- AAB gerado pelo EAS: `pique-esconde-1.0.2-v5-production.aab`.
- Build EAS: `ca9004fb-782e-4e93-b63f-857eecb36153`.
- Versao esperada: `versionName=1.0.2`, `versionCode=5`.
- Upload foi feito manualmente pelo Google Play Console, porque `eas submit` ficou bloqueado por falta de Google Service Account em modo nao interativo.
- Status informado pelo Eduardo: projeto em analise no Google.

## Execucao

1. Abri a Play Store no emulador com:

```powershell
adb shell am start -a android.intent.action.VIEW -d "market://details?id=com.eduardobertin.piqueesconde"
```

2. A Play mostrou a nova versao com botao `Update` e notas de release da `1.0.2`.

3. A tentativa de atualizar por cima da instalacao local falhou.

Motivo encontrado no log:

```text
com.eduardobertin.piqueesconde is installed but certificate mismatch
```

4. Com autorizacao do usuario, desinstalei apenas o app local do emulador:

```powershell
adb uninstall com.eduardobertin.piqueesconde
```

5. Reabri a Play Store, instalei pela Play e confirmei a versao instalada.

## Resultado

Versao instalada via Play Store:

```text
versionCode=5
versionName=1.0.2
installerPackageName=com.android.vending
```

Smoke de abertura:

- App abriu.
- Home carregou corretamente.
- Elementos vistos: `Criar sala`, `Entrar com codigo`, `Como jogar`, `Privacidade`, `Termos`, `Suporte`.

## Observacoes

- A falha inicial nao foi da build nova; era incompatibilidade de assinatura entre instalacao local anterior e pacote assinado pela Play/EAS.
- Depois de remover a instalacao local, a instalacao pela Play passou.
- Usuario reportou que testou e deu certo.
- Estado atual do projeto: em analise pelo Google.

## Decisao

Status: aprovado para a etapa atual de teste interno/analise Google.

Proximo passo: aguardar conclusao da analise do Google e, quando disponivel para os testadores, repetir o roteiro completo em dispositivo real.
