import i18n from 'i18next';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

i18n.init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const t = i18n.t.bind(i18n);
export default i18n;
