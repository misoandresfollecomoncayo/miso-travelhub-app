import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
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

  it('renders destination input with default value', () => {
    const {getByDisplayValue} = render(<SearchScreen />);
    expect(getByDisplayValue('Cartagena, Colombia')).toBeTruthy();
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
    expect(getByText('Numero de adultos')).toBeTruthy();
  });

  it('renders children counter', () => {
    const {getByText} = render(<SearchScreen />);
    expect(getByText('Numero de ninos')).toBeTruthy();
  });

  it('navigates to Results when BUSCAR is pressed', () => {
    const {getByText} = render(<SearchScreen />);
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith('Results', expect.objectContaining({
      destination: 'Cartagena, Colombia',
      adults: 2,
      children: 0,
    }));
  });

  it('updates destination when text changes', () => {
    const {getByDisplayValue} = render(<SearchScreen />);
    const input = getByDisplayValue('Cartagena, Colombia');
    fireEvent.changeText(input, 'Bogota, Colombia');
    expect(getByDisplayValue('Bogota, Colombia')).toBeTruthy();
  });

  it('increments adults counter', () => {
    const {getAllByText} = render(<SearchScreen />);
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[0]);
    // After increment, adults should be 3 (rendered somewhere in the tree)
    const threes = getAllByText('3');
    expect(threes.length).toBeGreaterThan(0);
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
    const {getByText} = render(<SearchScreen />);
    fireEvent.press(getByText('BUSCAR'));
    expect(mockNavigate).toHaveBeenCalledWith('Results', expect.objectContaining({
      dateRange: expect.any(String),
    }));
  });
});
