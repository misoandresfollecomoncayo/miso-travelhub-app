import React from 'react';
import {render} from '@testing-library/react-native';
import {UserScreen} from '../../src/screens/UserScreen';

describe('UserScreen', () => {
  it('renders title', () => {
    const {getByText} = render(<UserScreen />);
    expect(getByText('Usuario')).toBeTruthy();
  });

  it('renders login message', () => {
    const {getByText} = render(<UserScreen />);
    expect(getByText('Inicia sesion para continuar')).toBeTruthy();
  });
});
