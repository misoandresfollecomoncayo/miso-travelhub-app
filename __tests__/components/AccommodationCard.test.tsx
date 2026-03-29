import React from 'react';
import {render} from '@testing-library/react-native';
import {AccommodationCard} from '../../src/components/AccommodationCard';
import {Accommodation} from '../../src/data/mockData';

const mockAccommodation: Accommodation = {
  id: '1',
  name: 'Hotel Test',
  pricePerNight: 150000,
  rating: 4,
  reviews: 50,
  image: 'https://example.com/image.jpg',
};

describe('AccommodationCard', () => {
  it('renders accommodation name', () => {
    const {getByText} = render(
      <AccommodationCard accommodation={mockAccommodation} />,
    );
    expect(getByText('Hotel Test')).toBeTruthy();
  });

  it('renders price formatted', () => {
    const {getByText} = render(
      <AccommodationCard accommodation={mockAccommodation} />,
    );
    expect(getByText(/150/)).toBeTruthy();
  });

  it('renders reviews count', () => {
    const {getByText} = render(
      <AccommodationCard accommodation={mockAccommodation} />,
    );
    expect(getByText('50 resenas')).toBeTruthy();
  });

  it('renders 5 stars', () => {
    const {getAllByText} = render(
      <AccommodationCard accommodation={mockAccommodation} />,
    );
    const stars = getAllByText('\u2605');
    expect(stars).toHaveLength(5);
  });

  it('renders with rating 5', () => {
    const fiveStarHotel: Accommodation = {
      ...mockAccommodation,
      rating: 5,
    };
    const {getAllByText} = render(
      <AccommodationCard accommodation={fiveStarHotel} />,
    );
    const stars = getAllByText('\u2605');
    expect(stars).toHaveLength(5);
  });

  it('renders with rating 0', () => {
    const zeroStarHotel: Accommodation = {
      ...mockAccommodation,
      rating: 0,
    };
    const {getAllByText} = render(
      <AccommodationCard accommodation={zeroStarHotel} />,
    );
    const stars = getAllByText('\u2605');
    expect(stars).toHaveLength(5);
  });

  it('renders price label', () => {
    const {getByText} = render(
      <AccommodationCard accommodation={mockAccommodation} />,
    );
    expect(getByText('Desde: ')).toBeTruthy();
  });
});
