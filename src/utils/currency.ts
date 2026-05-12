export type CurrencyCode = 'COP' | 'EUR' | 'USD';

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  COP: 'es-CO',
  EUR: 'es-ES',
  USD: 'en-US',
};

/**
 * Formatea un monto que YA está en la moneda destino (sin conversión).
 *
 *   formatAmount(600000, 'COP') → "COP $600.000"
 *   formatAmount(142.86, 'EUR') → "€142,86"
 *   formatAmount(96, 'USD')     → "$96.00"
 *
 * El app ya no convierte monedas internamente: el precio y la moneda se
 * preservan tal cual los devuelve el backend (en la búsqueda) y los datos
 * de la reserva (al pagar). Este helper sólo formatea visualmente.
 */
export const formatAmount = (
  amount: number,
  currency: CurrencyCode | string,
): string => {
  const code = (currency || 'COP').toUpperCase() as CurrencyCode;
  const locale = LOCALE_BY_CURRENCY[code] ?? 'es-CO';

  if (code === 'COP') {
    return `COP $${Math.round(amount).toLocaleString(locale)}`;
  }

  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (code === 'EUR') {
    return `€${formatted}`;
  }
  return `$${formatted}`;
};
