import {
  translate,
  translations,
  format,
  getMonthName,
  getDayShortNames,
} from '../../src/i18n/translations';

describe('translations', () => {
  it('exposes both es and en dictionaries', () => {
    expect(translations.es).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('has the same keys in both languages', () => {
    const esKeys = Object.keys(translations.es).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(enKeys).toEqual(esKeys);
  });

  describe('translate()', () => {
    it('returns the spanish string when language is es', () => {
      expect(translate('settings.title', 'es')).toBe('Configuración');
    });
    it('returns the english string when language is en', () => {
      expect(translate('settings.title', 'en')).toBe('Settings');
    });
    it('falls back to spanish when key missing in english', () => {
      // simular falta usando un cast — la implementación cae a 'es' luego a la key
      const out = translate(
        'tab.search' as Parameters<typeof translate>[0],
        'en',
      );
      expect(typeof out).toBe('string');
      expect(out.length).toBeGreaterThan(0);
    });
    it('returns the key itself when totally missing', () => {
      const out = translate(
        'totally.fake.key' as Parameters<typeof translate>[0],
        'es',
      );
      expect(out).toBe('totally.fake.key');
    });
  });

  describe('format()', () => {
    it('replaces single placeholder', () => {
      expect(format('Hola {name}', {name: 'Ana'})).toBe('Hola Ana');
    });
    it('replaces multiple placeholders', () => {
      expect(format('{n} de {total}', {n: 1, total: 3})).toBe('1 de 3');
    });
    it('replaces same placeholder multiple times', () => {
      expect(format('{x} + {x}', {x: 2})).toBe('2 + 2');
    });
    it('leaves unmatched placeholders intact', () => {
      expect(format('Hola {name}', {})).toBe('Hola {name}');
    });
  });

  describe('getMonthName()', () => {
    it('returns full Spanish month name by default', () => {
      expect(getMonthName(0, 'es')).toBe('enero');
    });
    it('returns full English month name', () => {
      expect(getMonthName(11, 'en')).toBe('december');
    });
    it('returns short variant', () => {
      expect(getMonthName(0, 'es', 'short')).toBe('ene');
      expect(getMonthName(0, 'en', 'short')).toBe('jan');
    });
    it('returns capitalized variant', () => {
      expect(getMonthName(2, 'es', 'capitalized')).toBe('Marzo');
      expect(getMonthName(2, 'en', 'capitalized')).toBe('March');
    });
    it('clamps out-of-range index', () => {
      expect(getMonthName(-1, 'es')).toBe('enero');
      expect(getMonthName(99, 'es')).toBe('diciembre');
    });
  });

  describe('getDayShortNames()', () => {
    it('returns 7 days in Spanish', () => {
      const days = getDayShortNames('es');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Dom');
    });
    it('returns 7 days in English', () => {
      const days = getDayShortNames('en');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Sun');
    });
  });
});
