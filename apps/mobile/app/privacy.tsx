import { LegalBullet, LegalPage, LegalParagraph, LegalSection } from '@/src/components/legal-page';

const updatedAt = '10 de maio de 2026';
const contactEmail = 'suporte@eduardobertin.com.br';

export default function PrivacyScreen() {
  return (
    <LegalPage eyebrow="Privacidade" title="Politica de Privacidade" updatedAt={updatedAt}>
      <LegalSection title="Resumo">
        <LegalParagraph>
          O Pique Esconde usa dados temporarios para permitir partidas presenciais de pique-esconde com sala, radar e captura por proximidade. A localizacao e uma mecanica de jogo: ela e usada durante partidas ativas e nao deve ser tratada como historico permanente, mapa de vigilancia ou conteudo social.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Dados que podemos coletar">
        <LegalBullet>Apelido temporario informado para entrar em uma sala.</LegalBullet>
        <LegalBullet>Avatar escolhido entre opcoes pre-prontas.</LegalBullet>
        <LegalBullet>Identificador temporario do jogador dentro da sala.</LegalBullet>
        <LegalBullet>Status de jogo, como entrou, preparado, escondido, procurando ou capturado.</LegalBullet>
        <LegalBullet>Localizacao do proprio jogador durante partidas ativas, incluindo precisao informada pelo aparelho quando disponivel.</LegalBullet>
        <LegalBullet>Eventos tecnicos de partida necessarios para sincronizar sala, rodada, resultado, reconexao, erros e depuracao basica.</LegalBullet>
      </LegalSection>

      <LegalSection title="Dados que evitamos no MVP">
        <LegalBullet>Nao exigimos conta permanente, nome completo, foto pessoal, lista de amigos ou perfil social.</LegalBullet>
        <LegalBullet>Nao exibimos mapa exato dos jogadores escondidos.</LegalBullet>
        <LegalBullet>Nao criamos historico permanente de rotas, trajetos ou enderecos.</LegalBullet>
        <LegalBullet>Nao incluimos GPS, mapa real, rota, endereco ou coordenadas em cards sociais.</LegalBullet>
      </LegalSection>

      <LegalSection title="Como usamos localizacao">
        <LegalParagraph>
          Usamos localizacao apenas para calcular mecanicas da partida: radar de proximidade, pistas derivadas, ponto de esconderijo, validacao de captura e regras de sinal perdido. O procurador recebe pistas aproximadas, como frio, morno, quente, direcao aproximada e confianca do sinal. O app nao deve revelar latitude e longitude de outros jogadores na interface.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Retencao">
        <LegalBullet>Salas sao temporarias e podem expirar quando todos saem ou apos inatividade.</LegalBullet>
        <LegalBullet>Se restar apenas um jogador ativo, a sala pode expirar apos cerca de 6 minutos sem novos jogadores.</LegalBullet>
        <LegalBullet>Salas finalizadas podem permanecer por uma janela curta para resultado, jogar novamente ou compartilhar card sem localizacao.</LegalBullet>
        <LegalBullet>Dados brutos de localizacao devem ser mantidos apenas pelo tempo necessario para operar a partida ativa e limpeza tecnica.</LegalBullet>
        <LegalBullet>Eventos tecnicos podem ser mantidos por curto periodo para depuracao e melhoria do MVP.</LegalBullet>
        <LegalBullet>Dados agregados e anonimos podem ser usados para entender partidas criadas, partidas concluidas e quantidade media de jogadores.</LegalBullet>
      </LegalSection>

      <LegalSection title="Compartilhamento">
        <LegalParagraph>
          Podemos usar provedores de infraestrutura para operar o app, como hospedagem, banco de dados, realtime e servicos necessarios para entregar a experiencia. Esses provedores processam dados para executar o servico. Nao vendemos dados pessoais e nao compartilhamos localizacao de jogadores em cards sociais.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Permissoes do aparelho">
        <LegalParagraph>
          A permissao de localizacao e solicitada para participar ativamente da partida. Quem negar a permissao pode nao conseguir jogar como procurador ou escondido. A precisao do GPS varia por aparelho, navegador, sistema operacional, ambiente fechado, rede e sensores.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Criancas e adolescentes">
        <LegalParagraph>
          O Pique Esconde e uma brincadeira presencial para grupos. Menores devem jogar com permissao e supervisao de responsaveis. Antes de distribuicao ampla em lojas, requisitos legais de idade minima e classificacao indicativa devem ser revisados.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Seus pedidos">
        <LegalParagraph>
          Como o MVP nao usa conta permanente, muitos dados expiram automaticamente com a sala. Para solicitar suporte, exclusao manual de dados remanescentes ou informacoes sobre privacidade, entre em contato por {contactEmail}.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
