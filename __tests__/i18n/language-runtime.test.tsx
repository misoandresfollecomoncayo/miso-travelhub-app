/**
 * i18n — cambio de idioma en tiempo de ejecución.
 *
 * Verifica que al alternar `language` en `PreferencesContext`, el árbol de
 * componentes que consume `useT()` se re-renderiza con las traducciones del
 * idioma nuevo, sin necesidad de recargar la app.
 *
 * Cubre la propiedad principal de la implementación: como `useT()` lee
 * `language` del contexto, cualquier cambio dispara un re-render Reactivo.
 */
import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {useT} from '../../src/i18n/useT';

// Bypasea el mock global de PreferencesContext que existe en jest.setup.js.
jest.unmock('../../src/preferences/PreferencesContext');

const {
  PreferencesProvider,
  usePreferences,
} = require('../../src/preferences/PreferencesContext');

const Probe: React.FC = () => {
  const t = useT();
  const {language, setLanguage, initializing} = usePreferences();
  if (initializing) {
    return <Text testID="init">loading</Text>;
  }
  return (
    <>
      <Text testID="init">ready</Text>
      <Text testID="lang">{language}</Text>
      <Text testID="profile-title">{t('profile.title')}</Text>
      <Text testID="search-title">{t('search.title')}</Text>
      <Text testID="login-submit">{t('login.submitButton')}</Text>
      <Text testID="reservation-pay">{t('reservation.payButton')}</Text>
      <Text testID="adults-counter-label">{t('search.adults')}</Text>
      <TouchableOpacity testID="to-en" onPress={() => setLanguage('en')}>
        <Text>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="to-es" onPress={() => setLanguage('es')}>
        <Text>ES</Text>
      </TouchableOpacity>
    </>
  );
};

const renderReady = async () => {
  const utils = render(
    <PreferencesProvider>
      <Probe />
    </PreferencesProvider>,
  );
  // Esperar a que el bootstrap async de AsyncStorage termine. Sin esto,
  // un setLanguage() temprano sería sobreescrito por el efecto inicial.
  await waitFor(() =>
    expect(utils.getByTestId('init').props.children).toBe('ready'),
  );
  return utils;
};

const switchTo = async (
  getByTestId: ReturnType<typeof render>['getByTestId'],
  target: 'to-en' | 'to-es',
  expectedLang: 'es' | 'en',
) => {
  await act(async () => {
    fireEvent.press(getByTestId(target));
  });
  // setLanguage es async (escribe AsyncStorage); esperamos a que el
  // re-render llegue antes de continuar.
  await waitFor(() =>
    expect(getByTestId('lang').props.children).toBe(expectedLang),
  );
};

describe('i18n — runtime language switching', () => {
  it('starts in Spanish by default', async () => {
    const {getByTestId} = await renderReady();
    expect(getByTestId('lang').props.children).toBe('es');
    expect(getByTestId('profile-title').props.children).toBe('Mi perfil');
    expect(getByTestId('search-title').props.children).toBe('Buscar hospedaje');
  });

  it('updates ALL translated strings simultaneously when language → en', async () => {
    const {getByTestId} = await renderReady();

    await switchTo(getByTestId, 'to-en', 'en');

    expect(getByTestId('profile-title').props.children).toBe('My profile');
    expect(getByTestId('search-title').props.children).toBe('Find a stay');
    expect(getByTestId('login-submit').props.children).toBe('SIGN IN');
    expect(getByTestId('reservation-pay').props.children).toBe('BOOK');
    expect(getByTestId('adults-counter-label').props.children).toBe(
      'Number of adults',
    );
  });

  it('switches back from en → es restoring Spanish strings', async () => {
    const {getByTestId} = await renderReady();
    await switchTo(getByTestId, 'to-en', 'en');
    expect(getByTestId('profile-title').props.children).toBe('My profile');
    await switchTo(getByTestId, 'to-es', 'es');
    expect(getByTestId('profile-title').props.children).toBe('Mi perfil');
  });
});
