import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ReservationPoliciesScreen} from '../../src/screens/ReservationPoliciesScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('ReservationPoliciesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header title', () => {
    const {getByText} = render(<ReservationPoliciesScreen />);
    expect(getByText('Políticas de reservación')).toBeTruthy();
  });

  it('renders body title', () => {
    const {getByText} = render(<ReservationPoliciesScreen />);
    expect(getByText('Términos y condiciones de reserva')).toBeTruthy();
  });

  it('renders policies body text', () => {
    const {getByTestId} = render(<ReservationPoliciesScreen />);
    const body = getByTestId('policies-body');
    expect(body.props.children).toMatch(/Lorem ipsum/);
  });

  it('calls goBack when back button is pressed', () => {
    const {getByTestId} = render(<ReservationPoliciesScreen />);
    fireEvent.press(getByTestId('policies-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
