import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {RegisterScreen} from '../../src/screens/RegisterScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title "Crear cuenta"', () => {
    const {getAllByText} = render(<RegisterScreen />);
    expect(getAllByText('Crear cuenta').length).toBeGreaterThan(0);
  });

  it('renders all form fields', () => {
    const {getByTestId} = render(<RegisterScreen />);
    expect(getByTestId('register-name')).toBeTruthy();
    expect(getByTestId('register-email')).toBeTruthy();
    expect(getByTestId('register-phone')).toBeTruthy();
    expect(getByTestId('register-password')).toBeTruthy();
    expect(getByTestId('register-confirm')).toBeTruthy();
  });

  it('submit button is disabled until terms checkbox is accepted', () => {
    const {getByTestId} = render(<RegisterScreen />);
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('submit button becomes enabled after checking terms', () => {
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-terms-checkbox'));
    const btn = getByTestId('register-submit-button');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('does not show Alert when submit is pressed without accepting terms', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-submit-button'));
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows Alert when submit button is pressed after accepting terms', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-terms-checkbox'));
    fireEvent.press(getByTestId('register-submit-button'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Crear cuenta',
      'Funcionalidad próximamente',
    );
    alertSpy.mockRestore();
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
