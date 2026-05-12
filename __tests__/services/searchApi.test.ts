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

  it('defaults moneda to COP when not provided', async () => {
    await searchRooms(defaultParams);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('moneda=COP');
  });

  it('passes the provided moneda upper-cased', async () => {
    await searchRooms({...defaultParams, moneda: 'eur'});
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('moneda=EUR');
  });

  it('passes USD when moneda is USD', async () => {
    await searchRooms({...defaultParams, moneda: 'USD'});
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('moneda=USD');
  });

  // --- HTTP error handling ---

  it('throws with HTTP_<status> sentinel when body has no detail', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(null, false, 500),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('HTTP_500');
  });

  it('throws with HTTP_404 sentinel on 404 with no detail', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(null, false, 404),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('HTTP_404');
  });

  it('propagates the backend detail message on 400 errors', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(
        {detail: 'the check-in date is lower than today'},
        false,
        400,
      ),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow(
      'the check-in date is lower than today',
    );
  });

  it('propagates the first validation msg when detail is an array (422)', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(
        {detail: [{msg: 'field required', loc: ['query', 'ciudad']}]},
        false,
        422,
      ),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('field required');
  });

  it('throws NETWORK_ERROR sentinel when fetch rejects', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('boom')),
    );
    await expect(searchRooms(defaultParams)).rejects.toThrow('NETWORK_ERROR');
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
          precio: 90,
          moneda: 'EUR',
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
    // Precio + moneda se preservan tal cual los devuelve el backend (sin
    // conversión interna).
    expect(room.precio).toBe(90);
    expect(room.moneda).toBe('EUR');
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

  it('converts string precio to number and preserves moneda', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: '85', moneda: 'EUR'}]),
    );
    const rooms = await searchRooms(defaultParams);
    // Sin conversión: precio se preserva tal cual en la moneda del backend.
    expect(rooms[0].precio).toBe(85);
    expect(rooms[0].moneda).toBe('EUR');
  });

  it('preserves precio as-is when API returns moneda COP', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: 250000, moneda: 'COP'}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(250000);
  });

  it('treats missing moneda as COP (the requested currency, no conversion)', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: 100}]),
    );
    const rooms = await searchRooms(defaultParams);
    // El backend ahora siempre devuelve la moneda solicitada; si el campo
    // viene ausente asumimos COP (no conversión).
    expect(rooms[0].precio).toBe(100);
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

  // --- precio por noche: derivado de subtotal_con_descuento ÷ noches ---

  it('computes precio por noche from subtotal_con_descuento divided by nights', async () => {
    // defaultParams: 2026-05-01 → 2026-05-05 = 4 noches
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {subtotal_con_descuento: 1565217.39, moneda: 'COP'},
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    // 1565217.39 / 4 ≈ 391304.35 → redondeado 391304
    expect(rooms[0].precio).toBe(391304);
  });

  it('uses subtotal_con_descuento when both subtotals are present', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          subtotal_sin_descuento: 2000000,
          subtotal_con_descuento: 1800000, // 1800000 / 4 = 450000
          moneda: 'COP',
        },
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(450000);
  });

  it('falls back to subtotal_sin_descuento when con_descuento is missing/0', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {subtotal_sin_descuento: 2000000, moneda: 'COP'}, // 2000000 / 4 = 500000
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(500000);
  });

  it('treats precio field as per-night when only `precio` is provided', async () => {
    // Backwards-compatible path: si el backend devolviera un campo `precio`
    // simple, se asume que YA es por noche (no se divide).
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{precio: 350000, moneda: 'COP'}]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(350000);
  });

  it('preserves EUR subtotal as-is when backend returns EUR', async () => {
    // 400 EUR / 4 noches = 100 EUR/noche (sin conversión interna).
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {subtotal_con_descuento: 400, moneda: 'EUR'},
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(100);
    expect(rooms[0].moneda).toBe('EUR');
  });

  it('handles invalid checkin/checkout by defaulting to 1 night', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {subtotal_con_descuento: 500000, moneda: 'COP'},
      ]),
    );
    const rooms = await searchRooms({
      ...defaultParams,
      checkin: 'not-a-date',
      checkout: 'also-not-a-date',
    });
    // 500000 / 1 = 500000 (no divide-by-zero, fallback a 1 noche)
    expect(rooms[0].precio).toBe(500000);
  });

  // --- precioOriginal: detección de descuento ---

  it('exposes precioOriginal when sin_descuento > con_descuento', async () => {
    // sin 2.000.000 / 4 = 500.000  ·  con 1.600.000 / 4 = 400.000
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          subtotal_sin_descuento: 2000000,
          subtotal_con_descuento: 1600000,
          moneda: 'COP',
        },
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(400000);
    expect(rooms[0].precioOriginal).toBe(500000);
  });

  it('omits precioOriginal when there is no discount (sin = con)', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          subtotal_sin_descuento: 2000000,
          subtotal_con_descuento: 2000000,
          moneda: 'COP',
        },
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precioOriginal).toBeUndefined();
  });

  it('omits precioOriginal when only one of the subtotals is present', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {subtotal_con_descuento: 1600000, moneda: 'COP'},
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precioOriginal).toBeUndefined();
  });

  it('preserves precioOriginal in EUR when backend returns EUR', async () => {
    // sin 500 EUR / 4 = 125 EUR/noche  ·  con 400 EUR / 4 = 100 EUR/noche
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          subtotal_sin_descuento: 500,
          subtotal_con_descuento: 400,
          moneda: 'EUR',
        },
      ]),
    );
    const rooms = await searchRooms(defaultParams);
    expect(rooms[0].precio).toBe(100);
    expect(rooms[0].precioOriginal).toBe(125);
    expect(rooms[0].moneda).toBe('EUR');
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

});
