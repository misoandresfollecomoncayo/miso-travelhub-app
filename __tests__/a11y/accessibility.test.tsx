/**
 * Auditoría de accesibilidad sobre pantallas y componentes clave.
 *
 * Verifica que los elementos interactivos exponen:
 *   - `accessibilityRole` apropiado (button, link, radio, …)
 *   - `accessibilityLabel` no vacío
 *   - `accessibilityState` cuando aplica (disabled, selected)
 *
 * Estas pruebas no validan el comportamiento de VoiceOver/TalkBack en sí
 * (eso requiere E2E con device real), pero garantizan el contrato JSX
 * sobre el que esas tecnologías construyen su árbol semántico.
 */
import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  useRoute: () => ({params: {}}),
}));

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    initializing: false,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

import {SearchScreen} from '../../src/screens/SearchScreen';
import {LoginScreen} from '../../src/screens/LoginScreen';
import {SettingsScreen} from '../../src/screens/SettingsScreen';
import {CounterInput} from '../../src/components/CounterInput';

describe('A11y — SearchScreen', () => {
  it('the destination input exposes an accessibilityLabel', () => {
    const {getByTestId} = render(<SearchScreen />);
    const input = getByTestId('search-destination');
    expect(input.props.accessibilityLabel).toBe('Destino:');
  });

  it('the search button exposes role=button + accessibilityLabel', () => {
    const {getByTestId} = render(<SearchScreen />);
    const button = getByTestId('search-button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(typeof button.props.accessibilityLabel).toBe('string');
    expect(button.props.accessibilityLabel.length).toBeGreaterThan(0);
  });

  it('the search button reports disabled=true while the form is invalid', () => {
    const {getByTestId} = render(<SearchScreen />);
    const button = getByTestId('search-button');
    expect(button.props.accessibilityState).toEqual({disabled: true});
  });
});

describe('A11y — CounterInput', () => {
  it('decrement / increment buttons have role=button and labels', () => {
    const {getByTestId} = render(
      <CounterInput
        testID="ad"
        label="Adults"
        value={2}
        min={1}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    const dec = getByTestId('counter-ad-dec');
    const inc = getByTestId('counter-ad-inc');
    expect(dec.props.accessibilityRole).toBe('button');
    expect(inc.props.accessibilityRole).toBe('button');
    expect(dec.props.accessibilityLabel).toContain('Disminuir');
    expect(inc.props.accessibilityLabel).toContain('Aumentar');
    expect(dec.props.accessibilityLabel).toContain('Adults');
  });

  it('decrement reports disabled=true when at minimum', () => {
    const {getByTestId} = render(
      <CounterInput
        testID="ad"
        label="Adults"
        value={1}
        min={1}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(getByTestId('counter-ad-dec').props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(getByTestId('counter-ad-inc').props.accessibilityState).toEqual({
      disabled: false,
    });
  });

  it('increment reports disabled=true when at maximum', () => {
    const {getByTestId} = render(
      <CounterInput
        testID="ad"
        label="Adults"
        value={5}
        min={1}
        max={5}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(getByTestId('counter-ad-inc').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('current value cell exposes a meaningful accessibilityLabel', () => {
    const {getByTestId} = render(
      <CounterInput
        testID="ad"
        label="Adults"
        value={3}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(getByTestId('counter-ad-value').props.accessibilityLabel).toBe(
      'Adults: 3',
    );
  });
});

describe('A11y — LoginScreen', () => {
  it('primary action button has role=button + accessibilityLabel', () => {
    const {getByTestId} = render(<LoginScreen />);
    const submit = getByTestId('login-submit-button');
    expect(submit.props.accessibilityRole).toBe('button');
    expect(submit.props.accessibilityLabel.length).toBeGreaterThan(0);
  });

  it('register secondary action button has role=button + accessibilityLabel', () => {
    const {getByTestId} = render(<LoginScreen />);
    const register = getByTestId('login-register-button');
    expect(register.props.accessibilityRole).toBe('button');
    expect(register.props.accessibilityLabel.length).toBeGreaterThan(0);
  });

  it('forgot-password link has role=link', () => {
    const {getByTestId} = render(<LoginScreen />);
    expect(getByTestId('login-forgot-link').props.accessibilityRole).toBe(
      'link',
    );
  });
});

describe('A11y — SettingsScreen', () => {
  it('language option rows expose role=radio + accessibilityLabel', () => {
    const {getByTestId} = render(<SettingsScreen />);
    const opt = getByTestId('settings-language-es');
    expect(opt.props.accessibilityRole).toBe('radio');
    expect(opt.props.accessibilityLabel.length).toBeGreaterThan(0);
  });

  it('language option marks the active row with selected=true', () => {
    const {getByTestId} = render(<SettingsScreen />);
    const activeEs = getByTestId('settings-language-es');
    const inactiveEn = getByTestId('settings-language-en');
    expect(activeEs.props.accessibilityState).toEqual({selected: true});
    expect(inactiveEn.props.accessibilityState).toEqual({selected: false});
  });

  it('currency option rows expose role=radio', () => {
    const {getByTestId} = render(<SettingsScreen />);
    expect(getByTestId('settings-currency-COP').props.accessibilityRole).toBe(
      'radio',
    );
    expect(getByTestId('settings-currency-EUR').props.accessibilityRole).toBe(
      'radio',
    );
    expect(getByTestId('settings-currency-USD').props.accessibilityRole).toBe(
      'radio',
    );
  });

  it('back button has role=button + accessibilityLabel', () => {
    const {getByTestId} = render(<SettingsScreen />);
    const back = getByTestId('settings-back-button');
    expect(back.props.accessibilityRole).toBe('button');
    expect(back.props.accessibilityLabel.length).toBeGreaterThan(0);
  });
});
