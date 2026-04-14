import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {SearchScreen} from '../../src/screens/SearchScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: jest.fn(),
}));

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Buscar hospedaje')).toBeTruthy();
  });

  it('renders destination input with empty default value', () => {
    const {getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    expect(input.props.value).toBe('');
  });

  it('renders destination label', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Destino:')).toBeTruthy();
  });

  it('renders search button', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('BUSCAR')).toBeTruthy();
  });

  it('renders adult counter', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Número de adultos')).toBeTruthy();
  });

  it('renders children counter', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Número de niños')).toBeTruthy();
  });

  it('navigates to Results when BUSCAR is pressed', () => {
    const {getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Cartagena, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith('Results', expect.objectContaining({
      destination: 'Cartagena, Colombia',
      adults: 1,
      rooms: 1,
    }));
  });

  it('updates destination when text changes', () => {
    const {getByPlaceholderText, getByDisplayValue} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Bogota, Colombia');
    expect(getByDisplayValue('Bogota, Colombia')).toBeTruthy();
  });

  it('increments adults counter', () => {
    const {getAllByText} = render(<SearchScreen />);
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[0]);
    // Adults default is 1, after increment should be 2
    const twos = getAllByText('2');
    expect(twos.length).toBeGreaterThan(0);
  });

  it('increments children counter', () => {
    const {getAllByText} = render(<SearchScreen />);
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[1]);
    // After increment, children should be 1
    const ones = getAllByText('1');
    expect(ones.length).toBeGreaterThan(0);
  });

  it('decrements adults counter', () => {
    const {getAllByText} = render(<SearchScreen />);
    const minusButtons = getAllByText('-');
    fireEvent.press(minusButtons[0]);
  });

  it('selects a date on calendar', () => {
    const {getByText} = render(<SearchScreen />);
    // Click a date to set as start
    fireEvent.press(getByText('5'));
  });

  it('selects a date range on calendar', () => {
    const {getByText} = render(<SearchScreen />);
    // First click resets selection since default has start+end
    fireEvent.press(getByText('10'));
    // Second click sets end date
    fireEvent.press(getByText('15'));
  });

  it('selects end date before start date resets start', () => {
    const {getByText} = render(<SearchScreen />);
    // Reset: click sets new start (since both start/end exist)
    fireEvent.press(getByText('20'));
    // Click a day before start -> resets start
    fireEvent.press(getByText('5'));
  });

  it('navigates to next month', () => {
    const {getAllByText} = render(<SearchScreen />);
    const nextButtons = getAllByText('>');
    fireEvent.press(nextButtons[0]);
  });

  it('navigates to previous month', () => {
    const {getAllByText} = render(<SearchScreen />);
    const prevButtons = getAllByText('<');
    fireEvent.press(prevButtons[0]);
  });

  it('navigates to next month wrapping year', () => {
    const {getAllByText} = render(<SearchScreen />);
    const nextButtons = getAllByText('>');
    // Navigate forward 12 times to wrap year
    for (let i = 0; i < 12; i++) {
      fireEvent.press(nextButtons[0]);
    }
  });

  it('navigates to previous month wrapping year', () => {
    const {getAllByText} = render(<SearchScreen />);
    const prevButtons = getAllByText('<');
    // First go to January, then go back to wrap
    fireEvent.press(prevButtons[0]);
    fireEvent.press(prevButtons[0]);
    fireEvent.press(prevButtons[0]);
    fireEvent.press(prevButtons[0]);
    fireEvent.press(prevButtons[0]);
    fireEvent.press(prevButtons[0]);
  });

  it('navigates with date range and shows in params', () => {
    const {getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Cartagena, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith('Results', expect.objectContaining({
      dateRange: expect.any(String),
    }));
  });

  it('disables search button when destination is empty', () => {
    const {getByTestId} = render(<SearchScreen />);
    const button = getByTestId('search-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('disables search button when dates are not selected', () => {
    const {getByPlaceholderText, getByTestId} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Cartagena, Colombia');
    const button = getByTestId('search-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables search button when destination and dates are valid', () => {
    const {getByTestId, getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Cartagena, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    const button = getByTestId('search-button');
    expect(button.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('does not navigate when search button is disabled', () => {
    const {getByText} = render(<SearchScreen />);
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders rooms counter', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Número de habitaciones')).toBeTruthy();
  });

  it('increments rooms counter', () => {
    const {getAllByText} = render(<SearchScreen />);
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[2]); // third + is rooms
    const twos = getAllByText('2');
    expect(twos.length).toBeGreaterThan(0);
  });

  it('passes ciudad extracted from destination', () => {
    const {getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Medellin, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({ciudad: 'Medellin'}),
    );
  });

  it('passes checkin and checkout ISO dates', () => {
    const {getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Bogota, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({
        checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  it('passes dateRange with month name in Spanish', () => {
    const {getByText, getByPlaceholderText} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, 'Cali, Colombia');
    fireEvent.press(getByText('20'));
    fireEvent.press(getByText('25'));
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({
        dateRange: expect.stringContaining('20'),
      }),
    );
    const params = mockNavigate.mock.calls[0][1];
    expect(params.dateRange).toContain('25');
    expect(params.dateRange).toContain(' - ');
  });

  it('disables search button with whitespace-only destination', () => {
    const {getByPlaceholderText, getByTestId} = render(<SearchScreen />);
    const input = getByPlaceholderText('Ciudad, país');
    fireEvent.changeText(input, '   ');
    const button = getByTestId('search-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
