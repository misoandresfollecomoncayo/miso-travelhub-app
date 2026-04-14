import {Room} from '../data/room';

const API_BASE_URL = 'https://apitravelhub.site';

export interface SearchRoomsParams {
  ciudad: string;
  checkin: string;
  checkout: string;
  group: number;
  rooms: number;
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

const normalizeRoom = (item: any, index: number): Room => ({
  id: toString(item?.id, String(index)),
  nombreHotel: toString(item?.nombre_hotel, 'Hospedaje'),
  precio: toNumber(item?.precio),
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
});

export const searchRooms = async (
  params: SearchRoomsParams,
): Promise<Room[]> => {
  const query = new URLSearchParams({
    ciudad: params.ciudad,
    checkin: params.checkin,
    checkout: params.checkout,
    group: String(params.group),
    rooms: String(params.rooms),
  });

  const url = `${API_BASE_URL}/search/search_rooms?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar hospedajes`);
  }

  const payload = await response.json();
  const list = Array.isArray(payload) ? payload : [];
  return list.map((item, index) => normalizeRoom(item, index));
};
