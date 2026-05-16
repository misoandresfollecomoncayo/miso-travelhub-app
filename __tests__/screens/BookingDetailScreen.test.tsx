import React from 'react';
import {Linking} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

let mockPrefsCurrency: 'COP' | 'EUR' | 'USD' = 'COP';
let mockPrefsLanguage: 'es' | 'en' = 'es';

jest.mock('../../src/preferences/PreferencesContext', () => ({
  PreferencesProvider: ({children}: {children: React.ReactNode}) => children,
  usePreferences: () => ({
    language: mockPrefsLanguage,
    currency: mockPrefsCurrency,
    initializing: false,
    setLanguage: jest.fn(),
    setCurrency: jest.fn(),
  }),
  SUPPORTED_LANGUAGES: ['es', 'en'],
  SUPPORTED_CURRENCIES: ['COP', 'EUR', 'USD'],
}));

let mockAuthUser: {token: string} | null = {token: 'tok_user'};
jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser
      ? {id: 'u-1', name: 'U', email: 'u@x.com', token: mockAuthUser.token}
      : null,
    initializing: false,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

const mockGetBookings = jest.fn();
jest.mock('../../src/services/bookingApi', () => {
  const actual = jest.requireActual('../../src/services/bookingApi');
  return {
    ...actual,
    getBookings: (...args: unknown[]) => mockGetBookings(...args),
  };
});

import {
  BookingDetailScreen,
  buildPaymentUrl,
} from '../../src/screens/BookingDetailScreen';
import {BookingListItem} from '../../src/services/bookingApi';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

const sampleBooking: BookingListItem = {
  id: 'BKG-00001',
  nombreHotel: 'Hotel Casa del Coliseo',
  descripcion: 'Vista al mar',
  ciudad: 'Cartagena',
  pais: 'Colombia',
  direccion: 'Calle 10',
  estrellas: 4,
  estado: 'CONFIRMADA',
  fechaCheckIn: '2026-03-19T00:00:00Z',
  fechaCheckOut: '2026-03-23T00:00:00Z',
  numHuespedes: 2,
  imagenes: ['https://example.com/img.jpg'],
  amenidades: ['Wifi'],
  tipoHabitacion: 'Deluxe',
  tamanoHabitacion: '35m2',
  tipoCama: ['king'],
  distancia: '3 km del centro',
  acceso: 'Metro',
  total: 493824,
  moneda: 'COP',
};

let mockRouteBooking: BookingListItem | undefined = sampleBooking;
let mockRouteBookingId: string | undefined;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack, navigate: mockNavigate}),
  useRoute: () => ({
    params: {booking: mockRouteBooking, bookingId: mockRouteBookingId},
  }),
}));

describe('BookingDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteBooking = sampleBooking;
    mockRouteBookingId = undefined;
    mockPrefsCurrency = 'COP';
    mockPrefsLanguage = 'es';
    mockAuthUser = {token: 'tok_user'};
    mockGetBookings.mockReset();
  });

  it('renders header title "Consultar reserva"', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('Consultar reserva')).toBeTruthy();
  });

  it('renders the booking id', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('BKG-00001')).toBeTruthy();
  });

  it('renders destination as ciudad + pais', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('Cartagena, Colombia')).toBeTruthy();
  });

  it('renders the hospedaje name', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('Hotel Casa del Coliseo')).toBeTruthy();
  });

  it('renders the date range with full month names', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('19 marzo 2026 - 23 marzo 2026')).toBeTruthy();
  });

  it('renders the number of adults', () => {
    const {getByTestId, getByText} = render(<BookingDetailScreen />);
    expect(getByTestId('booking-detail-guests')).toBeTruthy();
    expect(getByText('Número de adultos:')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('renders the total in COP format', () => {
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('COP $493.824')).toBeTruthy();
  });

  it('renders the QR code with the booking id as value when status is PAGADA', () => {
    mockRouteBooking = {...sampleBooking, estado: 'PAGADA'};
    const {getByTestId, UNSAFE_getByType} = render(<BookingDetailScreen />);
    expect(getByTestId('booking-detail-qr')).toBeTruthy();
    // The mocked QRCode is the string component 'QRCode' — find it by type.
    const qr = UNSAFE_getByType('QRCode' as unknown as React.ComponentType);
    expect(qr.props.value).toBe('BKG-00001');
  });

  it('renders all expected field testIDs', () => {
    const {getByTestId} = render(<BookingDetailScreen />);
    expect(getByTestId('booking-detail-id')).toBeTruthy();
    expect(getByTestId('booking-detail-destination')).toBeTruthy();
    expect(getByTestId('booking-detail-hospedaje')).toBeTruthy();
    expect(getByTestId('booking-detail-dates')).toBeTruthy();
    expect(getByTestId('booking-detail-guests')).toBeTruthy();
    expect(getByTestId('booking-detail-total')).toBeTruthy();
  });

  it('calls goBack when back button is pressed', () => {
    const {getByTestId} = render(<BookingDetailScreen />);
    fireEvent.press(getByTestId('booking-detail-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to Detail (viewOnly) when hospedaje field is pressed', () => {
    const {getByTestId} = render(<BookingDetailScreen />);
    fireEvent.press(getByTestId('booking-detail-hospedaje'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Detail',
      expect.objectContaining({
        viewOnly: true,
        adults: 2,
        checkin: '2026-03-19',
        checkout: '2026-03-23',
        nights: 4,
        room: expect.objectContaining({
          nombreHotel: 'Hotel Casa del Coliseo',
          direccion: 'Calle 10',
          estrellas: 4,
          tipoCama: ['king'],
          distancia: '3 km del centro',
          acceso: 'Metro',
        }),
      }),
    );
  });

  it('renders the status field with the translated label', () => {
    mockRouteBooking = {...sampleBooking, estado: 'CONFIRMADA'};
    const {getByTestId, getByText} = render(<BookingDetailScreen />);
    expect(getByTestId('booking-detail-status')).toBeTruthy();
    expect(getByText('Estado:')).toBeTruthy();
    expect(getByText('Confirmada')).toBeTruthy();
  });

  it('renders the pending status when estado is PENDIENTE', () => {
    mockRouteBooking = {...sampleBooking, estado: 'PENDIENTE'};
    const {getByText} = render(<BookingDetailScreen />);
    expect(getByText('Pendiente')).toBeTruthy();
  });

  it('shows QR when status is PAGADA', () => {
    mockRouteBooking = {...sampleBooking, estado: 'PAGADA'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeTruthy();
  });

  it('shows QR when status is pagada in lower-case (case-insensitive)', () => {
    mockRouteBooking = {...sampleBooking, estado: 'pagada'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeTruthy();
  });

  it('hides QR when status is PENDIENTE', () => {
    mockRouteBooking = {...sampleBooking, estado: 'PENDIENTE'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeNull();
  });

  it('hides QR when status is CONFIRMADA (not yet paid)', () => {
    mockRouteBooking = {...sampleBooking, estado: 'CONFIRMADA'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeNull();
  });

  it('hides QR when status is COMPLETADA', () => {
    mockRouteBooking = {...sampleBooking, estado: 'COMPLETADA'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeNull();
  });

  it('hides QR when status is CANCELADA', () => {
    mockRouteBooking = {...sampleBooking, estado: 'CANCELADA'};
    const {queryByTestId} = render(<BookingDetailScreen />);
    expect(queryByTestId('booking-detail-qr')).toBeNull();
  });

  describe('Pay button', () => {
    it('does NOT render when status is PENDIENTE', () => {
      mockRouteBooking = {...sampleBooking, estado: 'PENDIENTE'};
      const {queryByTestId} = render(<BookingDetailScreen />);
      expect(queryByTestId('booking-detail-pay-button')).toBeNull();
    });

    it('does NOT render when status is COMPLETADA', () => {
      mockRouteBooking = {...sampleBooking, estado: 'COMPLETADA'};
      const {queryByTestId} = render(<BookingDetailScreen />);
      expect(queryByTestId('booking-detail-pay-button')).toBeNull();
    });

    it('does NOT render when status is CANCELADA', () => {
      mockRouteBooking = {...sampleBooking, estado: 'CANCELADA'};
      const {queryByTestId} = render(<BookingDetailScreen />);
      expect(queryByTestId('booking-detail-pay-button')).toBeNull();
    });

    it('renders when status is CONFIRMADA', () => {
      mockRouteBooking = {...sampleBooking, estado: 'CONFIRMADA'};
      const {getByTestId, getByText} = render(<BookingDetailScreen />);
      expect(getByTestId('booking-detail-pay-button')).toBeTruthy();
      expect(getByText('PAGAR')).toBeTruthy();
    });

    it('opens the payment gateway with the booking total + moneda (COP)', () => {
      mockRouteBooking = {...sampleBooking, estado: 'CONFIRMADA'};
      // La preferencia del usuario es USD pero la reserva fue en COP — debe
      // enviarse la moneda y total de la reserva, NO la preferencia.
      mockPrefsCurrency = 'USD';
      const openSpy = jest
        .spyOn(Linking, 'openURL')
        .mockResolvedValue(undefined as unknown as void);
      const {getByTestId} = render(<BookingDetailScreen />);
      fireEvent.press(getByTestId('booking-detail-pay-button'));
      expect(openSpy).toHaveBeenCalledTimes(1);
      const calledUrl = openSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain(
        'https://miso-pasarela-pagos-evbwp.ondigitalocean.app/payment',
      );
      expect(calledUrl).toContain('invoiceId=BKG-00001');
      expect(calledUrl).toContain('amount=493824');
      expect(calledUrl).toContain('currency=COP');
      expect(calledUrl).toContain('lang=ES');
      expect(calledUrl).toContain('returnUrl=AppTravelhub');
      openSpy.mockRestore();
    });

    it('sends booking moneda=USD with two-decimal amount when booking was in USD', () => {
      mockRouteBooking = {
        ...sampleBooking,
        estado: 'CONFIRMADA',
        total: 96,
        moneda: 'USD',
      };
      // La preferencia del usuario es COP pero la reserva fue en USD — se
      // envía USD al gateway.
      mockPrefsCurrency = 'COP';
      const openSpy = jest
        .spyOn(Linking, 'openURL')
        .mockResolvedValue(undefined as unknown as void);
      const {getByTestId} = render(<BookingDetailScreen />);
      fireEvent.press(getByTestId('booking-detail-pay-button'));
      const calledUrl = openSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('amount=96.00');
      expect(calledUrl).toContain('currency=USD');
      openSpy.mockRestore();
    });

    it('sends booking moneda=EUR with two-decimal amount when booking was in EUR', () => {
      mockRouteBooking = {
        ...sampleBooking,
        estado: 'CONFIRMADA',
        total: 142.86,
        moneda: 'EUR',
      };
      mockPrefsCurrency = 'COP';
      const openSpy = jest
        .spyOn(Linking, 'openURL')
        .mockResolvedValue(undefined as unknown as void);
      const {getByTestId} = render(<BookingDetailScreen />);
      fireEvent.press(getByTestId('booking-detail-pay-button'));
      const calledUrl = openSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('amount=142.86');
      expect(calledUrl).toContain('currency=EUR');
      openSpy.mockRestore();
    });
  });

  describe('fetch-by-id mode (push notification deep-link)', () => {
    beforeEach(() => {
      // Cuando llegamos desde una push, no nos pasan `booking` — sólo `bookingId`.
      mockRouteBooking = undefined;
    });

    it('shows the loading spinner while resolving the bookingId', () => {
      mockRouteBookingId = 'BKG-00001';
      // Promesa que nunca resuelve para mantener al screen en loading state.
      mockGetBookings.mockImplementationOnce(() => new Promise(() => {}));
      const {getByTestId} = render(<BookingDetailScreen />);
      expect(getByTestId('booking-detail-loading')).toBeTruthy();
    });

    it('renders the booking once getBookings resolves with a matching id', async () => {
      mockRouteBookingId = 'BKG-00001';
      mockGetBookings.mockResolvedValueOnce([
        {...sampleBooking, id: 'OTHER'},
        sampleBooking,
      ]);
      const {findByText, queryByTestId} = render(<BookingDetailScreen />);
      // Aparece el id de la reserva resuelta.
      expect(await findByText('BKG-00001')).toBeTruthy();
      expect(queryByTestId('booking-detail-loading')).toBeNull();
    });

    it('calls getBookings with the user token and preferred currency', async () => {
      mockRouteBookingId = 'BKG-00001';
      mockPrefsCurrency = 'EUR';
      mockGetBookings.mockResolvedValueOnce([sampleBooking]);
      render(<BookingDetailScreen />);
      await waitFor(() =>
        expect(mockGetBookings).toHaveBeenCalledWith('tok_user', 'EUR'),
      );
    });

    it('shows the not-found error when the id does not match any booking', async () => {
      mockRouteBookingId = 'BKG-DOES-NOT-EXIST';
      mockGetBookings.mockResolvedValueOnce([sampleBooking]);
      const {findByTestId, findByText} = render(<BookingDetailScreen />);
      expect(await findByTestId('booking-detail-error')).toBeTruthy();
      expect(
        await findByText('No se encontró la reserva en tu cuenta.'),
      ).toBeTruthy();
    });

    it('shows a generic error when getBookings rejects', async () => {
      mockRouteBookingId = 'BKG-00001';
      mockGetBookings.mockRejectedValueOnce(new Error('Network down'));
      const {findByTestId, findByText} = render(<BookingDetailScreen />);
      expect(await findByTestId('booking-detail-error')).toBeTruthy();
      // El mensaje del error se propaga (no se traduce dentro del catch).
      expect(await findByText('Network down')).toBeTruthy();
    });

    it('shows the error state without calling getBookings when there is no session', async () => {
      mockRouteBookingId = 'BKG-00001';
      mockAuthUser = null;
      const {findByTestId} = render(<BookingDetailScreen />);
      expect(await findByTestId('booking-detail-error')).toBeTruthy();
      expect(mockGetBookings).not.toHaveBeenCalled();
    });

    it('still works if the route gives a `booking` object even with a bookingId (object wins)', () => {
      mockRouteBooking = sampleBooking;
      mockRouteBookingId = 'BKG-DIFFERENT';
      const {getByText} = render(<BookingDetailScreen />);
      // Renderiza sin fetch: el id que aparece es el del objeto, no el del param.
      expect(getByText('BKG-00001')).toBeTruthy();
      expect(mockGetBookings).not.toHaveBeenCalled();
    });
  });

  describe('buildPaymentUrl()', () => {
    it('builds the URL with all params upper-cased where needed', () => {
      const url = buildPaymentUrl({
        invoiceId: 'BKG-1',
        currency: 'eur',
        amount: 1234,
        lang: 'en',
      });
      expect(url).toContain('invoiceId=BKG-1');
      expect(url).toContain('currency=EUR');
      // No-COP currencies se serializan con 2 decimales.
      expect(url).toContain('amount=1234.00');
      expect(url).toContain('lang=EN');
      expect(url).toContain('returnUrl=AppTravelhub');
    });

    it('serializes COP amounts as integers (no decimals)', () => {
      const url = buildPaymentUrl({
        invoiceId: 'X',
        currency: 'COP',
        amount: 493824.6,
        lang: 'es',
      });
      // 493824.6 redondeado → 493825 (entero, sin punto)
      expect(url).toContain('amount=493825');
      expect(url).not.toContain('amount=493825.');
    });

    it('uses the gateway base URL', () => {
      const url = buildPaymentUrl({
        invoiceId: 'X',
        currency: 'COP',
        amount: 0,
        lang: 'es',
      });
      expect(url.startsWith(
        'https://miso-pasarela-pagos-evbwp.ondigitalocean.app/payment?',
      )).toBe(true);
    });
  });

});
