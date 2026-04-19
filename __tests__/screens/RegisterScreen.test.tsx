import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {RegisterScreen} from '../../src/screens/RegisterScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockRegister = jest.fn(() => Promise.resolve());

let mockAuthState = {loading: false};

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    initializing: false,
    loading: mockAuthState.loading,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
}));

// Helpers para llenar el formulario con datos válidos
const fillValidForm = (getByTestId: (id: string) => any) => {
  fireEvent.changeText(getByTestId('register-name'), 'Carlos Viajero');
  fireEvent.changeText(getByTestId('register-email'), 'carlos@example.com');
  fireEvent.changeText(getByTestId('register-phone'), '3001234567');
  fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
  fireEvent.changeText(getByTestId('register-confirm'), 'prueba12345');
  fireEvent.press(getByTestId('register-terms-checkbox'));
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {loading: false};
  });

  it('renders title "Crear cuenta"', () => {
    const {getAllByText} = render(<RegisterScreen />);
    expect(getAllByText('Crear cuenta').length).toBeGreaterThan(0);
  });

  it('renders form fields and selectors', () => {
    const {getByTestId} = render(<RegisterScreen />);
    expect(getByTestId('register-name')).toBeTruthy();
    expect(getByTestId('register-email')).toBeTruthy();
    expect(getByTestId('register-phone')).toBeTruthy();
    expect(getByTestId('register-password')).toBeTruthy();
    expect(getByTestId('register-confirm')).toBeTruthy();
    expect(getByTestId('register-country')).toBeTruthy();
    expect(getByTestId('register-language')).toBeTruthy();
    expect(getByTestId('register-currency')).toBeTruthy();
  });

  it('does not render a username field', () => {
    const {queryByTestId} = render(<RegisterScreen />);
    expect(queryByTestId('register-username')).toBeNull();
  });

  it('submit button is disabled initially', () => {
    const {getByTestId} = render(<RegisterScreen />);
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('remains disabled when only terms are accepted without form data', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-terms-checkbox'));
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('remains disabled when form is valid but terms are not accepted', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-name'), 'Carlos');
    fireEvent.changeText(getByTestId('register-email'), 'c@x.com');
    fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
    fireEvent.changeText(getByTestId('register-confirm'), 'prueba12345');
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('becomes enabled only when all fields are valid and terms accepted', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fillValidForm(getByTestId);
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('shows confirm-password error when passwords do not match', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
    fireEvent.changeText(getByTestId('register-confirm'), 'different123');
    expect(getByTestId('register-confirm-error')).toBeTruthy();
  });

  it('keeps button disabled when password is shorter than 8 chars', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-name'), 'Carlos');
    fireEvent.changeText(getByTestId('register-email'), 'c@x.com');
    fireEvent.changeText(getByTestId('register-password'), 'short');
    fireEvent.changeText(getByTestId('register-confirm'), 'short');
    fireEvent.press(getByTestId('register-terms-checkbox'));
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('keeps button disabled when email format is invalid', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-name'), 'Carlos');
    fireEvent.changeText(getByTestId('register-email'), 'not-an-email');
    fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
    fireEvent.changeText(getByTestId('register-confirm'), 'prueba12345');
    fireEvent.press(getByTestId('register-terms-checkbox'));
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('calls auth.register with nombre used as username and default selectors', async () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-name'), '  Carlos Viajero  ');
    fireEvent.changeText(getByTestId('register-email'), '  carlos@example.com  ');
    fireEvent.changeText(getByTestId('register-phone'), '  3001234567  ');
    fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
    fireEvent.changeText(getByTestId('register-confirm'), 'prueba12345');
    fireEvent.press(getByTestId('register-terms-checkbox'));
    fireEvent.press(getByTestId('register-submit-button'));
    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'carlos@example.com',
      username: 'Carlos Viajero',
      nombre: 'Carlos Viajero',
      password: 'prueba12345',
      telefono: '3001234567',
      pais: 'CO',
      idioma: 'es',
      moneda_preferida: 'COP',
    });
  });

  it('omits telefono when phone is empty', async () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-name'), 'Carlos');
    fireEvent.changeText(getByTestId('register-email'), 'c@x.com');
    fireEvent.changeText(getByTestId('register-password'), 'prueba12345');
    fireEvent.changeText(getByTestId('register-confirm'), 'prueba12345');
    fireEvent.press(getByTestId('register-terms-checkbox'));
    fireEvent.press(getByTestId('register-submit-button'));
    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    const call = mockRegister.mock.calls[0][0] as {telefono?: string};
    expect(call.telefono).toBeUndefined();
  });

  it('sends selected country/language/currency when user changes them', async () => {
    const {getByTestId} = render(<RegisterScreen />);
    fillValidForm(getByTestId);
    // Cambiar país a México
    fireEvent.press(getByTestId('register-country'));
    fireEvent.press(getByTestId('register-country-option-MX'));
    // Cambiar idioma a inglés
    fireEvent.press(getByTestId('register-language'));
    fireEvent.press(getByTestId('register-language-option-en'));
    // Cambiar moneda a EUR
    fireEvent.press(getByTestId('register-currency'));
    fireEvent.press(getByTestId('register-currency-option-EUR'));
    fireEvent.press(getByTestId('register-submit-button'));
    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    const call = mockRegister.mock.calls[0][0] as {
      pais: string;
      idioma: string;
      moneda_preferida: string;
    };
    expect(call.pais).toBe('MX');
    expect(call.idioma).toBe('en');
    expect(call.moneda_preferida).toBe('EUR');
  });

  it('does not call register when submit is pressed with invalid form', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-submit-button'));
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows Alert when register fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockRegister.mockImplementationOnce(() =>
      Promise.reject(new Error('Usuario ya existe')),
    );
    const {getByTestId} = render(<RegisterScreen />);
    fillValidForm(getByTestId);
    fireEvent.press(getByTestId('register-submit-button'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Usuario ya existe'),
    );
    alertSpy.mockRestore();
  });

  it('shows loading indicator when loading', () => {
    mockAuthState = {loading: true};
    const {getByTestId} = render(<RegisterScreen />);
    expect(getByTestId('register-loading')).toBeTruthy();
  });

  it('renders terms and conditions text', () => {
    const {getByText} = render(<RegisterScreen />);
    expect(getByText(/términos y condiciones de uso/)).toBeTruthy();
  });

  it('navigates to TermsAndConditions when terms link is pressed', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-terms-link'));
    expect(mockNavigate).toHaveBeenCalledWith('TermsAndConditions');
  });

  it('goes back when back button is pressed', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
