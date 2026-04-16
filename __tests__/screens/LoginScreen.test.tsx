import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {LoginScreen} from '../../src/screens/LoginScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockLogin = jest.fn(() => Promise.resolve());
const mockNavigate = jest.fn();

let mockAuthState = {loading: false};

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    initializing: false,
    loading: mockAuthState.loading,
    login: mockLogin,
    logout: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({params: {}}),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {loading: false};
  });

  it('renders title "Iniciar sesión"', () => {
    const {getByText} = render(<LoginScreen />);
    expect(getByText('Iniciar sesión')).toBeTruthy();
  });

  it('renders both input fields and both buttons', () => {
    const {getByTestId, getByText} = render(<LoginScreen />);
    expect(getByTestId('login-email')).toBeTruthy();
    expect(getByTestId('login-password')).toBeTruthy();
    expect(getByText('INICIAR SESIÓN')).toBeTruthy();
    expect(getByText('CREAR CUENTA')).toBeTruthy();
    expect(getByText('¿No recuerdas tu contraseña?')).toBeTruthy();
  });

  it('disables INICIAR SESIÓN button initially', () => {
    const {getByTestId} = render(<LoginScreen />);
    const btn = getByTestId('login-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables INICIAR SESIÓN when valid email + password are entered', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('login-password'), 'secret');
    const btn = getByTestId('login-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('enables INICIAR SESIÓN when valid phone (7+ digits) + password', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), '3001234567');
    fireEvent.changeText(getByTestId('login-password'), 'secret');
    const btn = getByTestId('login-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('shows email error on blur when identifier is malformed', () => {
    const {getByTestId} = render(<LoginScreen />);
    const input = getByTestId('login-email');
    fireEvent.changeText(input, 'not-an-email');
    fireEvent(input, 'blur');
    expect(getByTestId('login-email-error')).toBeTruthy();
  });

  it('does not show email error before interaction', () => {
    const {queryByTestId} = render(<LoginScreen />);
    expect(queryByTestId('login-email-error')).toBeNull();
  });

  it('calls auth.login when INICIAR SESIÓN is pressed with valid form', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('login-password'), 'secret');
    fireEvent.press(getByTestId('login-submit-button'));
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret');
  });

  it('trims spaces from identifier before calling login', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), '  user@example.com  ');
    fireEvent.changeText(getByTestId('login-password'), 'secret');
    fireEvent.press(getByTestId('login-submit-button'));
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret');
  });

  it('does not call auth.login when form is invalid', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-submit-button'));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('navigates to Register when CREAR CUENTA is pressed', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-register-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('navigates to ForgotPassword when forgot link is pressed', () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-forgot-link'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('shows ActivityIndicator when loading', () => {
    mockAuthState = {loading: true};
    const {getByTestId} = render(<LoginScreen />);
    expect(getByTestId('login-loading')).toBeTruthy();
  });

  it('renders TravelHub logo image', () => {
    const {getByTestId} = render(<LoginScreen />);
    const logo = getByTestId('brand-logo');
    expect(logo).toBeTruthy();
    // resolveAssetSource would be ideal; at least verify a source prop exists
    expect(logo.props.source).toBeDefined();
  });
});
