import React from 'react';
import {render} from '@testing-library/react-native';
import {ReservationSuccessScreen} from '../../src/screens/ReservationSuccessScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockRouteParams = {
  nombreHotel: 'Hotel Casa del Coliseo',
  destination: 'Cartagena, Colombia',
  dateRange: '19 marzo 2026 - 23 marzo 2026',
  nights: 4,
  adults: 2,
  total: 476000,
  confirmationCode: 'TH-ABC123-XYZ1',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popToTop: jest.fn(),
    getParent: jest.fn(),
  }),
  useRoute: () => ({params: mockRouteParams}),
}));

describe('ReservationSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders success icon', () => {
    const {getByTestId} = render(<ReservationSuccessScreen />);
    expect(getByTestId('success-icon')).toBeTruthy();
  });

  it('renders title "¡Reserva confirmada!"', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('¡Reserva confirmada!')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('Tu reserva ha sido registrada con éxito.')).toBeTruthy();
  });

  it('renders confirmation code', () => {
    const {getByTestId} = render(<ReservationSuccessScreen />);
    expect(getByTestId('success-code').props.children).toBe('TH-ABC123-XYZ1');
  });

  it('renders hospedaje name', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('Hotel Casa del Coliseo')).toBeTruthy();
  });

  it('renders destination', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('Cartagena, Colombia')).toBeTruthy();
  });

  it('renders date range', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('19 marzo 2026 - 23 marzo 2026')).toBeTruthy();
  });

  it('renders nights count', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('4 noches')).toBeTruthy();
  });

  it('renders singular "noche" when nights === 1', () => {
    (mockRouteParams as {nights: number}).nights = 1;
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('1 noche')).toBeTruthy();
    (mockRouteParams as {nights: number}).nights = 4; // reset
  });

  it('renders adults count in plural', () => {
    const {getByTestId} = render(<ReservationSuccessScreen />);
    expect(getByTestId('success-adults').props.children).toEqual([
      2,
      ' ',
      'adultos',
    ]);
  });

  it('renders singular "adulto" when adults === 1', () => {
    (mockRouteParams as {adults: number}).adults = 1;
    const {getByTestId} = render(<ReservationSuccessScreen />);
    expect(getByTestId('success-adults').props.children).toEqual([
      1,
      ' ',
      'adulto',
    ]);
    (mockRouteParams as {adults: number}).adults = 2; // reset
  });

  it('renders "Adultos" label', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('Adultos')).toBeTruthy();
  });

  it('renders total price in es-CO', () => {
    const {getByText} = render(<ReservationSuccessScreen />);
    expect(getByText('COP $476.000')).toBeTruthy();
  });
});
