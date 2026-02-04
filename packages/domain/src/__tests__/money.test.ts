import { describe, it, expect } from 'vitest';
import {
  toCents,
  toDollars,
  add,
  subtract,
  sum,
  format,
  parse,
  percentage,
  isNegative,
  isZero,
  abs,
} from '../utils/money';

describe('money utilities', () => {
  describe('toCents', () => {
    it('should convert dollars to cents', () => {
      expect(toCents(1.0)).toBe(100);
      expect(toCents(1.5)).toBe(150);
      expect(toCents(10.99)).toBe(1099);
      expect(toCents(0)).toBe(0);
    });

    it('should handle floating point precision', () => {
      expect(toCents(0.1 + 0.2)).toBe(30); // 0.1 + 0.2 = 0.30000000000000004
      expect(toCents(1.005)).toBe(100); // Rounds to nearest cent (banker's rounding)
      expect(toCents(1.006)).toBe(101); // Rounds up
    });

    it('should handle negative amounts', () => {
      expect(toCents(-5.5)).toBe(-550);
    });
  });

  describe('toDollars', () => {
    it('should convert cents to dollars', () => {
      expect(toDollars(100)).toBe(1.0);
      expect(toDollars(150)).toBe(1.5);
      expect(toDollars(1099)).toBe(10.99);
      expect(toDollars(0)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(toDollars(-550)).toBe(-5.5);
    });
  });

  describe('add', () => {
    it('should add two amounts', () => {
      expect(add(100, 50)).toBe(150);
      expect(add(0, 100)).toBe(100);
      expect(add(100, -50)).toBe(50);
    });
  });

  describe('subtract', () => {
    it('should subtract two amounts', () => {
      expect(subtract(100, 50)).toBe(50);
      expect(subtract(100, 100)).toBe(0);
      expect(subtract(50, 100)).toBe(-50);
    });
  });

  describe('sum', () => {
    it('should sum an array of amounts', () => {
      expect(sum([100, 200, 300])).toBe(600);
      expect(sum([100])).toBe(100);
      expect(sum([])).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(sum([100, -50, 200])).toBe(250);
    });
  });

  describe('format', () => {
    it('should format cents as currency string', () => {
      expect(format(100, 'USD')).toBe('$1.00');
      expect(format(1099, 'USD')).toBe('$10.99');
      expect(format(0, 'USD')).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(format(-550, 'USD')).toBe('-$5.50');
    });

    it('should handle large amounts', () => {
      expect(format(123456789, 'USD')).toBe('$1,234,567.89');
    });

    it('should support different currencies', () => {
      expect(format(100, 'EUR')).toMatch(/€|EUR/);
      expect(format(100, 'GBP')).toMatch(/£|GBP/);
    });
  });

  describe('parse', () => {
    it('should parse currency strings', () => {
      expect(parse('$1.00')).toBe(100);
      expect(parse('10.99')).toBe(1099);
      expect(parse('1,234.56')).toBe(123456);
    });

    it('should handle different formats', () => {
      expect(parse('$1,234.56')).toBe(123456);
      expect(parse('€100.50')).toBe(10050);
      expect(parse('  $50.25  ')).toBe(5025);
    });

    it('should return null for invalid input', () => {
      expect(parse('abc')).toBeNull();
      expect(parse('')).toBeNull();
      expect(parse('$')).toBeNull();
    });

    it('should handle negative amounts', () => {
      expect(parse('-$5.50')).toBe(-550);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(100, 100)).toBe(100);
      expect(percentage(0, 100)).toBe(0);
      expect(percentage(25, 100)).toBe(25);
    });

    it('should handle zero total', () => {
      expect(percentage(50, 0)).toBe(0);
    });

    it('should handle amounts greater than total', () => {
      expect(percentage(150, 100)).toBe(150);
    });
  });

  describe('isNegative', () => {
    it('should check if amount is negative', () => {
      expect(isNegative(-100)).toBe(true);
      expect(isNegative(0)).toBe(false);
      expect(isNegative(100)).toBe(false);
    });
  });

  describe('isZero', () => {
    it('should check if amount is zero', () => {
      expect(isZero(0)).toBe(true);
      expect(isZero(100)).toBe(false);
      expect(isZero(-100)).toBe(false);
    });
  });

  describe('abs', () => {
    it('should return absolute value', () => {
      expect(abs(-100)).toBe(100);
      expect(abs(100)).toBe(100);
      expect(abs(0)).toBe(0);
    });
  });
});
