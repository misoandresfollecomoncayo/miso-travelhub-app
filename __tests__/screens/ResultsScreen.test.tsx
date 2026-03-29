import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ResultsScreen} from '../../src/screens/ResultsScreen';
import {mockAccommodations} from '../../src/data/mockData';

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
    },
  }),
}));

describe('ResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title with accommodation count', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(
      getByText(`${mockAccommodations.length} hospedajes encontrados`),
    ).toBeTruthy();
  });

  it('renders destination in summary', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText(/Cartagena, Colombia/)).toBeTruthy();
  });

  it('renders date range in summary', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText(/19 enero 2026/)).toBeTruthy();
  });

  it('renders summary labels', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText('Destino: ')).toBeTruthy();
    expect(getByText('Fechas: ')).toBeTruthy();
    expect(getByText('Numero de adultos: ')).toBeTruthy();
  });

  it('renders edit button', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText('\u270E')).toBeTruthy();
  });

  it('calls goBack when edit button is pressed', () => {
    const {getByText} = render(<ResultsScreen />);
    fireEvent.press(getByText('\u270E'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders accommodation cards', () => {
    const {getByText} = render(<ResultsScreen />);
    expect(getByText('Hotel Casa del Coliseo')).toBeTruthy();
    expect(getByText('Hotel Boutique Santo Toribio')).toBeTruthy();
  });
});
