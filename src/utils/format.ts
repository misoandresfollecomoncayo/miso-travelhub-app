export const formatPrice = (price: number): string =>
  price.toLocaleString('es-CO');

export const generateConfirmationCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TH-${timestamp}-${rand}`;
};
