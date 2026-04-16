import {login} from '../../src/services/authApi';

describe('authApi.login', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with a user object after the simulated delay (email)', async () => {
    const promise = login('john.doe@example.com', 'secret');
    jest.advanceTimersByTime(1000);
    const user = await promise;
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john.doe@example.com',
      }),
    );
    expect(user.phone).toBeUndefined();
  });

  it('resolves with phone in user when identifier is phone', async () => {
    const promise = login('3001234567', 'secret');
    jest.advanceTimersByTime(1000);
    const user = await promise;
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Usuario',
        email: '',
        phone: '3001234567',
      }),
    );
  });

  it('rejects when identifier is empty', async () => {
    const promise = login('', 'secret');
    jest.advanceTimersByTime(1000);
    await expect(promise).rejects.toThrow('Credenciales incompletas');
  });

  it('rejects when password is empty', async () => {
    const promise = login('user@example.com', '');
    jest.advanceTimersByTime(1000);
    await expect(promise).rejects.toThrow('Credenciales incompletas');
  });

  it('capitalizes name from email with dots or underscores', async () => {
    const promise = login('maria_perez@mail.com', 'secret');
    jest.advanceTimersByTime(1000);
    const user = await promise;
    expect(user.name).toBe('Maria Perez');
  });
});
