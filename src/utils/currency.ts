// TRM (Tasa Representativa del Mercado) asumida para conversión a Pesos
// colombianos. Centralizada aquí para fácil ajuste en el futuro.
export const EUR_TO_COP_RATE = 4200;
export const USD_TO_COP_RATE = 4200;

export const eurToCop = (eurAmount: number): number =>
  Math.round(eurAmount * EUR_TO_COP_RATE);

/**
 * Convierte un monto desde una moneda de origen a Pesos colombianos (COP).
 * El backend devuelve los precios mayoritariamente en EUR; la UI los muestra
 * en COP. Si la moneda ya es COP no se aplica conversión.
 */
export const convertToCop = (
  amount: number,
  sourceCurrency: string | null | undefined,
): number => {
  const code = (sourceCurrency || 'EUR').toUpperCase();
  if (code === 'COP') {
    return amount;
  }
  if (code === 'USD') {
    return Math.round(amount * USD_TO_COP_RATE);
  }
  // Default: tratar cualquier otra moneda (incluyendo 'EUR' explícito o
  // ausente) como euros y aplicar la TRM EUR→COP.
  return eurToCop(amount);
};
