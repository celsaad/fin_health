export const SUPPORTED_CURRENCIES = ['USD', 'BRL', 'EUR', 'GBP'] as const;

export function localeCurrency(lang: string): string {
  return lang.startsWith('pt') ? 'BRL' : 'USD';
}
