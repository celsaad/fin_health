/**
 * MonthKey utilities - Flexible month boundaries with timezone and custom start day support
 * MonthKey format: "YYYY-MM"
 */

import { DateTime } from 'luxon';
import type { DateRange, MonthKey } from '../types/index.js';

/**
 * Convert a date to a MonthKey based on timezone and month start day
 * @param date The date to convert
 * @param timezone IANA timezone (e.g., "America/New_York")
 * @param monthStartDay Day of month when budget period starts (1-31)
 */
export function toMonthKey(
  date: Date,
  timezone: string = 'UTC',
  monthStartDay: number = 1
): MonthKey {
  const dt = DateTime.fromJSDate(date, { zone: timezone });

  // If the current day is before the month start day, this date belongs to previous month's budget
  if (dt.day < monthStartDay) {
    const previousMonth = dt.minus({ months: 1 });
    return previousMonth.toFormat('yyyy-MM');
  }

  return dt.toFormat('yyyy-MM');
}

/**
 * Convert a MonthKey to a date range
 * @param monthKey MonthKey in "YYYY-MM" format
 * @param timezone IANA timezone
 * @param monthStartDay Day of month when budget period starts (1-31)
 * @returns Date range with start (inclusive) and end (exclusive)
 */
export function monthKeyToRange(
  monthKey: MonthKey,
  timezone: string = 'UTC',
  monthStartDay: number = 1
): DateRange {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    throw new Error(`Invalid monthKey format: ${monthKey}`);
  }

  // Start of budget period
  const start = DateTime.fromObject(
    {
      year,
      month,
      day: monthStartDay,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    },
    { zone: timezone }
  );

  // End is the start of next budget period
  const end = start.plus({ months: 1 });

  return {
    start: start.toJSDate(),
    end: end.toJSDate(),
  };
}

/**
 * Get the current MonthKey based on current time
 */
export function getCurrentMonthKey(
  timezone: string = 'UTC',
  monthStartDay: number = 1
): MonthKey {
  return toMonthKey(new Date(), timezone, monthStartDay);
}

/**
 * Get the previous MonthKey
 */
export function getPreviousMonthKey(monthKey: MonthKey): MonthKey {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    throw new Error(`Invalid monthKey format: ${monthKey}`);
  }

  const dt = DateTime.fromObject({ year, month, day: 1 });
  const previous = dt.minus({ months: 1 });
  return previous.toFormat('yyyy-MM');
}

/**
 * Get the next MonthKey
 */
export function getNextMonthKey(monthKey: MonthKey): MonthKey {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    throw new Error(`Invalid monthKey format: ${monthKey}`);
  }

  const dt = DateTime.fromObject({ year, month, day: 1 });
  const next = dt.plus({ months: 1 });
  return next.toFormat('yyyy-MM');
}

/**
 * Format a MonthKey for display
 * @param monthKey MonthKey in "YYYY-MM" format
 * @param locale Locale for formatting (defaults to en-US)
 * @returns Formatted string like "January 2026"
 */
export function formatMonthKey(monthKey: MonthKey, locale: string = 'en-US'): string {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    throw new Error(`Invalid monthKey format: ${monthKey}`);
  }

  const dt = DateTime.fromObject({ year, month, day: 1 });
  return dt.setLocale(locale).toFormat('MMMM yyyy');
}

/**
 * Check if a date falls within a MonthKey's range
 */
export function isDateInMonthKey(
  date: Date,
  monthKey: MonthKey,
  timezone: string = 'UTC',
  monthStartDay: number = 1
): boolean {
  const range = monthKeyToRange(monthKey, timezone, monthStartDay);
  return date >= range.start && date < range.end;
}

/**
 * Compare two MonthKeys
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareMonthKeys(a: MonthKey, b: MonthKey): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Validate MonthKey format
 */
export function isValidMonthKey(monthKey: string): boolean {
  const pattern = /^\d{4}-\d{2}$/;
  if (!pattern.test(monthKey)) {
    return false;
  }

  const [year, month] = monthKey.split('-').map(Number);
  return (
    year !== undefined &&
    month !== undefined &&
    year >= 1900 &&
    year <= 2100 &&
    month >= 1 &&
    month <= 12
  );
}
