import React from 'react';
import {render} from '@testing-library/react-native';
import {AppNavigator} from '../../src/navigation/AppNavigator';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const registeredScreens: Array<{name: string}> = [];

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({name}: {name: string}) => {
      registeredScreens.push({name});
      return null;
    },
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: () => null,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    registeredScreens.length = 0;
  });

  it('is a valid React component', () => {
    expect(typeof AppNavigator).toBe('function');
  });

  it('renders without crashing', () => {
    const {toJSON} = render(<AppNavigator />);
    expect(toJSON).toBeDefined();
  });

  it('registers Buscar tab', () => {
    render(<AppNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Buscar');
  });

  it('registers Reservas tab', () => {
    render(<AppNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Reservas');
  });

  it('registers Usuario tab', () => {
    render(<AppNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Usuario');
  });

  it('registers exactly 3 tabs', () => {
    render(<AppNavigator />);
    expect(registeredScreens).toHaveLength(3);
  });
});
