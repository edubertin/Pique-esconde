import { LegalBullet, LegalPage, LegalParagraph, LegalSection } from '@/src/components/legal-page';

const updatedAt = '10 de maio de 2026';
const contactEmail = 'suporte@eduardobertin.com.br';

export default function TermsScreen() {
  return (
    <LegalPage eyebrow="Termos" title="Termos de Uso" updatedAt={updatedAt}>
      <LegalSection title="Aceitacao">
        <LegalParagraph>
          Ao usar o Pique Esconde, voce concorda com estes termos e com a Politica de Privacidade. Se voce nao concordar, nao use o app para participar de partidas.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="O que e o Pique Esconde">
        <LegalParagraph>
          O Pique Esconde e um jogo fisico-digital para grupos presenciais. O app cria salas temporarias, sincroniza jogadores, usa localizacao durante a partida e oferece radar de proximidade sem mostrar mapa exato dos jogadores escondidos.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Uso responsavel e seguranca fisica">
        <LegalBullet>Jogue apenas em locais seguros, permitidos e conhecidos pelo grupo.</LegalBullet>
        <LegalBullet>Nao jogue em ruas movimentadas, transito, trilhos, obras, areas restritas, propriedades privadas sem autorizacao ou locais perigosos.</LegalBullet>
        <LegalBullet>Nao corra olhando fixamente para o celular. Pare em local seguro antes de interagir com a tela.</LegalBullet>
        <LegalBullet>Respeite outras pessoas, moradores, funcionarios, regras do local e autoridades.</LegalBullet>
        <LegalBullet>Responsaveis devem supervisionar menores de idade.</LegalBullet>
      </LegalSection>

      <LegalSection title="Regras de conduta">
        <LegalBullet>Nao use o app para perseguir, assediar, vigiar, intimidar ou monitorar pessoas.</LegalBullet>
        <LegalBullet>Nao tente acessar salas sem convite ou permissao do grupo.</LegalBullet>
        <LegalBullet>Nao tente burlar GPS, simular localizacao indevidamente ou interferir na partida de outras pessoas.</LegalBullet>
        <LegalBullet>Nao compartilhe codigos de sala em locais publicos se o grupo nao quiser receber terceiros.</LegalBullet>
      </LegalSection>

      <LegalSection title="Localizacao e limitacoes tecnicas">
        <LegalParagraph>
          GPS, bussola, internet e sensores podem falhar ou oscilar. O radar e uma pista de jogo, nao um instrumento de navegacao precisa. Capturas, direcao aproximada, sinal quente/frio e distancia podem variar conforme aparelho, sistema, navegador, ambiente e rede.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Salas temporarias">
        <LegalParagraph>
          As salas sao temporarias e podem expirar por saida dos jogadores, inatividade, encerramento da rodada, limpeza tecnica ou regras de manutencao. O app nao garante que uma sala ou resultado fique disponivel permanentemente.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Conteudo e compartilhamento">
        <LegalParagraph>
          O app pode gerar convites e cards sociais de resultado. Esses materiais nao devem incluir GPS, mapa real, rota, endereco ou coordenadas. Voce e responsavel por escolher onde e com quem compartilha convites, codigos de sala e imagens.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Disponibilidade">
        <LegalParagraph>
          O Pique Esconde pode ficar indisponivel, passar por testes, manutencao, ajustes de regras ou mudancas de infraestrutura. O MVP esta em evolucao e pode mudar conforme validacao tecnica e feedback dos jogadores.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Limitacao de responsabilidade">
        <LegalParagraph>
          Use o app com atencao ao ambiente ao seu redor. Na medida permitida pela lei, os responsaveis pelo Pique Esconde nao se responsabilizam por acidentes, lesoes, conflitos, invasao de propriedade, uso indevido do app, falhas de GPS ou problemas causados por descumprimento destes termos.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contato">
        <LegalParagraph>
          Para suporte, privacidade, remocao de dados ou comunicacoes sobre estes termos, entre em contato por {contactEmail}.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
