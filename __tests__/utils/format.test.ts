import {formatPrice, generateConfirmationCode} from '../../src/utils/format';

describe('formatPrice', () => {
  it('formats integer prices with thousands separator (es-CO)', () => {
    expect(formatPrice(123456)).toBe('123.456');
  });

  it('formats small numbers without separator', () => {
    expect(formatPrice(360)).toBe('360');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0');
  });

  it('formats large numbers', () => {
    expect(formatPrice(1000000)).toBe('1.000.000');
  });
});

describe('generateConfirmationCode', () => {
  it('returns a non-empty string', () => {
    const code = generateConfirmationCode();
    expect(code.length).toBeGreaterThan(0);
  });

  it('starts with "TH-" prefix', () => {
    const code = generateConfirmationCode();
    expect(code.startsWith('TH-')).toBe(true);
  });

  it('matches expected format TH-XXX-XXXX', () => {
    const code = generateConfirmationCode();
    expect(code).toMatch(/^TH-[A-Z0-9]+-[A-Z0-9]{4}$/);
  });

  it('produces unique codes across calls', () => {
    const code1 = generateConfirmationCode();
    const code2 = generateConfirmationCode();
    // Timestamp+rand combo is extremely unlikely to collide
    expect(code1).not.toBe(code2);
  });
});
