/**
 * Money utilities - All amounts stored as integer cents
 * This avoids floating point arithmetic errors
 */

/**
 * Convert dollars (decimal) to cents (integer)
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents (integer) to dollars (decimal)
 */
export function toDollars(cents: number): number {
  return cents / 100;
}

/**
 * Add two amounts in cents
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two amounts in cents
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Sum an array of amounts in cents
 */
export function sum(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}

/**
 * Format cents as currency string
 * @param cents Amount in cents
 * @param currency ISO 4217 currency code (USD, EUR, etc.)
 * @param locale Optional locale for formatting (defaults to en-US)
 */
export function format(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const dollars = toDollars(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(dollars);
}

/**
 * Parse a currency string to cents
 * Handles various formats: "$1,234.56", "1234.56", "1,234", etc.
 * @param value String to parse
 * @returns Amount in cents, or null if invalid
 */
export function parse(value: string): number | null {
  // Remove currency symbols, spaces, and commas
  const cleaned = value.replace(/[$€£¥,\s]/g, '');

  // Try to parse as float
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  return toCents(parsed);
}

/**
 * Calculate percentage of one amount relative to another
 * @param part The partial amount
 * @param total The total amount
 * @returns Percentage (0-100), or 0 if total is 0
 */
export function percentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (part / total) * 100;
}

/**
 * Check if an amount is negative
 */
export function isNegative(cents: number): boolean {
  return cents < 0;
}

/**
 * Check if an amount is zero
 */
export function isZero(cents: number): boolean {
  return cents === 0;
}

/**
 * Get absolute value of an amount
 */
export function abs(cents: number): number {
  return Math.abs(cents);
}
