import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

const STORAGE_KEY = 'preferredLanguage';

function resolveLocale(raw: string): string {
  if (raw.startsWith('pt')) return 'pt-BR';
  return 'en';
}

function getDeviceLocale(): string {
  try {
    return resolveLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: getDeviceLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Override with saved user preference once AsyncStorage resolves.
// Components re-render automatically via useTranslation when changeLanguage is called.
AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved && saved !== i18n.language) {
    i18n.changeLanguage(saved);
  }
});

export default i18n;
