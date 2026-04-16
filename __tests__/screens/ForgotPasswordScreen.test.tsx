import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {ForgotPasswordScreen} from '../../src/screens/ForgotPasswordScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack}),
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title "Recuperar contraseña"', () => {
    const {getAllByText} = render(<ForgotPasswordScreen />);
    expect(getAllByText('Recuperar contraseña').length).toBeGreaterThan(0);
  });

  it('renders email field', () => {
    const {getByTestId} = render(<ForgotPasswordScreen />);
    expect(getByTestId('forgot-email')).toBeTruthy();
  });

  it('shows Alert when submit button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<ForgotPasswordScreen />);
    fireEvent.press(getByTestId('forgot-submit-button'));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('goes back when back button is pressed', () => {
    const {getByTestId} = render(<ForgotPasswordScreen />);
    fireEvent.press(getByTestId('forgot-back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
