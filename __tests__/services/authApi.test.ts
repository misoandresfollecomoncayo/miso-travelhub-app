import {login, register} from '../../src/services/authApi';

const makeResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  });

describe('authApi.login', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => makeResponse({})) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('POSTs email and password to /api/v1/auth/login', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        access_token: 'tok_123',
        user: {
          id: 'u-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      }),
    );
    await login('john@example.com', 'secret');
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://apitravelhub.site/api/v1/auth/login');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      email: 'john@example.com',
      password: 'secret',
    });
  });

  it('returns a User from a nested response shape', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        access_token: 'tok_abc',
        user: {
          id: 'u-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      }),
    );
    const user = await login('john@example.com', 'secret');
    expect(user).toEqual(
      expect.objectContaining({
        id: 'u-1',
        name: 'John Doe',
        email: 'john@example.com',
        token: 'tok_abc',
      }),
    );
  });

  it('returns a User from a flat response shape', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        id: 'u-2',
        name: 'Maria Perez',
        email: 'maria@example.com',
        token: 'tok_xyz',
        phone: '3001234567',
      }),
    );
    const user = await login('maria@example.com', 'secret');
    expect(user).toEqual({
      id: 'u-2',
      name: 'Maria Perez',
      email: 'maria@example.com',
      token: 'tok_xyz',
      phone: '3001234567',
    });
  });

  it('derives a name from email when API omits it', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({id: 'u-3', email: 'jane.doe@example.com'}),
    );
    const user = await login('jane.doe@example.com', 'secret');
    expect(user.name).toBe('Jane Doe');
  });

  it('throws with detail string on non-ok response (401)', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({detail: 'Credenciales inválidas'}, false, 401),
    );
    await expect(login('user@example.com', 'wrong')).rejects.toThrow(
      'Credenciales inválidas',
    );
  });

  it('throws with first validation message when detail is an array', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(
        {detail: [{msg: 'Field required', loc: ['body', 'email']}]},
        false,
        422,
      ),
    );
    await expect(login('user@example.com', 'secret')).rejects.toThrow(
      'Field required',
    );
  });

  it('throws a generic network error when fetch rejects', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('ENOTFOUND')),
    );
    await expect(login('user@example.com', 'secret')).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );
  });

  it('rejects when email is empty', async () => {
    await expect(login('', 'secret')).rejects.toThrow('Credenciales incompletas');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('rejects when password is empty', async () => {
    await expect(login('user@example.com', '')).rejects.toThrow(
      'Credenciales incompletas',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('rejects when email format is invalid', async () => {
    await expect(login('not-an-email', 'secret')).rejects.toThrow(
      'Correo inválido',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('authApi.register', () => {
  const validParams = {
    email: 'user@example.com',
    username: 'user123',
    nombre: 'Carlos Viajero',
    password: 'prueba12345',
    telefono: '3001234567',
    pais: 'CO',
    idioma: 'es',
    moneda_preferida: 'COP',
  };

  beforeEach(() => {
    globalThis.fetch = jest.fn(() => makeResponse({})) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('POSTs all fields to /api/v1/auth/register', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        id: 'abc',
        email: validParams.email,
        username: validParams.username,
        nombre: validParams.nombre,
        telefono: validParams.telefono,
      }),
    );
    await register(validParams);
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://apitravelhub.site/api/v1/auth/register');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      email: 'user@example.com',
      username: 'user123',
      nombre: 'Carlos Viajero',
      password: 'prueba12345',
      telefono: '3001234567',
      pais: 'CO',
      idioma: 'es',
      moneda_preferida: 'COP',
    });
  });

  it('returns a User derived from API response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({
        id: 'abc',
        email: validParams.email,
        username: validParams.username,
        nombre: validParams.nombre,
        telefono: validParams.telefono,
      }),
    );
    const user = await register(validParams);
    expect(user).toEqual(
      expect.objectContaining({
        id: 'abc',
        name: 'Carlos Viajero',
        email: 'user@example.com',
        phone: '3001234567',
      }),
    );
  });

  it('omits optional fields when not provided', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({id: 'x', email: validParams.email, nombre: 'Minimal'}),
    );
    await register({
      email: validParams.email,
      username: validParams.username,
      nombre: 'Minimal',
      password: validParams.password,
    });
    const body = JSON.parse(
      (globalThis.fetch as jest.Mock).mock.calls[0][1].body,
    );
    expect(body).toEqual({
      email: validParams.email,
      username: validParams.username,
      nombre: 'Minimal',
      password: validParams.password,
    });
  });

  it('throws when email is missing', async () => {
    await expect(
      register({...validParams, email: ''}),
    ).rejects.toThrow('Faltan campos obligatorios');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws when username is missing', async () => {
    await expect(
      register({...validParams, username: ''}),
    ).rejects.toThrow('Faltan campos obligatorios');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws when nombre is missing', async () => {
    await expect(register({...validParams, nombre: ''})).rejects.toThrow(
      'Faltan campos obligatorios',
    );
  });

  it('throws when password is missing', async () => {
    await expect(
      register({...validParams, password: ''}),
    ).rejects.toThrow('Faltan campos obligatorios');
  });

  it('throws when email format is invalid', async () => {
    await expect(
      register({...validParams, email: 'not-an-email'}),
    ).rejects.toThrow('Correo inválido');
  });

  it('throws when password is shorter than 8 characters', async () => {
    await expect(
      register({...validParams, password: 'short'}),
    ).rejects.toThrow('al menos 8 caracteres');
  });

  it('throws with API error detail on 4xx response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse({detail: 'Usuario ya existe'}, false, 409),
    );
    await expect(register(validParams)).rejects.toThrow('Usuario ya existe');
  });

  it('throws with first validation message when detail is array', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      makeResponse(
        {detail: [{msg: 'String should have at least 8 characters'}]},
        false,
        422,
      ),
    );
    await expect(register(validParams)).rejects.toThrow(
      'String should have at least 8 characters',
    );
  });

  it('throws network error when fetch rejects', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('ENOTFOUND')),
    );
    await expect(register(validParams)).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );
  });
});
