import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import ptBR from '@/locales/pt-BR.json';

const STORAGE_KEY = 'preferredLanguage';

function resolveLocale(raw: string): string {
  if (raw.startsWith('pt')) return 'pt-BR';
  return 'en';
}

const saved = localStorage.getItem(STORAGE_KEY);
const detected = resolveLocale(navigator.language);
const lng = saved || detected;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Sync the resolved currency to the backend (best-effort, no await)
import('@/lib/api').then(({ default: api }) => {
  const localeCurrency = lng.startsWith('pt') ? 'BRL' : 'USD';
  api.patch('/auth/me', { currency: localeCurrency }).catch(() => {});
});

export default i18n;
