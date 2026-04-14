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

  it('registers exactly 2 screens', () => {
    render(<SearchStackNavigator />);
    expect(registeredScreens).toHaveLength(2);
  });

  it('exports SearchStackParamList type with expected routes', () => {
    const searchRoute: keyof SearchStackParamList = 'Search';
    const resultsRoute: keyof SearchStackParamList = 'Results';
    expect(searchRoute).toBe('Search');
    expect(resultsRoute).toBe('Results');
  });
});
