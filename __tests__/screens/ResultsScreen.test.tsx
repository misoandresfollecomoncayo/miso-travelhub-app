import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {ResultsScreen} from '../../src/screens/ResultsScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      destination: 'Cartagena, Colombia',
      dateRange: '19 enero 2026 - 23 enero 2026',
      adults: 2,
      children: 0,
      ciudad: 'Cartagena',
      checkin: '2026-01-19',
      checkout: '2026-01-23',
      rooms: 1,
    },
  }),
}));

const mockApiRooms = [
  {
    id: '22222222-2222-2222-2222-000000000001',
    nombre_hotel: 'Hotel Casa del Coliseo',
    precio: 123456,
    direccion: 'Calle 123',
    capacidad_maxima: 2,
    distancia: '3 km del centro',
    acceso: 'Metro',
    estrellas: 5,
    puntuacion_resena: 4.2,
    cantidad_resenas: 99,
    tipo_habitacion: 'Deluxe',
    tipo_cama: ['king'],
    tamano_habitacion: '35m2',
    amenidades: ['AC', 'Wifi'],
    imagenes: ['https://example.com/1.jpg'],
  },
  {
    id: '22222222-2222-2222-2222-000000000002',
    nombre_hotel: 'Hotel Boutique Santo Toribio',
    precio: 189000,
    direccion: 'Gran Via 45',
    capacidad_maxima: 3,
    distancia: '1 km del centro',
    acceso: 'Bus',
    estrellas: 4,
    puntuacion_resena: 3.5,
    cantidad_resenas: 74,
    tipo_habitacion: 'Suite',
    tipo_cama: ['queen'],
    tamano_habitacion: '45m2',
    amenidades: ['AC'],
    imagenes: ['https://example.com/2.jpg'],
  },
];

describe('ResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiRooms),
      }),
    ) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('calls search_rooms endpoint with query params', async () => {
    render(<ResultsScreen />);
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/search/search_rooms');
    expect(calledUrl).toContain('ciudad=Cartagena');
    expect(calledUrl).toContain('checkin=2026-01-19');
    expect(calledUrl).toContain('checkout=2026-01-23');
    expect(calledUrl).toContain('group=2');
    expect(calledUrl).toContain('rooms=1');
  });

  it('renders title with accommodation count after load', async () => {
    const {findByText} = render(<ResultsScreen />);
    expect(
      await findByText(`${mockApiRooms.length} hospedajes encontrados`),
    ).toBeTruthy();
  });

  it('renders destination in summary', async () => {
    const {getByText} = render(<ResultsScreen />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(getByText(/Cartagena, Colombia/)).toBeTruthy();
  });

  it('renders date range in summary', async () => {
    const {getByText} = render(<ResultsScreen />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(getByText(/19 enero 2026/)).toBeTruthy();
  });

  it('renders summary labels', async () => {
    const {getByText} = render(<ResultsScreen />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(getByText('Destino: ')).toBeTruthy();
    expect(getByText('Fechas: ')).toBeTruthy();
    expect(getByText('Número de adultos: ')).toBeTruthy();
    expect(getByText('Número de habitaciones: ')).toBeTruthy();
  });

  it('renders edit button', async () => {
    const {getByText} = render(<ResultsScreen />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(getByText('\u270E')).toBeTruthy();
  });

  it('calls goBack when edit button is pressed', async () => {
    const {getByText} = render(<ResultsScreen />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    fireEvent.press(getByText('\u270E'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders accommodation cards from API response', async () => {
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText('Hotel Casa del Coliseo')).toBeTruthy();
    expect(await findByText('Hotel Boutique Santo Toribio')).toBeTruthy();
  });

  it('renders error message when fetch fails', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network down')),
    );
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText(/No se pudieron cargar/)).toBeTruthy();
    expect(await findByText('Network down')).toBeTruthy();
  });

  it('renders empty state when response has no rooms', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      }),
    );
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText(/No se encontraron hospedajes/)).toBeTruthy();
  });

  it('renders loading indicator initially', () => {
    const {getByTestId} = render(<ResultsScreen />);
    expect(getByTestId('results-loading')).toBeTruthy();
  });

  it('renders loading title while fetching', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText('Buscando hospedajes...')).toBeTruthy();
  });

  it('renders error title when fetch fails', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Fail')),
    );
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText('No se pudieron cargar los hospedajes')).toBeTruthy();
  });

  it('renders generic error for non-Error rejection', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject('string error'),
    );
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText('Error desconocido')).toBeTruthy();
  });

  it('renders HTTP error from non-ok response', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: () => Promise.resolve(null),
      }),
    );
    const {findByText} = render(<ResultsScreen />);
    expect(await findByText(/Error 503/)).toBeTruthy();
  });

  it('renders adults label in summary', async () => {
    const {findByText, getByText} = render(<ResultsScreen />);
    await findByText(`${mockApiRooms.length} hospedajes encontrados`);
    expect(getByText('Número de adultos: ')).toBeTruthy();
  });

  it('renders rooms label in summary', async () => {
    const {findByText, getByText} = render(<ResultsScreen />);
    await findByText(`${mockApiRooms.length} hospedajes encontrados`);
    expect(getByText('Número de habitaciones: ')).toBeTruthy();
  });
});
