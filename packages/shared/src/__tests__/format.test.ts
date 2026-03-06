import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCurrency,
  formatAmount,
  formatDate,
  formatDateGroupHeader,
  formatPercent,
  getMonthName,
  getShortMonthName,
} from '../format';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('formats with 2 decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
    expect(formatCurrency(1.1)).toBe('$1.10');
  });

  it('accepts a different currency', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('100');
  });
});

describe('formatAmount', () => {
  it('prefixes income with +', () => {
    expect(formatAmount(500, 'income')).toBe('+$500.00');
  });

  it('prefixes expense with -', () => {
    expect(formatAmount(500, 'expense')).toBe('-$500.00');
  });

  it('uses absolute value regardless of sign', () => {
    expect(formatAmount(-200, 'income')).toBe('+$200.00');
    expect(formatAmount(-200, 'expense')).toBe('-$200.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2024-03-15')).toBe('Mar 15, 2024');
  });

  it('formats full ISO datetime', () => {
    expect(formatDate('2024-12-25T10:30:00.000Z')).toMatch(/Dec 25, 2024/);
  });
});

describe('formatDateGroupHeader', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns today key for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    const result = formatDateGroupHeader('2024-06-15');
    expect(result).toEqual({ key: 'today', formatted: 'JUN 15' });
    vi.useRealTimers();
  });

  it('returns yesterday key for yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    const result = formatDateGroupHeader('2024-06-14');
    expect(result).toEqual({ key: 'yesterday', formatted: 'JUN 14' });
    vi.useRealTimers();
  });

  it('returns null key with day name for other dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    const result = formatDateGroupHeader('2024-06-10');
    expect(result).toEqual({ key: null, formatted: 'MON, JUN 10' });
    vi.useRealTimers();
  });
});

describe('formatPercent', () => {
  it('formats whole percentages', () => {
    expect(formatPercent(50)).toBe('50%');
    expect(formatPercent(100)).toBe('100%');
  });

  it('formats with decimals', () => {
    expect(formatPercent(33.33, 1)).toBe('33.3%');
    expect(formatPercent(66.667, 2)).toBe('66.67%');
  });

  it('rounds by default', () => {
    expect(formatPercent(33.5)).toBe('34%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });
});

describe('getMonthName', () => {
  it('returns full month names', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(6)).toBe('June');
    expect(getMonthName(12)).toBe('December');
  });
});

describe('getShortMonthName', () => {
  it('returns abbreviated month names', () => {
    expect(getShortMonthName(1)).toBe('Jan');
    expect(getShortMonthName(6)).toBe('Jun');
    expect(getShortMonthName(12)).toBe('Dec');
  });
});
