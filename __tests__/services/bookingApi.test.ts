import {bookRoom} from '../../src/services/bookingApi';

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
