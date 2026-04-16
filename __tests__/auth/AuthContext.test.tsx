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
      jest.advanceTimersByTime(1000);
      // allow the promise microtasks to flush
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
