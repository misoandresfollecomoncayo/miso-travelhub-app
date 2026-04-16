import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {PaymentScreen} from '../../src/screens/PaymentScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();
const mockReplace = jest.fn();

const mockRouteParams = {
  nombreHotel: 'Hotel Casa del Coliseo',
  destination: 'Cartagena, Colombia',
  dateRange: '19 marzo 2099 - 23 marzo 2099',
  nights: 4,
  adults: 2,
  total: 476000,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
  }),
  useRoute: () => ({params: mockRouteParams}),
}));

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header title "Pago seguro"', () => {
    const {getByText} = render(<PaymentScreen />);
    expect(getByText('Pago seguro')).toBeTruthy();
  });

  it('renders total amount from params', () => {
    const {getByTestId} = render(<PaymentScreen />);
    expect(getByTestId('payment-total').props.children).toEqual([
      'COP $',
      '476.000',
    ]);
  });

  it('renders PAGAR button initially disabled', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const btn = getByTestId('payment-pay-button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('formats card number with spaces while typing', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const card = getByTestId('payment-card');
    fireEvent.changeText(card, '4111111111111111');
    expect(card.props.value).toBe('4111 1111 1111 1111');
  });

  it('formats expiry with slash while typing', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const expiry = getByTestId('payment-expiry');
    fireEvent.changeText(expiry, '1229');
    expect(expiry.props.value).toBe('12/29');
  });

  it('limits CVC to 3 digits', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const cvc = getByTestId('payment-cvc');
    fireEvent.changeText(cvc, '12345');
    expect(cvc.props.value).toBe('123');
  });

  it('shows card error on blur when invalid', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const card = getByTestId('payment-card');
    fireEvent.changeText(card, '1234');
    fireEvent(card, 'blur');
    expect(getByTestId('payment-card-error')).toBeTruthy();
  });

  it('shows expiry error on blur when invalid', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const expiry = getByTestId('payment-expiry');
    fireEvent.changeText(expiry, '13/99');
    fireEvent(expiry, 'blur');
    expect(getByTestId('payment-expiry-error')).toBeTruthy();
  });

  it('shows CVC error on blur when invalid', () => {
    const {getByTestId} = render(<PaymentScreen />);
    const cvc = getByTestId('payment-cvc');
    fireEvent.changeText(cvc, '12');
    fireEvent(cvc, 'blur');
    expect(getByTestId('payment-cvc-error')).toBeTruthy();
  });

  it('does not show errors before user interacts', () => {
    const {queryByTestId} = render(<PaymentScreen />);
    expect(queryByTestId('payment-card-error')).toBeNull();
    expect(queryByTestId('payment-expiry-error')).toBeNull();
    expect(queryByTestId('payment-cvc-error')).toBeNull();
  });

  it('enables PAGAR button when all three fields are valid', () => {
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.changeText(getByTestId('payment-card'), '4111111111111111');
    fireEvent.changeText(getByTestId('payment-expiry'), '1229');
    fireEvent.changeText(getByTestId('payment-cvc'), '123');
    const btn = getByTestId('payment-pay-button');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('shows loading state when PAGAR is pressed', () => {
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.changeText(getByTestId('payment-card'), '4111111111111111');
    fireEvent.changeText(getByTestId('payment-expiry'), '1229');
    fireEvent.changeText(getByTestId('payment-cvc'), '123');
    fireEvent.press(getByTestId('payment-pay-button'));
    expect(getByTestId('payment-loading')).toBeTruthy();
  });

  it('navigates to ReservationSuccess (via replace) after processing delay', () => {
    jest.useFakeTimers();
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.changeText(getByTestId('payment-card'), '4111111111111111');
    fireEvent.changeText(getByTestId('payment-expiry'), '1229');
    fireEvent.changeText(getByTestId('payment-cvc'), '123');
    fireEvent.press(getByTestId('payment-pay-button'));
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(mockReplace).toHaveBeenCalledWith(
      'ReservationSuccess',
      expect.objectContaining({
        nombreHotel: 'Hotel Casa del Coliseo',
        destination: 'Cartagena, Colombia',
        dateRange: '19 marzo 2099 - 23 marzo 2099',
        nights: 4,
        adults: 2,
        total: 476000,
        confirmationCode: expect.any(String),
      }),
    );
    jest.useRealTimers();
  });

  it('does not navigate before delay elapses', () => {
    jest.useFakeTimers();
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.changeText(getByTestId('payment-card'), '4111111111111111');
    fireEvent.changeText(getByTestId('payment-expiry'), '1229');
    fireEvent.changeText(getByTestId('payment-cvc'), '123');
    fireEvent.press(getByTestId('payment-pay-button'));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockReplace).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('does not pay when form is invalid', () => {
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.press(getByTestId('payment-pay-button'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('calls goBack when back button pressed', () => {
    const {getByTestId} = render(<PaymentScreen />);
    fireEvent.press(getByTestId('payment-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders card brand badges', () => {
    const {getByTestId} = render(<PaymentScreen />);
    expect(getByTestId('card-brand-badges')).toBeTruthy();
    expect(getByTestId('card-brand-visa')).toBeTruthy();
    expect(getByTestId('card-brand-mastercard')).toBeTruthy();
    expect(getByTestId('card-brand-amex')).toBeTruthy();
    expect(getByTestId('card-brand-diners')).toBeTruthy();
  });
});
