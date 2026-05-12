import {Room} from '../data/room';
import {API_BASE_URL} from '../config/api';

export interface SearchRoomsParams {
  ciudad: string;
  checkin: string;
  checkout: string;
  group: number;
  rooms: number;
  /**
   * Código ISO-4217 de la moneda en la que se quiere consultar precios.
   * Default 'COP'. La app pasa la moneda preferida del usuario logueado
   * o 'COP' si no hay sesión activa.
   */
  moneda?: string;
}

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

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item : String(item)))
      .filter(item => item.length > 0);
  }
  return [];
};

const computeNights = (checkin: string, checkout: string): number => {
  const start = Date.parse(checkin);
  const end = Date.parse(checkout);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 1;
  }
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

/**
 * Obtiene el precio por noche desde la respuesta del backend.
 *
 * El backend NO devuelve un campo `precio` por noche; devuelve totales de
 * estadía (`subtotal_con_descuento` o `subtotal_sin_descuento`) ya
 * multiplicados por el número de noches. Para mostrarlos como "X/noche"
 * en el feed, dividimos entre las noches del rango consultado.
 *
 * Orden de preferencia para obtener el monto total de estadía:
 *   1. `subtotal_con_descuento` (con descuento aplicado, es lo que paga el user)
 *   2. `subtotal_sin_descuento` (sin descuento, fallback defensivo)
 *   3. `precio` (compatibilidad por si el backend lo añadiera más adelante,
 *      en cuyo caso se asume que YA es precio por noche)
 */
const extractNightlyPrice = (item: any, nights: number): number => {
  const subtotalConDesc = toNumber(item?.subtotal_con_descuento, 0);
  if (subtotalConDesc > 0) {
    return subtotalConDesc / Math.max(1, nights);
  }
  const subtotalSinDesc = toNumber(item?.subtotal_sin_descuento, 0);
  if (subtotalSinDesc > 0) {
    return subtotalSinDesc / Math.max(1, nights);
  }
  // Fallback: si algún día el backend devuelve `precio` por noche, usarlo
  // tal cual sin dividir.
  return toNumber(item?.precio, 0);
};

/**
 * Devuelve el precio CON impuestos por noche (campo `total` del backend
 * dividido entre las noches). 0 si no viene en la respuesta.
 */
const extractNightlyPriceWithTax = (item: any, nights: number): number => {
  const totalWithTax = toNumber(item?.total, 0);
  if (totalWithTax > 0) {
    return totalWithTax / Math.max(1, nights);
  }
  return 0;
};

/**
 * Si la habitación tiene descuento (sin > con), devuelve el precio por noche
 * SIN descuento. Si no hay descuento (o no se puede determinar), devuelve 0
 * y la UI no mostrará el precio tachado.
 */
const extractOriginalNightlyPrice = (item: any, nights: number): number => {
  const sinDesc = toNumber(item?.subtotal_sin_descuento, 0);
  const conDesc = toNumber(item?.subtotal_con_descuento, 0);
  if (sinDesc > 0 && conDesc > 0 && sinDesc > conDesc) {
    return sinDesc / Math.max(1, nights);
  }
  return 0;
};

const roundIfCop = (value: number, moneda: string): number =>
  moneda === 'COP' ? Math.round(value) : value;

const normalizeRoom = (
  item: any,
  index: number,
  nights: number,
  requestedMoneda: string,
): Room => {
  // El backend devuelve el precio en la moneda solicitada; respetamos la del
  // item si viene, si no caemos a la pedida por la app.
  const moneda = toString(item?.moneda, requestedMoneda).toUpperCase();
  const nightly = extractNightlyPrice(item, nights);
  const nightlyWithTax = extractNightlyPriceWithTax(item, nights);
  const originalNightly = extractOriginalNightlyPrice(item, nights);
  const precio = roundIfCop(nightly, moneda);
  const precioConImpuestos = roundIfCop(nightlyWithTax, moneda);
  const precioOriginal =
    originalNightly > 0 ? roundIfCop(originalNightly, moneda) : 0;

  return {
    id: toString(item?.id, String(index)),
    nombreHotel: toString(item?.nombre_hotel, 'Hospedaje'),
    // Precio y moneda tal cual los devuelve el backend — NO se convierten.
    // El consumo (RoomCard/Detail/ReservationScreen) usa `formatAmount` que
    // formatea sin convertir.
    precio,
    precioConImpuestos,
    moneda,
    // Sólo se incluye cuando hay descuento real (mayor que el precio actual).
    ...(precioOriginal > precio ? {precioOriginal} : {}),
    direccion: toString(item?.direccion),
    capacidadMaxima: toNumber(item?.capacidad_maxima),
    distancia: toString(item?.distancia),
    acceso: toString(item?.acceso),
    estrellas: toNumber(item?.estrellas),
    puntuacionResena: toNumber(item?.puntuacion_resena),
    cantidadResenas: toNumber(item?.cantidad_resenas),
    tipoHabitacion: toString(item?.tipo_habitacion),
    tipoCama: toStringArray(item?.tipo_cama),
    tamanoHabitacion: toString(item?.tamano_habitacion),
    amenidades: toStringArray(item?.amenidades),
    imagenes: toStringArray(item?.imagenes),
  };
};

export const searchRooms = async (
  params: SearchRoomsParams,
): Promise<Room[]> => {
  const query = new URLSearchParams({
    ciudad: params.ciudad,
    checkin: params.checkin,
    checkout: params.checkout,
    group: String(params.group),
    rooms: String(params.rooms),
    moneda: (params.moneda || 'COP').toUpperCase(),
  });

  const url = `${API_BASE_URL}/search/search_rooms?${query.toString()}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  // Intentamos parsear el body para extraer el campo `detail` del backend
  // (FastAPI lo usa estándar para errores y mensajes de validación). Si no
  // se puede parsear, caemos a un código sentinela para el render.
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = parseDetail(payload);
    if (detail) {
      throw new Error(detail);
    }
    throw new Error(`HTTP_${response.status}`);
  }

  const list = Array.isArray(payload) ? payload : [];
  const nights = computeNights(params.checkin, params.checkout);
  const requestedMoneda = (params.moneda || 'COP').toUpperCase();
  return list.map((item, index) =>
    normalizeRoom(item, index, nights, requestedMoneda),
  );
};

/**
 * Extrae el mensaje de error desde el payload del backend.
 *   - FastAPI normal: `{"detail": "string"}`
 *   - Validación 422: `{"detail": [{"msg": "..."}, ...]}`
 *   - Cualquier otro shape: null.
 */
const parseDetail = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const detail = (payload as {detail?: unknown}).detail;
  if (typeof detail === 'string' && detail.length > 0) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as {msg?: unknown};
    if (first && typeof first.msg === 'string') {
      return first.msg;
    }
  }
  return null;
};
