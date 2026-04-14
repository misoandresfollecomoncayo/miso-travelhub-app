import {searchRooms} from '../../src/services/searchApi';

// The helper functions (toString, toNumber, toStringArray, normalizeRoom) are
// not exported directly, so we test them indirectly through searchRooms +
// normalizeRoom by inspecting the returned Room objects.

const makeResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  });

const defaultParams = {
  ciudad: 'Bogota',
  checkin: '2026-05-01',
  checkout: '2026-05-05',
  group: 2,
  rooms: 1,
};

describe('searchRooms', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      makeResponse([]),
    ) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  // --- URL & query params ---

  it('calls the correct endpoint URL', async () => {
    await searchRooms(defaultParams);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/search/search_rooms');
  });

  it('passes ciudad as query param', async () => {
    await searchRooms(defaultParams);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('ciudad=Bogota');
  });

  it('passes checkin and checkout as query params', async () => {
    await searchRooms(defaultParams);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('checkin=2026-05-01');
    expect(url).toContain('checkout=2026-05-05');
  });

  it('passes group and rooms as query params', async () => {
    await searchRooms(defaultParams);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('group=2');
    expect(url).toContain('rooms=1');
  });

  // --- HTTP error handling ---

  it('throws on non-ok response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(null, false, 500),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow(
      'Error 500 al consultar hospedajes',
    );
  });

  it('throws on 404 response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(null, false, 404),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('Error 404');
  });

  // --- payload handling ---

  it('returns empty array when payload is not an array', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({message: 'unexpected'}),
    );
    const result = await searchRooms(defaultParams);
    expect(result).toEqual([]);
  });

  it('returns empty array when payload is null', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(null),
    );
    const result = await searchRooms(defaultParams);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty list', async () => {
    const result = await searchRooms(defaultParams);
    expect(result).toEqual([]);
  });

  // --- normalizeRoom via searchRooms ---

  it('maps API fields to Room interface', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          id: 'abc-123',
          nombre_hotel: 'Hotel Test',
          precio: 150000,
          direccion: 'Calle 10',
          capacidad_maxima: 3,
          distancia: '2 km',
          acceso: 'Bus',
          estrellas: 4,
          puntuacion_resena: 4.5,
          cantidad_resenas: 80,
          tipo_habitacion: 'Suite',
          tipo_cama: ['king', 'single'],
          tamano_habitacion: '40m2',
          amenidades: ['Wifi', 'AC'],
          imagenes: ['https://example.com/img.jpg'],
        },
      ]),
    );

    const rooms = await searchRooms(defaultParams);
    expect(rooms).toHaveLength(1);

    const room = rooms[0];
    expect(room.id).toBe('abc-123');
    expect(room.nombreHotel).toBe('Hotel Test');
    expect(room.precio).toBe(150000);
    expect(room.direccion).toBe('Calle 10');
    expect(room.capacidadMaxima).toBe(3);
    expect(room.distancia).toBe('2 km');
    expect(room.acceso).toBe('Bus');
    expect(room.estrellas).toBe(4);
    expect(room.puntuacionResena).toBe(4.5);
    expect(room.cantidadResenas).toBe(80);
    expect(room.tipoHabitacion).toBe('Suite');
    expect(room.tipoCama).toEqual(['king', 'single']);
    expect(room.tamanoHabitacion).toBe('40m2');
    expect(room.amenidades).toEqual(['Wifi', 'AC']);
    expect(room.imagenes).toEqual(['https://example.com/img.jpg']);
  });

  it('uses fallback values when API fields are missing', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{}]),
    );

    const rooms = await searchRooms(defaultParams);
    const room = rooms[0];

    expect(room.id).toBe('0');
    expect(room.nombreHotel).toBe('Hospedaje');
    expect(room.precio).toBe(0);
    expect(room.direccion).toBe('');
    expect(room.capacidadMaxima).toBe(0);
    expect(room.estrellas).toBe(0);
    expect(room.tipoCama).toEqual([]);
    expect(room.amenidades).toEqual([]);
    expect(room.imagenes).toEqual([]);
  });

  it('handles multiple rooms in response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {nombre_hotel: 'Hotel A'},
        {nombre_hotel: 'Hotel B'},
        {nombre_hotel: 'Hotel C'},
      ]),
    );

    const rooms = await searchRooms(defaultParams);
    expect(rooms).toHaveLength(3);
    expect(rooms[0].nombreHotel).toBe('Hotel A');
    expect(rooms[1].nombreHotel).toBe('Hotel B');
    expect(rooms[2].nombreHotel).toBe('Hotel C');
  });

  // --- toString edge cases (via normalizeRoom) ---

  it('converts numeric id to string', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{id: 42}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].id).toBe('42');
  });

  it('uses index as fallback id when id is null', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{id: null}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].id).toBe('0');
  });

  // --- toNumber edge cases ---

  it('converts string precio to number', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: '250000'}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(250000);
  });

  it('falls back to 0 for NaN precio', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: 'invalid'}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(0);
  });

  it('falls back to 0 for NaN number value', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{estrellas: NaN}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].estrellas).toBe(0);
  });

  it('falls back to 0 for empty string number', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: ''}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(0);
  });

  // --- toStringArray edge cases ---

  it('filters out empty strings from array fields', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{amenidades: ['Wifi', '', 'AC']}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].amenidades).toEqual(['Wifi', 'AC']);
  });

  it('converts non-string array items to strings', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{tipo_cama: [123, true]}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].tipoCama).toEqual(['123', 'true']);
  });

  it('returns empty array for non-array value', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{amenidades: 'not-an-array'}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].amenidades).toEqual([]);
  });

  // --- network error ---

  it('propagates network errors', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error')),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('Network error');
  });
});
