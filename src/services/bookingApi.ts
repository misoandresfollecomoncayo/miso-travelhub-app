const API_BASE_URL = 'https://apitravelhub.site';
const BOOKING_ENDPOINT = `${API_BASE_URL}/api/v1/booking/booking_room`;

export interface BookRoomParams {
  habitacionId: string;
  checkin: string;
  checkout: string;
  numHuespedes: number;
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

const parseErrorMessage = (payload: unknown): string => {
  if (payload && typeof payload === 'object') {
    const detail = (payload as {detail?: unknown}).detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as {msg?: unknown};
      if (first && typeof first.msg === 'string') {
        return first.msg;
      }
    }
  }
  return 'No se pudo crear la reserva';
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

const normalizeBooking = (
  payload: unknown,
  fallback: Omit<BookRoomParams, 'token'>,
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
  const {habitacionId, checkin, checkout, numHuespedes, token} = params;

  if (!token) {
    throw new Error('Debes iniciar sesión para crear una reserva');
  }
  if (!habitacionId || !checkin || !checkout) {
    throw new Error('Faltan datos de la reserva');
  }

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
