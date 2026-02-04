import { describe, it, expect } from 'vitest';
import {
  toMonthKey,
  monthKeyToRange,
  getCurrentMonthKey,
  getPreviousMonthKey,
  getNextMonthKey,
  formatMonthKey,
  isDateInMonthKey,
  compareMonthKeys,
  isValidMonthKey,
} from '../utils/monthKey';

describe('monthKey utilities', () => {
  describe('toMonthKey', () => {
    it('should convert date to monthKey with default start day', () => {
      const date = new Date('2026-01-15T12:00:00Z');
      expect(toMonthKey(date, 'UTC', 1)).toBe('2026-01');
    });

    it('should handle month boundary with custom start day', () => {
      // If month starts on 15th, Jan 10 belongs to December budget
      const jan10 = new Date('2026-01-10T12:00:00Z');
      expect(toMonthKey(jan10, 'UTC', 15)).toBe('2025-12');

      // Jan 20 belongs to January budget
      const jan20 = new Date('2026-01-20T12:00:00Z');
      expect(toMonthKey(jan20, 'UTC', 15)).toBe('2026-01');
    });

    it('should handle timezone differences', () => {
      // Same instant in different timezones can have different monthKeys
      const utcDate = new Date('2026-01-01T00:00:00Z');

      // In New York (UTC-5), it's still Dec 31, 2025
      expect(toMonthKey(utcDate, 'America/New_York', 1)).toBe('2025-12');

      // In UTC, it's Jan 1, 2026
      expect(toMonthKey(utcDate, 'UTC', 1)).toBe('2026-01');
    });

    it('should handle year boundaries', () => {
      const dec20 = new Date('2025-12-20T12:00:00Z');
      expect(toMonthKey(dec20, 'UTC', 15)).toBe('2025-12');

      const dec10 = new Date('2025-12-10T12:00:00Z');
      expect(toMonthKey(dec10, 'UTC', 15)).toBe('2025-11');
    });
  });

  describe('monthKeyToRange', () => {
    it('should convert monthKey to date range with default start day', () => {
      const range = monthKeyToRange('2026-01', 'UTC', 1);

      expect(range.start).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(range.end).toEqual(new Date('2026-02-01T00:00:00Z'));
    });

    it('should handle custom start day', () => {
      const range = monthKeyToRange('2026-01', 'UTC', 15);

      expect(range.start).toEqual(new Date('2026-01-15T00:00:00Z'));
      expect(range.end).toEqual(new Date('2026-02-15T00:00:00Z'));
    });

    it('should handle timezone', () => {
      const range = monthKeyToRange('2026-01', 'America/New_York', 1);

      // Jan 1, 2026 at midnight in New York
      expect(range.start.toISOString()).toBe('2026-01-01T05:00:00.000Z');
      expect(range.end.toISOString()).toBe('2026-02-01T05:00:00.000Z');
    });

    it('should throw on invalid monthKey', () => {
      expect(() => monthKeyToRange('invalid', 'UTC', 1)).toThrow();
      expect(() => monthKeyToRange('2026', 'UTC', 1)).toThrow();
    });
  });

  describe('getCurrentMonthKey', () => {
    it('should get current monthKey', () => {
      const monthKey = getCurrentMonthKey('UTC', 1);
      expect(monthKey).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getPreviousMonthKey', () => {
    it('should get previous monthKey', () => {
      expect(getPreviousMonthKey('2026-02')).toBe('2026-01');
      expect(getPreviousMonthKey('2026-01')).toBe('2025-12');
    });

    it('should throw on invalid monthKey', () => {
      expect(() => getPreviousMonthKey('invalid')).toThrow();
    });
  });

  describe('getNextMonthKey', () => {
    it('should get next monthKey', () => {
      expect(getNextMonthKey('2026-01')).toBe('2026-02');
      expect(getNextMonthKey('2026-12')).toBe('2027-01');
    });

    it('should throw on invalid monthKey', () => {
      expect(() => getNextMonthKey('invalid')).toThrow();
    });
  });

  describe('formatMonthKey', () => {
    it('should format monthKey for display', () => {
      expect(formatMonthKey('2026-01')).toBe('January 2026');
      expect(formatMonthKey('2026-12')).toBe('December 2026');
    });

    it('should throw on invalid monthKey', () => {
      expect(() => formatMonthKey('invalid')).toThrow();
    });
  });

  describe('isDateInMonthKey', () => {
    it('should check if date is in monthKey range', () => {
      const jan15 = new Date('2026-01-15T12:00:00Z');

      expect(isDateInMonthKey(jan15, '2026-01', 'UTC', 1)).toBe(true);
      expect(isDateInMonthKey(jan15, '2025-12', 'UTC', 1)).toBe(false);
    });

    it('should handle custom start day', () => {
      const jan10 = new Date('2026-01-10T12:00:00Z');

      // With start day 15, Jan 10 is in December budget
      expect(isDateInMonthKey(jan10, '2025-12', 'UTC', 15)).toBe(true);
      expect(isDateInMonthKey(jan10, '2026-01', 'UTC', 15)).toBe(false);
    });
  });

  describe('compareMonthKeys', () => {
    it('should compare monthKeys', () => {
      expect(compareMonthKeys('2026-01', '2026-02')).toBe(-1);
      expect(compareMonthKeys('2026-02', '2026-01')).toBe(1);
      expect(compareMonthKeys('2026-01', '2026-01')).toBe(0);
    });
  });

  describe('isValidMonthKey', () => {
    it('should validate monthKey format', () => {
      expect(isValidMonthKey('2026-01')).toBe(true);
      expect(isValidMonthKey('2026-12')).toBe(true);
      expect(isValidMonthKey('1900-01')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidMonthKey('invalid')).toBe(false);
      expect(isValidMonthKey('2026')).toBe(false);
      expect(isValidMonthKey('2026-1')).toBe(false);
      expect(isValidMonthKey('2026-13')).toBe(false);
      expect(isValidMonthKey('2026-00')).toBe(false);
    });
  });
});
