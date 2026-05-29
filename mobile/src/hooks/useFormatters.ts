import { useTranslation } from 'react-i18next';
import {
  formatCurrency as _formatCurrency,
  formatAmount as _formatAmount,
  formatDate as _formatDate,
  formatPercent as _formatPercent,
  getMonthName as _getMonthName,
  getShortMonthName as _getShortMonthName,
} from '@fin-health/shared/format';

// Currency is not yet user-configurable on mobile; derive a sensible default from locale.
function defaultCurrency(locale: string): string {
  if (locale.startsWith('pt')) return 'BRL';
  return 'USD';
}

export function useFormatters() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const currency = defaultCurrency(locale);

  return {
    formatCurrency: (amount: number) => _formatCurrency(amount, currency, locale),
    formatAmount: (amount: number, type: string) => _formatAmount(amount, type, currency, locale),
    formatDate: (dateStr: string) => _formatDate(dateStr, locale),
    formatPercent: (value: number, decimals?: number) => _formatPercent(value, decimals, locale),
    getMonthName: (month: number) => _getMonthName(month, locale),
    getShortMonthName: (month: number) => _getShortMonthName(month, locale),
  };
}
