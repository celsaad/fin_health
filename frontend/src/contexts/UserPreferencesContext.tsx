import { createContext, useContext, useState } from 'react';
import { localeCurrency } from '@/lib/currency';

const CURRENCY_KEY = 'preferredCurrency';

function initialCurrency(): string {
  const saved = localStorage.getItem(CURRENCY_KEY);
  if (saved) return saved;
  const lang = localStorage.getItem('preferredLanguage') || navigator.language || 'en';
  return localeCurrency(lang);
}

interface UserPreferences {
  currency: string;
  setCurrency: (c: string) => void;
}

const UserPreferencesContext = createContext<UserPreferences>({
  currency: 'USD',
  setCurrency: () => {},
});

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState(initialCurrency);

  function setCurrency(c: string) {
    localStorage.setItem(CURRENCY_KEY, c);
    setCurrencyState(c);
  }

  return (
    <UserPreferencesContext.Provider value={{ currency, setCurrency }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}
