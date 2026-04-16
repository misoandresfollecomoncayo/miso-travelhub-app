const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const formatCardNumber = (raw: string): string => {
  const digits = onlyDigits(raw).slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

export const formatExpiry = (raw: string): string => {
  const digits = onlyDigits(raw).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const formatCvc = (raw: string): string => onlyDigits(raw).slice(0, 3);

export const isValidCardNumber = (value: string): boolean => {
  const digits = onlyDigits(value);
  return digits.length === 16;
};

export const isValidExpiry = (value: string, now: Date = new Date()): boolean => {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }
  // Expira al final del mes indicado
  const expiry = new Date(year, month, 0, 23, 59, 59);
  return expiry.getTime() >= now.getTime();
};

export const isValidCvc = (value: string): boolean => /^\d{3}$/.test(value);
