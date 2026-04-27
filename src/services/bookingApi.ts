import {convertToCop} from '../utils/currency';

const API_BASE_URL = 'https://apitravelhub.site';
const BOOKING_ENDPOINT = `${API_BASE_URL}/api/v1/booking/booking_room`;
const GET_BOOKINGS_ENDPOINT = `${API_BASE_URL}/api/v1/booking/get_bookings`;

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
  total: number; // ya convertido a COP
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

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item : String(item)))
    .filter(item => item.length > 0);
};

const normalizeBookingListItem = (
  payload: unknown,
  index: number,
): BookingListItem => {
  const obj = (payload ?? {}) as Record<string, unknown>;
  const totalRaw = toNumber(obj.total);
  // Los precios del backend vienen en EUR; convertimos a COP para la UI.
  // Si el item incluye explícitamente moneda, se respeta.
  const moneda = toString(obj.moneda, 'EUR');
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
    total: convertToCop(totalRaw, moneda),
  };
};

export const getBookings = async (token: string): Promise<BookingListItem[]> => {
  if (!token) {
    throw new Error('Debes iniciar sesión para ver tus reservas');
  }

  let response: Response;
  try {
    response = await fetch(GET_BOOKINGS_ENDPOINT, {
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
