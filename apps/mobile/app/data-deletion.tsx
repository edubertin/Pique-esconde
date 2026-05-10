import { LegalBullet, LegalPage, LegalParagraph, LegalSection } from '@/src/components/legal-page';

const updatedAt = '10 de maio de 2026';
const contactEmail = 'suporte@eduardobertin.com.br';

export default function DataDeletionScreen() {
  return (
    <LegalPage eyebrow="Dados" title="Exclusao de Dados" updatedAt={updatedAt}>
      <LegalSection title="Resumo">
        <LegalParagraph>
          O Pique Esconde MVP nao usa conta permanente. A experiencia funciona com salas temporarias, apelido, avatar, estado da partida e localizacao usada durante rodadas ativas. Muitos dados expiram automaticamente quando a sala termina, fica inativa ou passa por limpeza tecnica.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Como pedir exclusao">
        <LegalParagraph>
          Para solicitar exclusao manual de dados remanescentes associados a uma sala ou partida, envie email para {contactEmail}. Inclua o codigo da sala, data aproximada, apelido usado e uma descricao do pedido. Nao envie documentos sensiveis se nao forem solicitados.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="O que pode ser excluido">
        <LegalBullet>Dados temporarios de sala e jogador, quando ainda existirem.</LegalBullet>
        <LegalBullet>Eventos tecnicos de partida dentro da janela de retencao.</LegalBullet>
        <LegalBullet>Dados de localizacao temporaria ainda presentes em registros operacionais.</LegalBullet>
      </LegalSection>

      <LegalSection title="O que pode nao existir mais">
        <LegalParagraph>
          Como o produto foi desenhado para usar o minimo de dados pelo menor tempo possivel, a sala, localizacao e eventos podem ja ter sido apagados automaticamente antes do atendimento manual.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Dados agregados">
        <LegalParagraph>
          Informacoes agregadas e anonimas, como quantidade de partidas criadas ou concluidas, podem ser mantidas para melhorar o produto quando nao identificarem pessoas, rotas, enderecos ou coordenadas.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
