import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {ReservationScreen} from '../../src/screens/ReservationScreen';
import {Room} from '../../src/data/room';
import {bookRoom} from '../../src/services/bookingApi';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('../../src/services/bookingApi', () => ({
  bookRoom: jest.fn(),
}));
const mockBookRoom = bookRoom as jest.Mock;

let mockAuthUser: {token: string} | null = {token: 'tok_user'};
jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser ? {id: 'u-1', name: 'U', email: 'u@x.com', token: mockAuthUser.token} : null,
    initializing: false,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

const mockRoom: Room = {
  id: 'room-1',
  nombreHotel: 'Hotel Casa del Coliseo',
  precio: 100000,
  direccion: 'Calle 10',
  capacidadMaxima: 2,
  distancia: '3 km',
  acceso: 'Metro',
  estrellas: 4,
  puntuacionResena: 4.2,
  cantidadResenas: 99,
  tipoHabitacion: 'Deluxe',
  tipoCama: ['king'],
  tamanoHabitacion: '35m2',
  amenidades: ['Wifi'],
  imagenes: ['https://example.com/1.jpg'],
};

const mockRouteParams = {
  room: mockRoom,
  nights: 4,
  destination: 'Cartagena, Colombia',
  dateRange: '19 marzo 2099 - 23 marzo 2099',
  adults: 2,
  checkin: '2099-03-19',
  checkout: '2099-03-23',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({params: mockRouteParams}),
}));

describe('ReservationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookRoom.mockReset();
    mockBookRoom.mockResolvedValue({id: 'booking-123'});
    mockAuthUser = {token: 'tok_user'};
  });

  it('renders title "Reservar"', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('Reservar')).toBeTruthy();
  });

  it('renders destino value', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('Cartagena, Colombia')).toBeTruthy();
  });

  it('renders hospedaje value (room name)', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('Hotel Casa del Coliseo')).toBeTruthy();
  });

  it('renders fecha (dateRange) value', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('19 marzo 2099 - 23 marzo 2099')).toBeTruthy();
  });

  it('renders número de adultos counter with current value', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('Número de adultos')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('renders capacity hint based on room.capacidadMaxima', () => {
    const {getByText} = render(<ReservationScreen />);
    // mockRoom.capacidadMaxima = 2 → "Capacidad máxima: 2 personas"
    expect(getByText(/Capacidad máxima: 2 personas/)).toBeTruthy();
  });

  it('renders subtotal (precio * nights) in es-CO', () => {
    // 100000 * 4 = 400000
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('COP $400.000')).toBeTruthy();
  });

  it('renders IVA 19% line', () => {
    // 400000 * 0.19 = 76000
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('IVA (19%)')).toBeTruthy();
    expect(getByText('COP $76.000')).toBeTruthy();
  });

  it('renders total including taxes', () => {
    // 400000 + 76000 = 476000
    const {getAllByText} = render(<ReservationScreen />);
    expect(getAllByText('COP $476.000').length).toBeGreaterThan(0);
  });

  it('renders cancellation policy', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText(/Cancelación gratuita/)).toBeTruthy();
  });

  it('renders tax policy', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText(/Los precios incluyen IVA/)).toBeTruthy();
  });

  it('renders RESERVAR button', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText('RESERVAR')).toBeTruthy();
  });

  it('shows Alert when PAGAR RESERVA is pressed after accepting policies', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirmar reserva',
      expect.stringContaining('confirmar la reserva'),
      expect.arrayContaining([
        expect.objectContaining({text: 'Cancelar'}),
        expect.objectContaining({text: 'Confirmar'}),
      ]),
    );
    alertSpy.mockRestore();
  });

  it('calls bookRoom with token + room data when Alert "Confirmar" is pressed', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Confirmar');
        confirmButton?.onPress?.();
      });
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    await waitFor(() => expect(mockBookRoom).toHaveBeenCalledTimes(1));
    expect(mockBookRoom).toHaveBeenCalledWith({
      habitacionId: 'room-1',
      checkin: '2099-03-19',
      checkout: '2099-03-23',
      numHuespedes: 2,
      token: 'tok_user',
    });
    alertSpy.mockRestore();
  });

  it('navigates to ReservationSuccess after a successful booking', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Confirmar');
        confirmButton?.onPress?.();
      });
    mockBookRoom.mockResolvedValueOnce({id: 'booking-xyz'});
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        'ReservationSuccess',
        expect.objectContaining({
          nombreHotel: 'Hotel Casa del Coliseo',
          destination: 'Cartagena, Colombia',
          dateRange: '19 marzo 2099 - 23 marzo 2099',
          nights: 4,
          adults: 2,
          total: 476000,
          confirmationCode: 'booking-xyz',
        }),
      ),
    );
    alertSpy.mockRestore();
  });

  it('shows Alert when bookRoom fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    alertSpy
      .mockImplementationOnce((_title, _msg, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Confirmar');
        confirmButton?.onPress?.();
      })
      .mockImplementation(() => {});
    mockBookRoom.mockRejectedValueOnce(new Error('Habitación no disponible'));
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Habitación no disponible',
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows Alert and does not call bookRoom when user is not logged in', async () => {
    mockAuthUser = null;
    const alertSpy = jest.spyOn(Alert, 'alert');
    alertSpy
      .mockImplementationOnce((_title, _msg, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Confirmar');
        confirmButton?.onPress?.();
      })
      .mockImplementation(() => {});
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Inicia sesión',
        expect.stringContaining('iniciar sesión'),
      ),
    );
    expect(mockBookRoom).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('does not navigate when Alert "Cancelar" is pressed', () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const cancelButton = buttons?.find(b => b.text === 'Cancelar');
        cancelButton?.onPress?.();
      });
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    fireEvent.press(getByTestId('reservation-pay-button'));
    expect(mockNavigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('PAGAR RESERVA is disabled until policies checkbox is accepted', () => {
    const {getByTestId} = render(<ReservationScreen />);
    const button = getByTestId('reservation-pay-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('PAGAR RESERVA becomes enabled after checking the policies checkbox', () => {
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-consent-checkbox'));
    const button = getByTestId('reservation-pay-button');
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it('does not open Alert when PAGAR is pressed without accepting policies', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-pay-button'));
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('navigates to ReservationPolicies when the policies link is pressed', () => {
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-policies-link'));
    expect(mockNavigate).toHaveBeenCalledWith('ReservationPolicies');
  });

  it('renders consent text "políticas de reservación"', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText(/políticas de reservación/)).toBeTruthy();
  });

  it('calls goBack when back button is pressed', () => {
    const {getByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders breakdown section with testID', () => {
    const {getByTestId} = render(<ReservationScreen />);
    expect(getByTestId('reservation-breakdown')).toBeTruthy();
  });

  it('renders policies section with testID', () => {
    const {getByTestId} = render(<ReservationScreen />);
    expect(getByTestId('reservation-policies')).toBeTruthy();
  });

  it('renders footer "Por N noches" with plural', () => {
    const {getByText} = render(<ReservationScreen />);
    expect(getByText(/4 noches/)).toBeTruthy();
  });

  it('opens date modal when Fecha card is pressed', () => {
    const {getByTestId, queryByTestId} = render(<ReservationScreen />);
    expect(queryByTestId('reservation-date-modal')).toBeNull();
    fireEvent.press(getByTestId('reservation-edit-dates'));
    expect(getByTestId('reservation-date-modal')).toBeTruthy();
  });

  it('closes date modal when Cancelar is pressed without changing dates', () => {
    const {getByTestId, getByText, queryByTestId} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-edit-dates'));
    fireEvent.press(getByTestId('reservation-date-cancel'));
    expect(queryByTestId('reservation-date-modal')).toBeNull();
    expect(getByText('19 marzo 2099 - 23 marzo 2099')).toBeTruthy();
  });

  it('updates dateRange, nights and total after confirming new dates in modal', () => {
    const {getByTestId, getByText, getAllByText} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-edit-dates'));
    // En el mes de marzo 2026: días 10 → 15 = 5 noches
    fireEvent.press(getByText('10'));
    fireEvent.press(getByText('15'));
    fireEvent.press(getByTestId('reservation-date-confirm'));
    expect(getByText(/10 marzo 2099 - 15 marzo 2099/)).toBeTruthy();
    expect(getByText(/5 noches/)).toBeTruthy();
    // 5 noches × 100000 = 500000, IVA 95000, total 595000
    expect(getAllByText('COP $595.000').length).toBeGreaterThan(0);
  });

  it('disables date confirm button until both dates are selected', () => {
    const {getByTestId, getByText} = render(<ReservationScreen />);
    fireEvent.press(getByTestId('reservation-edit-dates'));
    fireEvent.press(getByText('10'));
    const confirm = getByTestId('reservation-date-confirm');
    expect(confirm.props.accessibilityState?.disabled).toBe(true);
  });

  it('increment button stays disabled when adults equals capacidadMaxima', () => {
    // mockRoom.capacidadMaxima = 2 y adults inicia en 2 → + debe estar disabled
    const {getAllByText, getByText} = render(<ReservationScreen />);
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[0]);
    // No debe pasar de 2 (queda bloqueado)
    expect(getByText('2')).toBeTruthy();
  });

  it('decrements adults counter down to 1', () => {
    const {getAllByText, getByText} = render(<ReservationScreen />);
    const minusButtons = getAllByText('-');
    fireEvent.press(minusButtons[0]);
    expect(getByText('1')).toBeTruthy();
  });

  it('does not decrement adults below 1', () => {
    const {getAllByText, getByText} = render(<ReservationScreen />);
    const minusButtons = getAllByText('-');
    fireEvent.press(minusButtons[0]); // 2 -> 1
    fireEvent.press(minusButtons[0]); // disabled en 1
    expect(getByText('1')).toBeTruthy();
  });
});
