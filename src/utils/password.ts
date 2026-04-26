export const MIN_PASSWORD_LENGTH = 8;

export const hasMinLength = (value: string): boolean =>
  value.length >= MIN_PASSWORD_LENGTH;

export const hasLetter = (value: string): boolean => /[A-Za-z]/.test(value);

export const hasDigit = (value: string): boolean => /\d/.test(value);

// Carácter especial: cualquiera que no sea letra ni dígito (excluye espacios)
export const hasSpecialChar = (value: string): boolean =>
  /[^A-Za-z0-9\s]/.test(value);

export const isStrongPassword = (value: string): boolean =>
  hasMinLength(value) &&
  hasLetter(value) &&
  hasDigit(value) &&
  hasSpecialChar(value);

export interface PasswordChecks {
  length: boolean;
  letter: boolean;
  digit: boolean;
  special: boolean;
}

export const getPasswordChecks = (value: string): PasswordChecks => ({
  length: hasMinLength(value),
  letter: hasLetter(value),
  digit: hasDigit(value),
  special: hasSpecialChar(value),
});
