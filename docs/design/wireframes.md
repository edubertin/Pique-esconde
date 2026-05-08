# Wireframes

Wireframes textuais das telas principais do MVP. O objetivo aqui é definir estrutura, fluxo e ações antes do design visual final.

## 1. Tela Inicial

Objetivo: iniciar uma partida com pouca fricção.

```txt
┌─────────────────────────────┐
│        PIQUE ESCONDE         │
│   Esconda. Marque. Corra.    │
│                              │
│        [ Criar sala ]        │
│                              │
│      [ Entrar com código ]   │
│                              │
│  Use o digital para voltar   │
│      para o mundo físico.    │
└─────────────────────────────┘
```

Elementos:

- Logo/nome.
- Botão principal: criar sala.
- Ação secundária: entrar com código.
- Entrada automática por link de convite.

## 2. Criar Sala

Objetivo: criar sala temporária e definir identidade inicial do jogador.

```txt
┌─────────────────────────────┐
│ Criar sala                   │
│                              │
│ Seu apelido                  │
│ [________________________]   │
│                              │
│ Escolha seu avatar           │
│ [A1] [A2] [A3] [A4]          │
│                              │
│ Você será o procurador       │
│ na primeira rodada.          │
│                              │
│ Localização será necessária  │
│ para jogar.                  │
│                              │
│        [ Criar sala ]        │
└─────────────────────────────┘
```

Elementos:

- Campo de apelido.
- Quatro avatares iniciais.
- Aviso de papel: criador começa como procurador.
- Aviso de localização.

## 3. Entrar na Sala

Objetivo: permitir entrada por código ou link.

```txt
┌─────────────────────────────┐
│ Entrar na sala               │
│                              │
│ Código da sala               │
│ [____ ____]                  │
│                              │
│ Seu apelido                  │
│ [________________________]   │
│                              │
│ Escolha seu avatar           │
│ [A1] [A2] [A3] [A4]          │
│                              │
│        [ Entrar ]            │
└─────────────────────────────┘
```

Elementos:

- Código preenchido automaticamente quando vier por link.
- Apelido.
- Avatar.
- Entrada sem login completo.

## 4. Permissão de Localização

Objetivo: explicar claramente por que a localização é necessária.

```txt
┌─────────────────────────────┐
│ Localização da partida       │
│                              │
│ O Pique Esconde usa sua      │
│ localização apenas durante   │
│ a partida para calcular      │
│ radar e capturas.            │
│                              │
│ Não mostramos seu ponto      │
│ exato e não compartilhamos   │
│ GPS em redes sociais.        │
│                              │
│      [ Permitir localização ]│
│      [ Agora não ]           │
└─────────────────────────────┘
```

Regras:

- Quem negar localização não participa como jogador ativo.
- Pode voltar e permitir depois.

## 5. Lobby

Objetivo: reunir o grupo, mostrar limite e preparar a partida.

```txt
┌─────────────────────────────┐
│ Sala ABCD        4/8         │
│ [ Compartilhar link ]        │
│                              │
│ Procurador                   │
│ [A1] Dudu        Líder       │
│                              │
│ Jogadores                    │
│ [A2] Ana         Preparada   │
│ [A3] Rafa        Aguardando  │
│ [A4] Bia         Preparada   │
│                              │
│ [ Preparado ]                │
│                              │
│ Líder:                       │
│ [ Regras ]  [ Iniciar ]      │
│ [ Sair da sala ]             │
└─────────────────────────────┘
```

Elementos:

- Código da sala.
- Contador `4/8`.
- Compartilhar link.
- Lista com avatar, apelido e status.
- Botão preparado.
- Ações do líder: regras e iniciar.
- Botão sair da sala.

## 6. Configurar Regras

Objetivo: ajustar a partida sem complexidade.

```txt
┌─────────────────────────────┐
│ Regras da partida            │
│                              │
│ Tempo para esconder          │
│ [ 60s ]                      │
│                              │
│ Tempo para procurar          │
│ [ 3min ]                     │
│                              │
│ Ambiente                     │
│ [ Padrão ]                   │
│                              │
│ Captura automática           │
│ Raio inicial de teste: 8m    │
│                              │
│        [ Salvar regras ]     │
└─────────────────────────────┘
```

Elementos:

- Tempo para esconder, máximo inicial 60s.
- Tempo para procurar, padrão 3min.
- Ambiente padrão no MVP.
- Resumo da captura automática.

## 7. Tempo de Esconder

Objetivo: separar experiência do procurador e escondidos.

### Escondido

```txt
┌─────────────────────────────┐
│ Vá se esconder               │
│                              │
│            00:42             │
│                              │
│ Quando estiver pronto:       │
│     [ Estou escondido ]      │
│                              │
│ O procurador será liberado   │
│ quando todos estiverem       │
│ escondidos ou o tempo acabar.│
└─────────────────────────────┘
```

### Procurador

```txt
┌─────────────────────────────┐
│ Aguarde                      │
│                              │
│ Escondidos se posicionando   │
│                              │
│ 3 de 4 escondidos prontos    │
│                              │
│ Você será liberado quando    │
│ todos marcarem escondido     │
│ ou o tempo acabar.           │
└─────────────────────────────┘
```

## 8. Radar do Procurador

Objetivo: guiar a busca sem mostrar mapa exato.

```txt
┌─────────────────────────────┐
│ Procurando        02:18      │
│ Restam: 3                    │
│                              │
│          ┌─────────┐         │
│          │  RADAR  │         │
│          │  /  •   │         │
│          └─────────┘         │
│                              │
│ Sinal: morno                 │
│ Direção: aproximada          │
│                              │
│ [A2] Ana      solta          │
│ [A3] Rafa     solto          │
│ [A4] Bia      capturada      │
└─────────────────────────────┘
```

Comportamento:

- Radar circular.
- Ponteiro pode oscilar.
- Som/vibração aumentam com proximidade.
- Sinal fica mais confiante quando o procurador está perto.
- Sem mapa exato.

## 9. Tela do Escondido Durante a Busca

Objetivo: informar sem dar vantagem excessiva.

```txt
┌─────────────────────────────┐
│ Continue escondido           │
│                              │
│ Tempo restante: 02:18        │
│                              │
│ Status: procurador liberado  │
│                              │
│ Alerta: radar aumentando     │
│                              │
│ Você vence se não for pego   │
│ até o fim do tempo.          │
└─────────────────────────────┘
```

Elementos:

- Tempo restante.
- Status da fase.
- Alertas de radar/rush final.
- Sem posição do procurador.

## 10. Captura

Objetivo: feedback rápido e claro para os dois lados.

### Procurador

```txt
┌─────────────────────────────┐
│ Captura!                     │
│                              │
│ [A3] Rafa foi encontrado     │
│                              │
│ Restam: 2                    │
│                              │
│        [ Continuar ]         │
└─────────────────────────────┘
```

### Escondido

```txt
┌─────────────────────────────┐
│ Você foi encontrado          │
│                              │
│ [A3] Rafa                    │
│                              │
│ Aguarde o fim da rodada      │
│ ou acompanhe o resultado.    │
└─────────────────────────────┘
```

Comportamento:

- Captura automática por proximidade.
- Feedback visual, som e vibração.
- Jogador capturado sai da lista ativa de escondidos.

## 11. Rush Final

Objetivo: criar tensão nos últimos segundos.

```txt
┌─────────────────────────────┐
│ RUSH FINAL        00:18      │
│                              │
│ Radar no máximo              │
│                              │
│          ┌─────────┐         │
│          │ RADAR!! │         │
│          │  / / •  │         │
│          └─────────┘         │
│                              │
│ Restam: 1                    │
└─────────────────────────────┘
```

Comportamento:

- Raio do procurador aumenta bastante.
- Feedback mais intenso.
- Deve parecer divertido, não técnico.

## 12. Resultado

Objetivo: fechar a rodada e incentivar nova partida.

```txt
┌─────────────────────────────┐
│ Resultado                    │
│                              │
│ Escondidos venceram          │
│                              │
│ Sobreviveram                 │
│ [A2] Ana                     │
│                              │
│ Capturados                   │
│ [A3] Rafa  [A4] Bia          │
│                              │
│ [ Jogar novamente ]          │
│ [ Trocar procurador ]        │
│ [ Compartilhar resultado ]   │
│ [ Sair da sala ]             │
└─────────────────────────────┘
```

Elementos:

- Vencedor.
- Sobreviventes.
- Capturados.
- Jogar novamente.
- Trocar procurador manualmente.
- Compartilhar card social.
- Sair da sala.

## 13. Card Social

Objetivo: divulgar o jogo sem expor localização.

```txt
┌─────────────────────────────┐
│        PIQUE ESCONDE         │
│                              │
│    Sobrevivi ao Pique        │
│        Esconde               │
│                              │
│ [A2] Ana                     │
│                              │
│ Placar: 1 sobrevivente       │
│ Tempo: 3min                  │
│                              │
│ Disponível na loja           │
│ [ QR / link ]                │
└─────────────────────────────┘
```

Regras:

- Não incluir GPS.
- Não incluir mapa real.
- Não incluir rota.
- Não incluir endereço.
- Não incluir coordenadas.
