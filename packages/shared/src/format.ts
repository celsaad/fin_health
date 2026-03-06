import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(
  amount: number,
  type: string,
  currency = 'USD',
  locale = 'en-US',
): string {
  const formatted = formatCurrency(Math.abs(amount), currency, locale);
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
}

export function formatDate(dateStr: string, locale = 'en-US'): string {
  const date = parseISO(dateStr);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export type DateGroupHeaderKey = 'today' | 'yesterday' | null;

export function formatDateGroupHeader(dateStr: string): {
  key: DateGroupHeaderKey;
  formatted: string;
} {
  const date = parseISO(dateStr);
  if (isToday(date)) return { key: 'today', formatted: format(date, 'MMM dd').toUpperCase() };
  if (isYesterday(date))
    return { key: 'yesterday', formatted: format(date, 'MMM dd').toUpperCase() };
  return { key: null, formatted: format(date, 'EEE, MMM dd').toUpperCase() };
}

export function formatPercent(value: number, decimals = 0, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function getMonthName(month: number, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month - 1, 1));
}

export function getShortMonthName(month: number, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, month - 1, 1));
}
