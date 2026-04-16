import React from 'react';
import {render} from '@testing-library/react-native';
import {
  UserStackNavigator,
  UserStackParamList,
} from '../../src/navigation/UserStackNavigator';

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

let mockAuthState = {
  user: null as {id: string; name: string; email: string} | null,
  initializing: false,
};

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthState.user,
    initializing: mockAuthState.initializing,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('UserStackNavigator', () => {
  beforeEach(() => {
    registeredScreens.length = 0;
    mockAuthState = {user: null, initializing: false};
  });

  it('renders splash when initializing', () => {
    mockAuthState = {user: null, initializing: true};
    const {getByTestId} = render(<UserStackNavigator />);
    expect(getByTestId('user-stack-splash')).toBeTruthy();
  });

  it('registers Login, Register, ForgotPassword, TermsAndConditions when user is null', () => {
    render(<UserStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('Login');
    expect(names).toContain('Register');
    expect(names).toContain('ForgotPassword');
    expect(names).toContain('TermsAndConditions');
    expect(names).not.toContain('UserProfile');
  });

  it('registers only UserProfile when user is logged in', () => {
    mockAuthState = {
      user: {id: '1', name: 'Test', email: 't@x.com'},
      initializing: false,
    };
    render(<UserStackNavigator />);
    const names = registeredScreens.map(s => s.name);
    expect(names).toContain('UserProfile');
    expect(names).not.toContain('Login');
  });

  it('exports UserStackParamList type with expected routes', () => {
    const loginRoute: keyof UserStackParamList = 'Login';
    const registerRoute: keyof UserStackParamList = 'Register';
    const forgotRoute: keyof UserStackParamList = 'ForgotPassword';
    const profileRoute: keyof UserStackParamList = 'UserProfile';
    const termsRoute: keyof UserStackParamList = 'TermsAndConditions';
    expect(loginRoute).toBe('Login');
    expect(registerRoute).toBe('Register');
    expect(forgotRoute).toBe('ForgotPassword');
    expect(profileRoute).toBe('UserProfile');
    expect(termsRoute).toBe('TermsAndConditions');
  });
});
