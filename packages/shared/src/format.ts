import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number, type: string, currency = 'USD'): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM dd, yyyy');
}

export function formatDateGroupHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `TODAY, ${format(date, 'MMM dd').toUpperCase()}`;
  if (isYesterday(date)) return `YESTERDAY, ${format(date, 'MMM dd').toUpperCase()}`;
  return format(date, 'EEE, MMM dd').toUpperCase();
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMMM');
}

export function getShortMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMM');
}
