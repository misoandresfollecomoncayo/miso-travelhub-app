import React from 'react';
import {render} from '@testing-library/react-native';
import {ReservationsScreen} from '../../src/screens/ReservationsScreen';

describe('ReservationsScreen', () => {
  it('renders title', () => {
    const {getByText} = render(<ReservationsScreen />);
    expect(getByText('Reservas')).toBeTruthy();
  });

  it('renders empty state message', () => {
    const {getByText} = render(<ReservationsScreen />);
    expect(getByText('No tienes reservas activas')).toBeTruthy();
  });
});
