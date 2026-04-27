import React from 'react';
import {render, waitFor, fireEvent} from '@testing-library/react-native';
import {ReservationsScreen} from '../../src/screens/ReservationsScreen';
import {getBookings, BookingListItem} from '../../src/services/bookingApi';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate}),
}));

jest.mock('../../src/services/bookingApi', () => ({
  getBookings: jest.fn(),
}));
const mockGetBookings = getBookings as jest.Mock;

let mockAuth: {
  user: {token: string} | null;
  initializing: boolean;
} = {user: {token: 'tok_user'}, initializing: false};

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuth.user
      ? {id: 'u-1', name: 'U', email: 'u@x.com', token: mockAuth.user.token}
      : null,
    initializing: mockAuth.initializing,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

const sampleBooking: BookingListItem = {
  id: 'b-1',
  nombreHotel: 'Hotel Treta',
  descripcion: 'Vista ciudad',
  ciudad: 'Madrid',
  pais: 'Spain',
  direccion: 'Calle 123',
  estrellas: 5,
  estado: 'PENDIENTE',
  fechaCheckIn: '2026-05-19T00:00:00Z',
  fechaCheckOut: '2026-05-23T00:00:00Z',
  numHuespedes: 2,
  imagenes: ['https://example.com/img.jpg'],
  amenidades: ['Wifi'],
  tipoHabitacion: 'deluxe',
  tamanoHabitacion: '35m2',
  tipoCama: ['king'],
  distancia: '3 km',
  acceso: 'Metro',
  total: 1814400,
};

describe('ReservationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBookings.mockReset();
    mockAuth = {user: {token: 'tok_user'}, initializing: false};
  });

  it('renders title', async () => {
    mockGetBookings.mockResolvedValueOnce([]);
    const {getByText} = render(<ReservationsScreen />);
    await waitFor(() => expect(mockGetBookings).toHaveBeenCalled());
    expect(getByText('Reservas')).toBeTruthy();
  });

  it('shows login prompt when user is not logged in', () => {
    mockAuth = {user: null, initializing: false};
    const {getByText} = render(<ReservationsScreen />);
    expect(getByText('Inicia sesión')).toBeTruthy();
    expect(getByText(/Inicia sesión para ver tus reservas/)).toBeTruthy();
    expect(mockGetBookings).not.toHaveBeenCalled();
  });

  it('shows loading indicator while fetching', () => {
    mockGetBookings.mockImplementationOnce(() => new Promise(() => {}));
    const {getByTestId} = render(<ReservationsScreen />);
    expect(getByTestId('reservations-loading')).toBeTruthy();
  });

  it('shows empty state when API returns no bookings', async () => {
    mockGetBookings.mockResolvedValueOnce([]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('Aún no tienes reservas')).toBeTruthy();
  });

  it('renders booking cards from API response', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText, getByTestId} = render(<ReservationsScreen />);
    expect(await findByText('Hotel Treta')).toBeTruthy();
    expect(getByTestId(`booking-card-${sampleBooking.id}`)).toBeTruthy();
  });

  it('renders status label badge with friendly text', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('Pendiente')).toBeTruthy();
  });

  it('renders confirmed badge for CONFIRMADA', async () => {
    mockGetBookings.mockResolvedValueOnce([
      {...sampleBooking, estado: 'CONFIRMADA'},
    ]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('Confirmada')).toBeTruthy();
  });

  it('renders ciudad and pais', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('Madrid, Spain')).toBeTruthy();
  });

  it('renders date range with abbreviated month names', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText(/19 may 2026 → 23 may 2026/)).toBeTruthy();
  });

  it('renders guests count with plural', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('2 huéspedes')).toBeTruthy();
  });

  it('renders guests count in singular', async () => {
    mockGetBookings.mockResolvedValueOnce([
      {...sampleBooking, numHuespedes: 1},
    ]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText('1 huésped')).toBeTruthy();
  });

  it('renders total formatted in es-CO', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText} = render(<ReservationsScreen />);
    expect(await findByText(/COP \$1\.814\.400/)).toBeTruthy();
  });

  it('shows error state with retry button when fetch fails', async () => {
    mockGetBookings.mockRejectedValueOnce(new Error('Network down'));
    const {findByText, getByTestId} = render(<ReservationsScreen />);
    expect(
      await findByText('No se pudieron cargar tus reservas'),
    ).toBeTruthy();
    expect(getByTestId('reservations-retry')).toBeTruthy();
  });

  it('retries fetching when retry button is pressed', async () => {
    mockGetBookings.mockRejectedValueOnce(new Error('Boom'));
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByText, getByTestId} = render(<ReservationsScreen />);
    await findByText('No se pudieron cargar tus reservas');
    fireEvent.press(getByTestId('reservations-retry'));
    expect(await findByText('Hotel Treta')).toBeTruthy();
    expect(mockGetBookings).toHaveBeenCalledTimes(2);
  });

  it('calls getBookings with the user token on mount', async () => {
    mockGetBookings.mockResolvedValueOnce([]);
    render(<ReservationsScreen />);
    await waitFor(() =>
      expect(mockGetBookings).toHaveBeenCalledWith('tok_user'),
    );
  });

  it('navigates to BookingDetail when a booking card is pressed', async () => {
    mockGetBookings.mockResolvedValueOnce([sampleBooking]);
    const {findByTestId} = render(<ReservationsScreen />);
    const card = await findByTestId(`booking-card-${sampleBooking.id}`);
    fireEvent.press(card);
    expect(mockNavigate).toHaveBeenCalledWith('BookingDetail', {
      booking: sampleBooking,
    });
  });
});
