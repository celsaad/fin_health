import {
  formatCurrency,
  formatAmount,
  formatDate,
  formatDateGroupHeader,
  getMonthName,
  getShortMonthName,
} from '@fin-health/shared/format';

describe('formatCurrency', () => {
  it('formats positive numbers with USD symbol', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });

  it('formats with specified currency', () => {
    const result = formatCurrency(100, 'EUR');
    // Intl formats vary by locale, just check it contains "100"
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
    expect(formatAmount(-500, 'income')).toBe('+$500.00');
    expect(formatAmount(-500, 'expense')).toBe('-$500.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2024-03-15T10:30:00Z')).toBe('Mar 15, 2024');
  });

  it('formats date-only string', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 01, 2024');
  });
});

describe('formatDateGroupHeader', () => {
  it("shows TODAY for today's date", () => {
    const today = new Date().toISOString();
    expect(formatDateGroupHeader(today)).toMatch(/^TODAY,/);
  });

  it("shows YESTERDAY for yesterday's date", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatDateGroupHeader(yesterday)).toMatch(/^YESTERDAY,/);
  });

  it('shows day name for other dates', () => {
    // Use noon to avoid timezone boundary issues
    const result = formatDateGroupHeader('2024-01-15T12:00:00');
    expect(result).toBe('MON, JAN 15');
  });
});

describe('getMonthName', () => {
  it('returns full month name', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(6)).toBe('June');
    expect(getMonthName(12)).toBe('December');
  });
});

describe('getShortMonthName', () => {
  it('returns abbreviated month name', () => {
    expect(getShortMonthName(1)).toBe('Jan');
    expect(getShortMonthName(6)).toBe('Jun');
    expect(getShortMonthName(12)).toBe('Dec');
  });
});
