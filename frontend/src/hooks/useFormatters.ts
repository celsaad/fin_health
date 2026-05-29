import { useTranslation } from 'react-i18next';
import {
  formatCurrency as _formatCurrency,
  formatAmount as _formatAmount,
  formatDate as _formatDate,
  formatPercent as _formatPercent,
  getMonthName as _getMonthName,
  getShortMonthName as _getShortMonthName,
} from '@fin-health/shared/format';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export function useFormatters() {
  const { i18n } = useTranslation();
  const { currency } = useUserPreferences();
  const locale = i18n.language;

  return {
    formatCurrency: (amount: number) => _formatCurrency(amount, currency, locale),
    formatAmount: (amount: number, type: string) => _formatAmount(amount, type, currency, locale),
    formatDate: (dateStr: string) => _formatDate(dateStr, locale),
    formatPercent: (value: number, decimals?: number) => _formatPercent(value, decimals, locale),
    getMonthName: (month: number) => _getMonthName(month, locale),
    getShortMonthName: (month: number) => _getShortMonthName(month, locale),
  };
}
