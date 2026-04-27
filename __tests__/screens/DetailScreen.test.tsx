import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {DetailScreen} from '../../src/screens/DetailScreen';
import {Room} from '../../src/data/room';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockRoom: Room = {
  id: 'room-1',
  nombreHotel: 'Hotel Casa del Coliseo',
  precio: 150000,
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
  amenidades: ['Internet Wifi', 'Agua caliente', 'Accesorios de baño', 'Restaurante'],
  imagenes: [
    'https://example.com/1.jpg',
    'https://example.com/2.jpg',
    'https://example.com/3.jpg',
  ],
};

let mockRouteParams: {
  room: Room;
  nights: number;
  destination: string;
  dateRange: string;
  adults: number;
  checkin: string;
  checkout: string;
} = {
  room: mockRoom,
  nights: 4,
  destination: 'Cartagena, Colombia',
  dateRange: '19 enero 2026 - 23 enero 2026',
  adults: 2,
  checkin: '2026-01-19',
  checkout: '2026-01-23',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({params: mockRouteParams}),
}));

describe('DetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      room: mockRoom,
      nights: 4,
      destination: 'Cartagena, Colombia',
      dateRange: '19 enero 2026 - 23 enero 2026',
      adults: 2,
      checkin: '2026-01-19',
      checkout: '2026-01-23',
    };
  });

  it('renders hotel name', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('Hotel Casa del Coliseo')).toBeTruthy();
  });

  it('renders total price (precio * nights) with es-CO format', () => {
    // 150000 * 4 = 600000 → "600.000"
    const {getByText} = render(<DetailScreen />);
    expect(getByText(/COP \$600\.000/)).toBeTruthy();
  });

  it('renders plural "noches" when nights > 1', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('Por 4 noches')).toBeTruthy();
  });

  it('renders singular "noche" when nights === 1', () => {
    mockRouteParams = {
      room: mockRoom,
      nights: 1,
      destination: 'Cartagena, Colombia',
      dateRange: '19 enero 2026 - 20 enero 2026',
      adults: 2,
      checkin: '2026-01-19',
      checkout: '2026-01-20',
    };
    const {getByText} = render(<DetailScreen />);
    expect(getByText('Por 1 noche')).toBeTruthy();
  });

  it('renders stars count label', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('4 estrellas')).toBeTruthy();
  });

  it('renders reviews count', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('99')).toBeTruthy();
    expect(getByText('Reseñas')).toBeTruthy();
  });

  it('renders all amenities', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('Internet Wifi')).toBeTruthy();
    expect(getByText('Agua caliente')).toBeTruthy();
    expect(getByText('Accesorios de baño')).toBeTruthy();
    expect(getByText('Restaurante')).toBeTruthy();
  });

  it('renders gallery counter starting at 1/total', () => {
    const {getByTestId} = render(<DetailScreen />);
    const counter = getByTestId('detail-gallery-counter');
    expect(counter).toBeTruthy();
    expect(counter.props.children).toBeDefined();
    // The counter renders "{currentIndex+1}/{totalImages}" → "1/3"
    const {getByText} = render(<DetailScreen />);
    expect(getByText('1/3')).toBeTruthy();
  });

  it('renders RESERVAR button', () => {
    const {getByText} = render(<DetailScreen />);
    expect(getByText('RESERVAR')).toBeTruthy();
  });

  it('navigates to Reservation when RESERVAR is pressed', () => {
    const {getByTestId} = render(<DetailScreen />);
    fireEvent.press(getByTestId('detail-reserve-button'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Reservation',
      expect.objectContaining({
        room: expect.objectContaining({nombreHotel: 'Hotel Casa del Coliseo'}),
        nights: 4,
        destination: 'Cartagena, Colombia',
        dateRange: '19 enero 2026 - 23 enero 2026',
        adults: 2,
        checkin: '2026-01-19',
        checkout: '2026-01-23',
      }),
    );
  });

  it('hides the footer (RESERVAR button) when viewOnly is true', () => {
    mockRouteParams = {
      ...mockRouteParams,
      viewOnly: true,
    };
    const {queryByTestId, queryByText} = render(<DetailScreen />);
    expect(queryByTestId('detail-footer')).toBeNull();
    expect(queryByTestId('detail-reserve-button')).toBeNull();
    expect(queryByText('RESERVAR')).toBeNull();
  });

  it('calls goBack when back button is pressed', () => {
    const {getByTestId} = render(<DetailScreen />);
    fireEvent.press(getByTestId('detail-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders placeholder image when imagenes is empty', () => {
    mockRouteParams = {
      room: {...mockRoom, imagenes: []},
      nights: 2,
      destination: 'Cartagena, Colombia',
      dateRange: '19 enero 2026 - 21 enero 2026',
      adults: 2,
      checkin: '2026-01-19',
      checkout: '2026-01-21',
    };
    const {getByText} = render(<DetailScreen />);
    // With placeholder, total becomes 1
    expect(getByText('1/1')).toBeTruthy();
  });

  it('renders amenities section with testID', () => {
    const {getByTestId} = render(<DetailScreen />);
    expect(getByTestId('detail-amenities')).toBeTruthy();
  });

  it('updates gallery counter on scroll to next image', () => {
    const {getByTestId, getByText} = render(<DetailScreen />);
    const gallery = getByTestId('detail-gallery');
    fireEvent(gallery, 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: {x: 400, y: 0},
        layoutMeasurement: {width: 400, height: 320},
        contentSize: {width: 1200, height: 320},
      },
    });
    expect(getByText('2/3')).toBeTruthy();
  });
});
