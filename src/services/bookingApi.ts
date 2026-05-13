import {API_BASE_URL} from '../config/api';

const BOOKING_ENDPOINT = `${API_BASE_URL}/api/v1/booking/booking_room`;
const GET_BOOKINGS_ENDPOINT = `${API_BASE_URL}/api/v1/booking/get_bookings`;

export interface BookRoomParams {
  habitacionId: string;
  checkin: string;
  checkout: string;
  numHuespedes: number;
  /** Subtotal (precio sin impuestos) en la moneda `moneda`. */
  subtotal: number;
  /** Monto de impuestos en la moneda `moneda`. */
  impuestos: number;
  /** Total con impuestos (subtotal + impuestos) en la moneda `moneda`. */
  total: number;
  /** Código de moneda con la que se está comprando (ej. 'COP', 'EUR'). */
  moneda: string;
  token: string;
}

export interface Booking {
  id: string;
  habitacionId: string;
  checkin: string;
  checkout: string;
  numHuespedes: number;
  raw: unknown;
}

export interface BookingListItem {
  id: string;
  nombreHotel: string;
  descripcion: string;
  ciudad: string;
  pais: string;
  direccion: string;
  estrellas: number;
  estado: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  numHuespedes: number;
  imagenes: string[];
  amenidades: string[];
  tipoHabitacion: string;
  tamanoHabitacion: string;
  tipoCama: string[];
  distancia: string;
  acceso: string;
  /**
   * Monto total de la reserva, EN LA MISMA MONEDA en que se hizo la compra
   * (campo `moneda`). NO se convierte a la moneda del usuario — las reservas
   * son inmutables y se muestran en la moneda original.
   */
  total: number;
  /**
   * Código de moneda con la que se hizo la reserva. Ej: 'COP', 'EUR', 'USD'.
   * Default 'COP' si el backend no la devuelve.
   */
  moneda: string;
}

const parseErrorMessage = (payload: unknown): string => {
  if (payload && typeof payload === 'object') {
    const obj = payload as {detail?: unknown; message?: unknown};
    const {detail} = obj;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as {msg?: unknown};
      if (first && typeof first.msg === 'string') {
        return first.msg;
      }
    }
    if (typeof obj.message === 'string') {
      return obj.message;
    }
  }
  return 'Ocurrió un error inesperado';
};

const toString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return String(value);
  }
  return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

type BookingFallback = Pick<
  BookRoomParams,
  'habitacionId' | 'checkin' | 'checkout' | 'numHuespedes'
>;

const normalizeBooking = (
  payload: unknown,
  fallback: BookingFallback,
): Booking => {
  const obj = (payload ?? {}) as Record<string, unknown>;
  return {
    id: toString(
      obj.id ?? obj.bookingId ?? obj.reservaId,
      `booking-${Date.now()}`,
    ),
    habitacionId: toString(
      obj.habitacionId ?? obj.habitacion_id ?? fallback.habitacionId,
    ),
    checkin: toString(obj.checkin, fallback.checkin),
    checkout: toString(obj.checkout, fallback.checkout),
    numHuespedes: toNumber(
      obj.numHuespedes ?? obj.num_huespedes,
      fallback.numHuespedes,
    ),
    raw: payload,
  };
};

export const bookRoom = async (params: BookRoomParams): Promise<Booking> => {
  const {
    habitacionId,
    checkin,
    checkout,
    numHuespedes,
    subtotal,
    impuestos,
    total,
    moneda,
    token,
  } = params;

  if (!token) {
    throw new Error('Debes iniciar sesión para crear una reserva');
  }
  if (!habitacionId || !checkin || !checkout) {
    throw new Error('Faltan datos de la reserva');
  }

  // Los montos se redondean a entero para COP (sin centavos) y a 2 decimales
  // para EUR/USD. Deben coincidir con lo mostrado al usuario antes de
  // confirmar la reserva.
  const normalizedMoneda = (moneda || 'COP').toUpperCase();
  const normalize = (value: number): number =>
    normalizedMoneda === 'COP'
      ? Math.round(value)
      : Number(value.toFixed(2));
  const normalizedSubtotal = normalize(subtotal);
  const normalizedImpuestos = normalize(impuestos);
  const normalizedTotal = normalize(total);

  let response: Response;
  try {
    response = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        habitacionId,
        checkin,
        checkout,
        numHuespedes,
        subtotal: normalizedSubtotal,
        impuestos: normalizedImpuestos,
        total: normalizedTotal,
        moneda: normalizedMoneda,
      }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
  }
  if (!response.ok) {
    throw new Error(parseErrorMessage(payload));
  }

  return normalizeBooking(payload, {
    habitacionId,
    checkin,
    checkout,
    numHuespedes,
  });
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item : String(item)))
    .filter(item => item.length > 0);
};

const SUPPORTED_MONEDAS = new Set(['COP', 'EUR', 'USD']);

/**
 * Extrae el código de moneda de un payload defensivamente.
 *
 * El backend puede devolver la moneda bajo nombres distintos
 * (`moneda` / `currency` / `moneda_pago`), o no devolverla. Aceptamos sólo
 * códigos ISO conocidos; cualquier valor inválido cae al fallback.
 *
 * Heurística adicional: si no hay moneda explícita y el `total` es muy
 * pequeño para ser COP (menos de 1.000 — un hospedaje en COP suele estar en
 * cientos de miles), asumimos EUR/USD por defecto en vez de COP. Esto evita
 * mostrar `"COP $216"` cuando la reserva fue claramente en euros (€216).
 */
const extractMoneda = (
  obj: Record<string, unknown>,
  total: number,
  fallback = 'COP',
): string => {
  const candidates = [
    obj.moneda,
    obj.currency,
    obj.moneda_pago,
    obj.codigoMoneda,
  ];
  for (const raw of candidates) {
    const value = toString(raw).trim().toUpperCase();
    if (value && SUPPORTED_MONEDAS.has(value)) {
      return value;
    }
  }
  // Heurística: total muy bajo → no es COP. Asumimos EUR porque la mayoría
  // de hospedajes del backend originan en euros y nuestro fallback histórico
  // era EUR antes de cambiar el modelo a moneda nativa.
  if (total > 0 && total < 1000) {
    return 'EUR';
  }
  return fallback;
};

const normalizeBookingListItem = (
  payload: unknown,
  index: number,
): BookingListItem => {
  const obj = (payload ?? {}) as Record<string, unknown>;
  // La reserva se muestra siempre en la moneda con la que se hizo la compra,
  // sin convertir a la preferencia actual del usuario.
  const totalRaw = toNumber(obj.total);
  const moneda = extractMoneda(obj, totalRaw);
  return {
    id: toString(obj.id, `booking-${index}`),
    nombreHotel: toString(obj.nombreHotel, 'Hospedaje'),
    descripcion: toString(obj.descripcion),
    ciudad: toString(obj.ciudad),
    pais: toString(obj.pais),
    direccion: toString(obj.direccion),
    estrellas: toNumber(obj.estrellas),
    estado: toString(obj.estado, 'PENDIENTE'),
    fechaCheckIn: toString(obj.fechaCheckIn),
    fechaCheckOut: toString(obj.fechaCheckOut),
    numHuespedes: toNumber(obj.numHuespedes, 1),
    imagenes: toStringArray(obj.imagenes),
    amenidades: toStringArray(obj.amenidades),
    tipoHabitacion: toString(obj.tipo_habitacion ?? obj.tipoHabitacion),
    tamanoHabitacion: toString(obj.tamano_habitacion ?? obj.tamanoHabitacion),
    tipoCama: toStringArray(obj.tipo_cama ?? obj.tipoCama),
    distancia: toString(obj.distancia),
    acceso: toString(obj.acceso),
    total: totalRaw,
    moneda,
  };
};

export const getBookings = async (
  token: string,
  moneda: string,
): Promise<BookingListItem[]> => {
  if (!token) {
    throw new Error('Debes iniciar sesión para ver tus reservas');
  }

  // El backend usa `moneda` para convertir los totales de cada reserva a la
  // moneda preferida del usuario antes de devolver el payload. Si la
  // preferencia llegara vacía (no debería: PreferencesContext garantiza un
  // default), caemos a 'COP'.
  const query = new URLSearchParams({
    moneda: (moneda || 'COP').toUpperCase(),
  });
  const url = `${GET_BOOKINGS_ENDPOINT}?${query.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
  }
  if (!response.ok) {
    throw new Error(parseErrorMessage(payload));
  }

  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item, index) => normalizeBookingListItem(item, index));
};
