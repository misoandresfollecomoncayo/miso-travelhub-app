import React from 'react';
import {render} from '@testing-library/react-native';
import {SearchStackNavigator, SearchStackParamList} from '../../src/navigation/SearchStackNavigator';

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

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('SearchStackNavigator', () => {
  beforeEach(() => {
    registeredScreens.length = 0;
  });

  it('is a valid React component', () => {
    expect(typeof SearchStackNavigator).toBe('function');
  });

  it('renders without crashing', () => {
    const {toJSON} = render(<SearchStackNavigator />);
    expect(toJSON).toBeDefined();
  });

  it('registers Search screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Search');
  });

  it('registers Results screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Results');
  });

  it('registers Detail screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Detail');
  });

  it('registers Reservation screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Reservation');
  });

  it('registers ReservationSuccess screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('ReservationSuccess');
  });

  it('registers ReservationPolicies screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('ReservationPolicies');
  });

  it('registers Payment screen', () => {
    render(<SearchStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Payment');
  });

  it('registers exactly 7 screens', () => {
    render(<SearchStackNavigator />);
    expect(registeredScreens).toHaveLength(7);
  });

  it('exports SearchStackParamList type with expected routes', () => {
    const searchRoute: keyof SearchStackParamList = 'Search';
    const resultsRoute: keyof SearchStackParamList = 'Results';
    const detailRoute: keyof SearchStackParamList = 'Detail';
    const reservationRoute: keyof SearchStackParamList = 'Reservation';
    const successRoute: keyof SearchStackParamList = 'ReservationSuccess';
    const policiesRoute: keyof SearchStackParamList = 'ReservationPolicies';
    const paymentRoute: keyof SearchStackParamList = 'Payment';
    expect(searchRoute).toBe('Search');
    expect(resultsRoute).toBe('Results');
    expect(detailRoute).toBe('Detail');
    expect(reservationRoute).toBe('Reservation');
    expect(successRoute).toBe('ReservationSuccess');
    expect(policiesRoute).toBe('ReservationPolicies');
    expect(paymentRoute).toBe('Payment');
  });
});
