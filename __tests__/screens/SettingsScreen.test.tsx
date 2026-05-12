import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

const setLanguageMock = jest.fn(() => Promise.resolve());
const setCurrencyMock = jest.fn(() => Promise.resolve());
let mockPrefs = {
  language: 'es' as 'es' | 'en',
  currency: 'COP' as 'COP' | 'EUR' | 'USD',
  initializing: false,
  setLanguage: setLanguageMock,
  setCurrency: setCurrencyMock,
};

jest.mock('../../src/preferences/PreferencesContext', () => ({
  PreferencesProvider: ({children}: {children: React.ReactNode}) => children,
  usePreferences: () => mockPrefs,
  SUPPORTED_LANGUAGES: ['es', 'en'],
  SUPPORTED_CURRENCIES: ['COP', 'EUR', 'USD'],
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: jest.fn()}),
  useRoute: () => ({params: {}}),
}));

import {SettingsScreen} from '../../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefs = {
      language: 'es',
      currency: 'COP',
      initializing: false,
      setLanguage: setLanguageMock,
      setCurrency: setCurrencyMock,
    };
  });

  it('renders the screen title', () => {
    const {getByText} = render(<SettingsScreen />);
    expect(getByText('Configuración')).toBeTruthy();
  });

  it('renders both language options', () => {
    const {getByTestId} = render(<SettingsScreen />);
    expect(getByTestId('settings-language-es')).toBeTruthy();
    expect(getByTestId('settings-language-en')).toBeTruthy();
  });

  it('renders all three currency options', () => {
    const {getByTestId} = render(<SettingsScreen />);
    expect(getByTestId('settings-currency-COP')).toBeTruthy();
    expect(getByTestId('settings-currency-EUR')).toBeTruthy();
    expect(getByTestId('settings-currency-USD')).toBeTruthy();
  });

  it('calls setLanguage when an option is tapped', () => {
    const {getByTestId} = render(<SettingsScreen />);
    fireEvent.press(getByTestId('settings-language-en'));
    expect(setLanguageMock).toHaveBeenCalledWith('en');
  });

  it('calls setCurrency when a currency option is tapped', () => {
    const {getByTestId} = render(<SettingsScreen />);
    fireEvent.press(getByTestId('settings-currency-USD'));
    expect(setCurrencyMock).toHaveBeenCalledWith('USD');
  });

  it('renders the labels in english when language is en', () => {
    mockPrefs = {...mockPrefs, language: 'en'};
    const {getByText} = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('Currency')).toBeTruthy();
  });

  it('marks the active language as selected', () => {
    mockPrefs = {...mockPrefs, language: 'en'};
    const {getByTestId} = render(<SettingsScreen />);
    const enRow = getByTestId('settings-language-en');
    expect(enRow.props.accessibilityState).toEqual({selected: true});
  });

  it('marks the active currency as selected', () => {
    mockPrefs = {...mockPrefs, currency: 'EUR'};
    const {getByTestId} = render(<SettingsScreen />);
    const eurRow = getByTestId('settings-currency-EUR');
    expect(eurRow.props.accessibilityState).toEqual({selected: true});
  });

  it('calls goBack when the back button is pressed', () => {
    const {getByTestId} = render(<SettingsScreen />);
    fireEvent.press(getByTestId('settings-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
