import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
} from '../../src/utils/payment';

describe('formatCardNumber', () => {
  it('adds a space every 4 digits', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('truncates to 16 digits', () => {
    expect(formatCardNumber('41111111111111119999')).toBe(
      '4111 1111 1111 1111',
    );
  });

  it('strips non-digits', () => {
    expect(formatCardNumber('4111-abc-1111')).toBe('4111 1111');
  });

  it('returns empty string for empty input', () => {
    expect(formatCardNumber('')).toBe('');
  });
});

describe('formatExpiry', () => {
  it('adds slash after two digits', () => {
    expect(formatExpiry('1225')).toBe('12/25');
  });

  it('does not add slash for single or double digit', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
  });

  it('strips non-digits', () => {
    expect(formatExpiry('1a2b25')).toBe('12/25');
  });

  it('truncates to 4 digits', () => {
    expect(formatExpiry('123456')).toBe('12/34');
  });
});

describe('formatCvc', () => {
  it('keeps up to 3 digits', () => {
    expect(formatCvc('123')).toBe('123');
    expect(formatCvc('12345')).toBe('123');
  });

  it('strips non-digits', () => {
    expect(formatCvc('1a2b3')).toBe('123');
  });
});

describe('isValidCardNumber', () => {
  it('returns true for formatted 16-digit number', () => {
    expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true);
  });

  it('returns true for raw 16-digit number', () => {
    expect(isValidCardNumber('4111111111111111')).toBe(true);
  });

  it('returns false for less than 16 digits', () => {
    expect(isValidCardNumber('4111 1111 1111')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidCardNumber('')).toBe(false);
  });
});

describe('isValidExpiry', () => {
  // Abril 15 de 2026, local timezone
  const now = new Date(2026, 3, 15, 12, 0, 0);

  it('returns true for future month', () => {
    expect(isValidExpiry('12/29', now)).toBe(true);
  });

  it('returns true for current month', () => {
    expect(isValidExpiry('04/26', now)).toBe(true);
  });

  it('returns false for past month', () => {
    expect(isValidExpiry('03/26', now)).toBe(false);
  });

  it('returns false for invalid month (13)', () => {
    expect(isValidExpiry('13/29', now)).toBe(false);
  });

  it('returns false for invalid month (00)', () => {
    expect(isValidExpiry('00/29', now)).toBe(false);
  });

  it('returns false for incomplete input', () => {
    expect(isValidExpiry('12/', now)).toBe(false);
    expect(isValidExpiry('12', now)).toBe(false);
    expect(isValidExpiry('', now)).toBe(false);
  });

  it('returns false for wrong format', () => {
    expect(isValidExpiry('1229', now)).toBe(false);
    expect(isValidExpiry('12-29', now)).toBe(false);
  });
});

describe('isValidCvc', () => {
  it('returns true for exactly 3 digits', () => {
    expect(isValidCvc('123')).toBe(true);
  });

  it('returns false for less than 3 digits', () => {
    expect(isValidCvc('12')).toBe(false);
  });

  it('returns false for more than 3 digits', () => {
    expect(isValidCvc('1234')).toBe(false);
  });

  it('returns false for non-digit characters', () => {
    expect(isValidCvc('12a')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidCvc('')).toBe(false);
  });
});
