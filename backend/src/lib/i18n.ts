import i18n from 'i18next';
import en from '../locales/en.json';

i18n.init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const t = i18n.t.bind(i18n);
export default i18n;
