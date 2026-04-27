import {bookRoom, getBookings} from '../../src/services/bookingApi';

const makeResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  });

const validParams = {
  habitacionId: 'room-123',
  checkin: '2099-05-19',
  checkout: '2099-05-23',
  numHuespedes: 2,
  token: 'tok_abc',
};

describe('bookingApi.bookRoom', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => makeResponse({})) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('POSTs to /api/v1/booking/booking_room with bearer token', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({id: 'b-1'}),
    );
    await bookRoom(validParams);
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      'https://apitravelhub.site/api/v1/booking/booking_room',
    );
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer tok_abc');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('sends habitacionId, checkin, checkout and numHuespedes in body', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({id: 'b-1'}),
    );
    await bookRoom(validParams);
    const body = JSON.parse(
      (globalThis.fetch as jest.Mock).mock.calls[0][1].body,
    );
    expect(body).toEqual({
      habitacionId: 'room-123',
      checkin: '2099-05-19',
      checkout: '2099-05-23',
      numHuespedes: 2,
    });
    // Token nunca se manda en el body
    expect(body.token).toBeUndefined();
  });

  it('returns a Booking with id from API response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        id: 'b-1',
        habitacionId: 'room-123',
        checkin: '2099-05-19',
        checkout: '2099-05-23',
        numHuespedes: 2,
      }),
    );
    const booking = await bookRoom(validParams);
    expect(booking).toEqual(
      expect.objectContaining({
        id: 'b-1',
        habitacionId: 'room-123',
        checkin: '2099-05-19',
        checkout: '2099-05-23',
        numHuespedes: 2,
      }),
    );
  });

  it('throws when token is missing', async () => {
    await expect(bookRoom({...validParams, token: ''})).rejects.toThrow(
      'Debes iniciar sesión',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws when habitacionId is missing', async () => {
    await expect(
      bookRoom({...validParams, habitacionId: ''}),
    ).rejects.toThrow('Faltan datos');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws expired-session message on 401', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({detail: 'Token expirado'}, false, 401),
    );
    await expect(bookRoom(validParams)).rejects.toThrow(
      'Tu sesión ha expirado',
    );
  });

  it('throws expired-session message on 403', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({detail: 'forbidden'}, false, 403),
    );
    await expect(bookRoom(validParams)).rejects.toThrow(
      'Tu sesión ha expirado',
    );
  });

  it('throws with API detail string on other 4xx errors', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({detail: 'Habitación no disponible'}, false, 409),
    );
    await expect(bookRoom(validParams)).rejects.toThrow(
      'Habitación no disponible',
    );
  });

  it('throws with first validation message when detail is array', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(
        {detail: [{msg: 'Field required', loc: ['body', 'habitacionId']}]},
        false,
        422,
      ),
    );
    await expect(bookRoom(validParams)).rejects.toThrow('Field required');
  });

  it('throws network error when fetch rejects', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('ENOTFOUND')),
    );
    await expect(bookRoom(validParams)).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );
  });
});

describe('bookingApi.getBookings', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => makeResponse([])) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('GETs /api/v1/booking/get_bookings with bearer token', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([]),
    );
    await getBookings('tok_123');
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      'https://apitravelhub.site/api/v1/booking/get_bookings',
    );
    expect(options.method).toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer tok_123');
  });

  it('returns empty array when API responds with []', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([]),
    );
    const list = await getBookings('tok_123');
    expect(list).toEqual([]);
  });

  it('normalizes a booking item with all fields and converts total to COP', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([
        {
          id: 'b-1',
          nombreUser: 'Juan',
          descripcion: 'Vista ciudad',
          numHuespedes: 2,
          fechaCheckIn: '2026-05-19T00:00:00Z',
          fechaCheckOut: '2026-05-23T00:00:00Z',
          estado: 'PENDIENTE',
          nombreHotel: 'Hotel treta',
          direccion: 'Calle 123',
          ciudad: 'Madrid',
          pais: 'Spain',
          distancia: '3 km del centro',
          acceso: 'Metro',
          estrellas: 5,
          imagenes: ['https://example.com/1.jpg'],
          tipo_habitacion: 'deluxe',
          tipo_cama: ['king'],
          tamano_habitacion: '35m2',
          amenidades: ['AC', 'Wifi'],
          subtotal: 360.0,
          impuestos: 72.0,
          total: 432.0,
        },
      ]),
    );
    const list = await getBookings('tok_123');
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual(
      expect.objectContaining({
        id: 'b-1',
        nombreHotel: 'Hotel treta',
        descripcion: 'Vista ciudad',
        ciudad: 'Madrid',
        pais: 'Spain',
        direccion: 'Calle 123',
        distancia: '3 km del centro',
        acceso: 'Metro',
        estrellas: 5,
        estado: 'PENDIENTE',
        fechaCheckIn: '2026-05-19T00:00:00Z',
        fechaCheckOut: '2026-05-23T00:00:00Z',
        numHuespedes: 2,
        imagenes: ['https://example.com/1.jpg'],
        amenidades: ['AC', 'Wifi'],
        tipoHabitacion: 'deluxe',
        tipoCama: ['king'],
        tamanoHabitacion: '35m2',
        // 432 EUR * 4200 = 1814400 COP
        total: 1814400,
      }),
    );
  });

  it('preserves total without conversion when item explicitly says COP', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{id: 'b-2', total: 500000, moneda: 'COP'}]),
    );
    const list = await getBookings('tok_123');
    expect(list[0].total).toBe(500000);
  });

  it('throws when token is missing', async () => {
    await expect(getBookings('')).rejects.toThrow(
      'Debes iniciar sesión',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws expired-session message on 401', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({code: 401, message: 'Jwt expired'}, false, 401),
    );
    await expect(getBookings('tok_123')).rejects.toThrow(
      'Tu sesión ha expirado',
    );
  });

  it('uses message field when API returns {code, message} on errors', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({code: 500, message: 'Server crashed'}, false, 500),
    );
    await expect(getBookings('tok_123')).rejects.toThrow('Server crashed');
  });

  it('returns empty array if payload is not an array (defensive)', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({some: 'unexpected'}),
    );
    const list = await getBookings('tok_123');
    expect(list).toEqual([]);
  });

  it('throws network error when fetch rejects', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('ENOTFOUND')),
    );
    await expect(getBookings('tok_123')).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );
  });

  it('falls back to default values when fields are missing', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse([{}]),
    );
    const list = await getBookings('tok_123');
    expect(list[0]).toEqual(
      expect.objectContaining({
        id: 'booking-0',
        nombreHotel: 'Hospedaje',
        estado: 'PENDIENTE',
        numHuespedes: 1,
        total: 0,
        imagenes: [],
        amenidades: [],
        tipoCama: [],
        distancia: '',
        acceso: '',
      }),
    );
  });
});
