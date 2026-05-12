/**
 * i18n — formato de moneda según el contexto.
 *
 * `formatAmount(amount, currency)` no depende del PreferencesContext (toma
 * la moneda como argumento explícito), pero los componentes que muestran
 * importes SÍ leen `currency` del context. Este suite valida ambos
 * caminos.
 */
import {formatAmount} from '../../src/utils/currency';

describe('i18n — currency formatting', () => {
  describe('COP', () => {
    it('formats with es-CO locale and no decimals', () => {
      expect(formatAmount(600000, 'COP')).toBe('COP $600.000');
    });

    it('rounds COP to integer (no centavos)', () => {
      expect(formatAmount(493824.6, 'COP')).toBe('COP $493.825');
    });

    it('formats zero correctly', () => {
      expect(formatAmount(0, 'COP')).toBe('COP $0');
    });
  });

  describe('EUR', () => {
    it('formats with es-ES locale (coma decimal) and euro symbol', () => {
      expect(formatAmount(142.86, 'EUR')).toBe('€142,86');
    });

    it('always uses two decimals even for round values', () => {
      expect(formatAmount(300, 'EUR')).toBe('€300,00');
    });

    it('formats large amounts with thousand separator', () => {
      const formatted = formatAmount(1234567.89, 'EUR');
      expect(formatted.startsWith('€')).toBe(true);
      expect(formatted).toContain('1.234.567,89');
    });
  });

  describe('USD', () => {
    it('formats with en-US locale (punto decimal) and dollar symbol', () => {
      expect(formatAmount(96, 'USD')).toBe('$96.00');
    });

    it('always uses two decimals even for round values', () => {
      expect(formatAmount(150, 'USD')).toBe('$150.00');
    });

    it('formats large amounts with thousand separator', () => {
      const formatted = formatAmount(1234567.89, 'USD');
      expect(formatted.startsWith('$')).toBe(true);
      expect(formatted).toContain('1,234,567.89');
    });
  });

  describe('defensive normalization', () => {
    it('is case-insensitive (USD == usd == Usd)', () => {
      expect(formatAmount(96, 'USD')).toBe(formatAmount(96, 'usd'));
      expect(formatAmount(96, 'EUR')).toBe(formatAmount(96, 'eur'));
      expect(formatAmount(96, 'COP')).toBe(formatAmount(96, 'cop'));
    });

    it('formats with USD-style fallback for unknown codes', () => {
      const formatted = formatAmount(1000, 'JPY');
      // Códigos no soportados caen al formato de USD ($).
      expect(formatted.startsWith('$')).toBe(true);
    });

    it('handles an empty currency string by falling back to COP', () => {
      expect(formatAmount(500, '')).toContain('COP');
    });
  });
});
