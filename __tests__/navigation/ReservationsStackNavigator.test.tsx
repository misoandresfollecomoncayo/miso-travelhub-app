import React from 'react';
import {render} from '@testing-library/react-native';
import {
  ReservationsStackNavigator,
  ReservationsStackParamList,
} from '../../src/navigation/ReservationsStackNavigator';

const registeredScreens: Array<{name: string}> = [];

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({name}: {name: string}) => {
      registeredScreens.push({name});
      return null;
    },
  }),
}));

describe('ReservationsStackNavigator', () => {
  beforeEach(() => {
    registeredScreens.length = 0;
  });

  it('is a valid React component', () => {
    expect(typeof ReservationsStackNavigator).toBe('function');
  });

  it('renders without crashing', () => {
    const {toJSON} = render(<ReservationsStackNavigator />);
    expect(toJSON).toBeDefined();
  });

  it('registers ReservationsList screen', () => {
    render(<ReservationsStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('ReservationsList');
  });

  it('registers BookingDetail screen', () => {
    render(<ReservationsStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('BookingDetail');
  });

  it('registers Detail screen for hotel preview', () => {
    render(<ReservationsStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Detail');
  });

  it('registers exactly 3 screens', () => {
    render(<ReservationsStackNavigator />);
    expect(registeredScreens).toHaveLength(3);
  });

  it('exports ReservationsStackParamList type with expected routes', () => {
    const list: keyof ReservationsStackParamList = 'ReservationsList';
    const detail: keyof ReservationsStackParamList = 'BookingDetail';
    const hotel: keyof ReservationsStackParamList = 'Detail';
    expect(list).toBe('ReservationsList');
    expect(detail).toBe('BookingDetail');
    expect(hotel).toBe('Detail');
  });
});
