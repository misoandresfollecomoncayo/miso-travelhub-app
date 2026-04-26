import {
  getPasswordChecks,
  hasDigit,
  hasLetter,
  hasMinLength,
  hasSpecialChar,
  isStrongPassword,
  MIN_PASSWORD_LENGTH,
} from '../../src/utils/password';

describe('password validators', () => {
  it('MIN_PASSWORD_LENGTH is 8', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });

  describe('hasMinLength', () => {
    it('returns true for length >= 8', () => {
      expect(hasMinLength('12345678')).toBe(true);
      expect(hasMinLength('abcdefghi')).toBe(true);
    });

    it('returns false for length < 8', () => {
      expect(hasMinLength('')).toBe(false);
      expect(hasMinLength('short')).toBe(false);
      expect(hasMinLength('1234567')).toBe(false);
    });
  });

  describe('hasLetter', () => {
    it('returns true when value contains a letter', () => {
      expect(hasLetter('abc123!')).toBe(true);
      expect(hasLetter('Z')).toBe(true);
    });

    it('returns false when value has no letters', () => {
      expect(hasLetter('12345678!')).toBe(false);
      expect(hasLetter('')).toBe(false);
    });
  });

  describe('hasDigit', () => {
    it('returns true when value contains a digit', () => {
      expect(hasDigit('abc1')).toBe(true);
      expect(hasDigit('0')).toBe(true);
    });

    it('returns false when value has no digit', () => {
      expect(hasDigit('abcdef!')).toBe(false);
      expect(hasDigit('')).toBe(false);
    });
  });

  describe('hasSpecialChar', () => {
    it('returns true for punctuation', () => {
      expect(hasSpecialChar('abc!')).toBe(true);
      expect(hasSpecialChar('abc@def')).toBe(true);
      expect(hasSpecialChar('#')).toBe(true);
    });

    it('returns false for only alphanumerics', () => {
      expect(hasSpecialChar('abc123')).toBe(false);
      expect(hasSpecialChar('ABCdef999')).toBe(false);
      expect(hasSpecialChar('')).toBe(false);
    });

    it('does not count whitespace as special', () => {
      expect(hasSpecialChar('abc 123')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('returns true when all 4 criteria met', () => {
      expect(isStrongPassword('Prueba1!')).toBe(true);
      expect(isStrongPassword('Passw0rd@')).toBe(true);
    });

    it('returns false when missing length', () => {
      expect(isStrongPassword('Ab1!')).toBe(false);
    });

    it('returns false when missing letter', () => {
      expect(isStrongPassword('12345678!')).toBe(false);
    });

    it('returns false when missing digit', () => {
      expect(isStrongPassword('Abcdefgh!')).toBe(false);
    });

    it('returns false when missing special char', () => {
      expect(isStrongPassword('Abcd1234')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isStrongPassword('')).toBe(false);
    });
  });

  describe('getPasswordChecks', () => {
    it('returns all-true for a valid strong password', () => {
      expect(getPasswordChecks('Prueba1!')).toEqual({
        length: true,
        letter: true,
        digit: true,
        special: true,
      });
    });

    it('returns partial checks for weak password', () => {
      expect(getPasswordChecks('abc')).toEqual({
        length: false,
        letter: true,
        digit: false,
        special: false,
      });
    });

    it('returns all-false for empty string', () => {
      expect(getPasswordChecks('')).toEqual({
        length: false,
        letter: false,
        digit: false,
        special: false,
      });
    });
  });
});
