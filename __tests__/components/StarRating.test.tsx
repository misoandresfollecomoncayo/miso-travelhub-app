import React from 'react';
import {render} from '@testing-library/react-native';
import {StarRating} from '../../src/components/StarRating';

describe('StarRating', () => {
  it('always renders 5 stars', () => {
    const {getAllByText} = render(<StarRating rating={3} />);
    expect(getAllByText('\u2605')).toHaveLength(5);
  });

  it('renders 5 stars for rating 5', () => {
    const {getAllByText} = render(<StarRating rating={5} />);
    expect(getAllByText('\u2605')).toHaveLength(5);
  });

  it('renders 5 stars for rating 0', () => {
    const {getAllByText} = render(<StarRating rating={0} />);
    expect(getAllByText('\u2605')).toHaveLength(5);
  });

  it('provides accessibility label with rating', () => {
    const {getByLabelText} = render(<StarRating rating={4} />);
    expect(getByLabelText('4 de 5 estrellas')).toBeTruthy();
  });

  it('respects custom size prop', () => {
    const {getAllByText} = render(<StarRating rating={3} size={24} />);
    const stars = getAllByText('\u2605');
    const flatStyle = Array.isArray(stars[0].props.style)
      ? Object.assign({}, ...stars[0].props.style.flat())
      : stars[0].props.style;
    expect(flatStyle.fontSize).toBe(24);
  });
});
