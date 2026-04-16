import React from 'react';
import {render} from '@testing-library/react-native';
import {CardBrandBadges} from '../../src/components/CardBrandBadges';

describe('CardBrandBadges', () => {
  it('renders the container', () => {
    const {getByTestId} = render(<CardBrandBadges />);
    expect(getByTestId('card-brand-badges')).toBeTruthy();
  });

  it('renders VISA badge', () => {
    const {getByTestId, getByText} = render(<CardBrandBadges />);
    expect(getByTestId('card-brand-visa')).toBeTruthy();
    expect(getByText('VISA')).toBeTruthy();
  });

  it('renders Mastercard badge (logo)', () => {
    const {getByTestId} = render(<CardBrandBadges />);
    expect(getByTestId('card-brand-mastercard')).toBeTruthy();
  });

  it('renders AMEX badge', () => {
    const {getByTestId, getByText} = render(<CardBrandBadges />);
    expect(getByTestId('card-brand-amex')).toBeTruthy();
    expect(getByText('AMEX')).toBeTruthy();
  });

  it('renders DINERS badge', () => {
    const {getByTestId, getByText} = render(<CardBrandBadges />);
    expect(getByTestId('card-brand-diners')).toBeTruthy();
    expect(getByText('DINERS')).toBeTruthy();
  });
});
