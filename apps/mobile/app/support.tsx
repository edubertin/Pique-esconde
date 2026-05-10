import { LegalBullet, LegalPage, LegalParagraph, LegalSection } from '@/src/components/legal-page';

const updatedAt = '10 de maio de 2026';
const contactEmail = 'suporte@eduardobertin.com.br';

export default function SupportScreen() {
  return (
    <LegalPage eyebrow="Suporte" title="Suporte" updatedAt={updatedAt}>
      <LegalSection title="Contato">
        <LegalParagraph>
          Para ajuda com o Pique Esconde, envie uma mensagem para {contactEmail}. Inclua, se possivel, o tipo de aparelho, sistema operacional, navegador ou versao do app, horario aproximado do problema e uma descricao do que aconteceu.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Problemas comuns">
        <LegalBullet>Se o GPS nao atualizar, verifique permissao de localizacao, conexao, modo economia de bateria e tente ficar em area aberta.</LegalBullet>
        <LegalBullet>Em navegador mobile, a localizacao pode atualizar menos que em app nativo. Para testes reais, prefira Expo Go ou build instalado quando disponivel.</LegalBullet>
        <LegalBullet>Se o link de convite nao preencher o codigo, copie o codigo da sala e use Entrar com codigo.</LegalBullet>
        <LegalBullet>Se uma sala expirou, crie uma nova sala e convide o grupo novamente.</LegalBullet>
      </LegalSection>

      <LegalSection title="Seguranca durante a partida">
        <LegalParagraph>
          O jogo acontece no mundo fisico. Escolha um local seguro, aberto ou misto, combinado pelo grupo. Nao jogue em areas perigosas, privadas sem autorizacao ou proximas ao transito. Se precisar olhar o celular, pare em local seguro.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Privacidade e dados">
        <LegalParagraph>
          Para perguntas sobre privacidade, localizacao, remocao de dados temporarios ou solicitacoes relacionadas a dados, use o mesmo email de suporte. O MVP nao possui conta permanente; salas e dados de partida sao temporarios e podem expirar automaticamente.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Relatar abuso">
        <LegalParagraph>
          Se alguem estiver usando o app para perseguir, constranger, vigiar ou incomodar pessoas, pare de jogar, saia da sala e entre em contato pelo suporte. O Pique Esconde nao deve ser usado para monitoramento ou assedio.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
