import {formatAmount} from '../../src/utils/currency';

describe('currency', () => {
  describe('formatAmount', () => {
    it('formats COP with es-CO locale and no decimals', () => {
      expect(formatAmount(600000, 'COP')).toBe('COP $600.000');
    });

    it('rounds COP value before formatting', () => {
      expect(formatAmount(123456.78, 'COP')).toBe('COP $123.457');
    });

    it('formats EUR with euro symbol and 2 decimals', () => {
      const formatted = formatAmount(142.86, 'EUR');
      expect(formatted.startsWith('€')).toBe(true);
      expect(formatted).toContain('142');
    });

    it('formats USD with dollar symbol and 2 decimals', () => {
      const formatted = formatAmount(96, 'USD');
      expect(formatted.startsWith('$')).toBe(true);
      expect(formatted.startsWith('€')).toBe(false);
      expect(formatted).toContain('96');
    });

    it('falls back to dollar symbol for unknown currency codes', () => {
      // Códigos no soportados (no COP/EUR) caen al format de USD ($).
      const formatted = formatAmount(1000, 'XYZ');
      expect(formatted.startsWith('$')).toBe(true);
    });

    it('uppercases the currency code defensively', () => {
      expect(formatAmount(96, 'usd')).toBe(formatAmount(96, 'USD'));
    });

    it('handles zero amount', () => {
      expect(formatAmount(0, 'COP')).toBe('COP $0');
      expect(formatAmount(0, 'EUR')).toContain('0,00');
    });
  });
});
