import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bypass the global mock for THIS file by re-requiring the actual module.
jest.unmock('../../src/preferences/PreferencesContext');

const {
  PreferencesProvider,
  usePreferences,
} = require('../../src/preferences/PreferencesContext');

const Harness: React.FC = () => {
  const {language, currency, initializing, setLanguage, setCurrency} =
    usePreferences();
  return (
    <>
      <Text testID="lang">{language}</Text>
      <Text testID="curr">{currency}</Text>
      <Text testID="init">{initializing ? 'true' : 'false'}</Text>
      <TouchableOpacity testID="set-en" onPress={() => setLanguage('en')}>
        <Text>en</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="set-eur" onPress={() => setCurrency('EUR')}>
        <Text>eur</Text>
      </TouchableOpacity>
    </>
  );
};

describe('PreferencesContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('defaults to es / COP when storage is empty', async () => {
    const {getByTestId} = render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('false'),
    );
    expect(getByTestId('lang').props.children).toBe('es');
    expect(getByTestId('curr').props.children).toBe('COP');
  });

  it('hydrates from AsyncStorage on mount', async () => {
    await AsyncStorage.setItem('@travelhub:language', 'en');
    await AsyncStorage.setItem('@travelhub:currency', 'EUR');
    const {getByTestId} = render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    await waitFor(() => expect(getByTestId('lang').props.children).toBe('en'));
    expect(getByTestId('curr').props.children).toBe('EUR');
  });

  it('falls back to defaults when stored values are invalid', async () => {
    await AsyncStorage.setItem('@travelhub:language', 'xx');
    await AsyncStorage.setItem('@travelhub:currency', 'JPY');
    const {getByTestId} = render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('false'),
    );
    expect(getByTestId('lang').props.children).toBe('es');
    expect(getByTestId('curr').props.children).toBe('COP');
  });

  it('persists setLanguage and updates state', async () => {
    const {getByTestId} = render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('false'),
    );
    await act(async () => {
      fireEvent.press(getByTestId('set-en'));
      await Promise.resolve();
    });
    expect(getByTestId('lang').props.children).toBe('en');
    expect(await AsyncStorage.getItem('@travelhub:language')).toBe('en');
  });

  it('persists setCurrency and updates state', async () => {
    const {getByTestId} = render(
      <PreferencesProvider>
        <Harness />
      </PreferencesProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('init').props.children).toBe('false'),
    );
    await act(async () => {
      fireEvent.press(getByTestId('set-eur'));
      await Promise.resolve();
    });
    expect(getByTestId('curr').props.children).toBe('EUR');
    expect(await AsyncStorage.getItem('@travelhub:currency')).toBe('EUR');
  });
});
