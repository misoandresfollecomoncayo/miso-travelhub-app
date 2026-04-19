import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthProvider, useAuth} from '../../src/auth/AuthContext';

const STORAGE_KEY = '@travelhub:user';

jest.useFakeTimers();

interface HarnessProps {
  onReady?: (ctx: ReturnType<typeof useAuth>) => void;
}

const Harness: React.FC<HarnessProps> = ({onReady}) => {
  const ctx = useAuth();
  React.useEffect(() => {
    if (onReady) {
      onReady(ctx);
    }
  }, [ctx, onReady]);

  return (
    <>
      <Text testID="init">{ctx.initializing ? 'init' : 'ready'}</Text>
      <Text testID="user">{ctx.user ? ctx.user.name : 'no-user'}</Text>
      <Text testID="loading">{ctx.loading ? 'loading' : 'idle'}</Text>
      <TouchableOpacity
        testID="login-btn"
        onPress={() => ctx.login('test@example.com', 'password')}>
        <Text>login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="register-btn"
        onPress={() =>
          ctx.register({
            email: 'new@example.com',
            username: 'newuser',
            nombre: 'New User',
            password: 'prueba12345',
          })
        }>
        <Text>register</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logout-btn" onPress={() => ctx.logout()}>
        <Text>logout</Text>
      </TouchableOpacity>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with initializing=true, user=null when no stored user', async () => {
    const {getByTestId} = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('ready'),
    );
    expect(getByTestId('user').props.children).toBe('no-user');
  });

  it('restores user from AsyncStorage on mount', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({id: '1', name: 'Stored User', email: 's@x.com'}),
    );
    const {getByTestId} = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('user').props.children).toBe('Stored User'),
    );
  });

  it('login stores user in AsyncStorage and updates state', async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            access_token: 'tok_abc',
            user: {
              id: 'u-1',
              name: 'Test',
              email: 'test@example.com',
            },
          }),
      }),
    ) as jest.Mock;

    const {getByTestId} = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('ready'),
    );

    await act(async () => {
      fireEvent.press(getByTestId('login-btn'));
      // allow the promise microtasks (fetch + json + AsyncStorage) to flush
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(getByTestId('user').props.children).toBe('Test'),
    );
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual(
      expect.objectContaining({name: 'Test', email: 'test@example.com'}),
    );
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('register calls API register then logs in and persists user', async () => {
    const fetchMock = jest.fn();
    // Primera llamada: register responde con el perfil (sin token)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'u-10',
            email: 'new@example.com',
            username: 'newuser',
            nombre: 'New User',
          }),
      }),
    );
    // Segunda llamada: login auto-encadenado responde con token+user
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            access_token: 'tok_register',
            user: {
              id: 'u-10',
              nombre: 'New User',
              email: 'new@example.com',
            },
          }),
      }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const {getByTestId} = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('ready'),
    );

    await act(async () => {
      fireEvent.press(getByTestId('register-btn'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(getByTestId('user').props.children).toBe('New User'),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [registerUrl] = fetchMock.mock.calls[0];
    const [loginUrl] = fetchMock.mock.calls[1];
    expect(registerUrl).toContain('/api/v1/auth/register');
    expect(loginUrl).toContain('/api/v1/auth/login');
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    fetchMock.mockReset();
  });

  it('logout clears user and removes from AsyncStorage', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({id: '1', name: 'U', email: 'u@x.com'}),
    );
    const {getByTestId} = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByTestId('user').props.children).toBe('U'));

    await act(async () => {
      fireEvent.press(getByTestId('logout-btn'));
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(getByTestId('user').props.children).toBe('no-user'),
    );
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();
  });
});
