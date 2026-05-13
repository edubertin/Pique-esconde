import { LegalBullet, LegalPage, LegalParagraph, LegalSection } from '@/src/components/legal-page';
import { t } from '@/src/i18n';

export default function HowToPlayScreen() {
  return (
    <LegalPage eyebrow={t('howToPlay.badge')} title={t('howToPlay.title')}>
      <LegalSection title="Objetivo">
        <LegalParagraph>{t('howToPlay.objective')}</LegalParagraph>
      </LegalSection>
      <LegalSection title="Radar">
        <LegalParagraph>{t('howToPlay.radar')}</LegalParagraph>
      </LegalSection>
      <LegalSection title="Localização">
        <LegalParagraph>{t('howToPlay.gps')}</LegalParagraph>
      </LegalSection>
      <LegalSection title="Segurança">
        <LegalParagraph>{t('howToPlay.safety')}</LegalParagraph>
      </LegalSection>
      <LegalSection title="Como começar">
        <LegalParagraph>{t('howToPlay.start')}</LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
