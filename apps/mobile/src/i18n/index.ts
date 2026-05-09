import { enUS } from './en-US';
import { ptBR } from './pt-BR';

export type Locale = 'pt-BR' | 'en-US';
export type TranslationKey = keyof typeof ptBR;

type Params = Record<string, number | string>;
type TranslationDictionary = Record<TranslationKey, string>;

const dictionaries = {
  'pt-BR': ptBR,
  'en-US': enUS,
} satisfies Record<Locale, TranslationDictionary>;

const activeLocale: Locale = 'pt-BR';

export function getLocale(): Locale {
  return activeLocale;
}

export function t(key: TranslationKey, params?: Params): string {
  const template = dictionaries[activeLocale][key] ?? ptBR[key] ?? key;

  if (!params) {
    return template;
  }

  let text = template;
  Object.entries(params).forEach(([paramKey, value]) => {
    text = text.split(`{${paramKey}}`).join(String(value));
  });
  return text;
}
