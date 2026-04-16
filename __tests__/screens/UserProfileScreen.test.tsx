import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {UserProfileScreen} from '../../src/screens/UserProfileScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockLogout = jest.fn(() => Promise.resolve());
let mockAuthUser: {id: string; name: string; email: string; phone?: string} | null = {
  id: '1',
  name: 'Juan Perez',
  email: 'juan@example.com',
  phone: '3001234567',
};

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    initializing: false,
    loading: false,
    login: jest.fn(),
    logout: mockLogout,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: jest.fn(), navigate: jest.fn()}),
}));

describe('UserProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = {
      id: '1',
      name: 'Juan Perez',
      email: 'juan@example.com',
      phone: '3001234567',
    };
  });

  it('renders "Mi perfil" title', () => {
    const {getByText} = render(<UserProfileScreen />);
    expect(getByText('Mi perfil')).toBeTruthy();
  });

  it('renders user name', () => {
    const {getByTestId} = render(<UserProfileScreen />);
    expect(getByTestId('profile-name').props.children).toBe('Juan Perez');
  });

  it('renders user email when present', () => {
    const {getByTestId} = render(<UserProfileScreen />);
    expect(getByTestId('profile-email').props.children).toBe(
      'juan@example.com',
    );
  });

  it('renders user phone when present', () => {
    const {getByTestId} = render(<UserProfileScreen />);
    expect(getByTestId('profile-phone').props.children).toBe('3001234567');
  });

  it('renders initials in avatar', () => {
    const {getByText} = render(<UserProfileScreen />);
    // "Juan Perez" -> "JP"
    expect(getByText('JP')).toBeTruthy();
  });

  it('renders all profile menu options', () => {
    const {getByText} = render(<UserProfileScreen />);
    expect(getByText('Mi información')).toBeTruthy();
    expect(getByText('Notificaciones')).toBeTruthy();
    expect(getByText('Seguridad')).toBeTruthy();
    expect(getByText('Configuración')).toBeTruthy();
    expect(getByText('Acerca de TravelHub')).toBeTruthy();
  });

  it('renders all profile menu testIDs', () => {
    const {getByTestId} = render(<UserProfileScreen />);
    expect(getByTestId('profile-my-info')).toBeTruthy();
    expect(getByTestId('profile-notifications')).toBeTruthy();
    expect(getByTestId('profile-security')).toBeTruthy();
    expect(getByTestId('profile-settings')).toBeTruthy();
    expect(getByTestId('profile-about')).toBeTruthy();
  });

  it('shows Alert when logout is pressed and calls logout on confirm', () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirm = buttons?.find(b => b.text === 'Cerrar sesión');
        confirm?.onPress?.();
      });
    const {getByTestId} = render(<UserProfileScreen />);
    fireEvent.press(getByTestId('profile-logout-button'));
    expect(alertSpy).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('does not call logout when Cancelar is pressed', () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const cancel = buttons?.find(b => b.text === 'Cancelar');
        cancel?.onPress?.();
      });
    const {getByTestId} = render(<UserProfileScreen />);
    fireEvent.press(getByTestId('profile-logout-button'));
    expect(mockLogout).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('menu items show alerts when pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<UserProfileScreen />);
    fireEvent.press(getByTestId('profile-my-info'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Mi información',
      'Funcionalidad próximamente',
    );
    alertSpy.mockRestore();
  });

  it('Acerca de TravelHub shows alert when pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const {getByTestId} = render(<UserProfileScreen />);
    fireEvent.press(getByTestId('profile-about'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Acerca de TravelHub',
      'Funcionalidad próximamente',
    );
    alertSpy.mockRestore();
  });

  it('renders nothing when user is null', () => {
    mockAuthUser = null;
    const {queryByText} = render(<UserProfileScreen />);
    expect(queryByText('Mi perfil')).toBeNull();
  });
});
