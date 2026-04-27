import {
  convertToCop,
  EUR_TO_COP_RATE,
  USD_TO_COP_RATE,
  eurToCop,
} from '../../src/utils/currency';

describe('currency', () => {
  it('exposes the assumed TRM for EUR (4200)', () => {
    expect(EUR_TO_COP_RATE).toBe(4200);
  });

  describe('eurToCop', () => {
    it('multiplies the EUR amount by the TRM and rounds', () => {
      expect(eurToCop(90)).toBe(378000);
      expect(eurToCop(150)).toBe(630000);
    });

    it('handles zero', () => {
      expect(eurToCop(0)).toBe(0);
    });

    it('rounds fractional EUR amounts', () => {
      expect(eurToCop(1.5)).toBe(Math.round(1.5 * EUR_TO_COP_RATE));
      expect(eurToCop(99.99)).toBe(Math.round(99.99 * EUR_TO_COP_RATE));
    });
  });

  describe('convertToCop', () => {
    it('converts EUR to COP using the TRM', () => {
      expect(convertToCop(90, 'EUR')).toBe(378000);
    });

    it('returns amount as-is when source is COP', () => {
      expect(convertToCop(123456, 'COP')).toBe(123456);
    });

    it('treats null/undefined source as EUR (default)', () => {
      expect(convertToCop(90, null)).toBe(378000);
      expect(convertToCop(90, undefined)).toBe(378000);
      expect(convertToCop(90, '')).toBe(378000);
    });

    it('is case-insensitive for the currency code', () => {
      expect(convertToCop(50, 'eur')).toBe(eurToCop(50));
      expect(convertToCop(50, 'cop')).toBe(50);
    });

    it('converts USD using the USD rate', () => {
      expect(convertToCop(100, 'USD')).toBe(Math.round(100 * USD_TO_COP_RATE));
    });

    it('falls back to EUR conversion for unknown currencies', () => {
      // Comportamiento conservador: cualquier moneda desconocida se trata
      // como EUR para evitar mostrar precios sin convertir
      expect(convertToCop(10, 'GBP')).toBe(eurToCop(10));
    });
  });
});
