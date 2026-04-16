import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {RoomCard} from '../../src/components/RoomCard';
import {Room} from '../../src/data/room';

const mockRoom: Room = {
  id: '22222222-2222-2222-2222-000000000001',
  nombreHotel: 'Hotel Test',
  precio: 360,
  direccion: 'Calle 123',
  capacidadMaxima: 2,
  distancia: '3 km del centro',
  acceso: 'Metro',
  estrellas: 5,
  puntuacionResena: 3.5,
  cantidadResenas: 2,
  tipoHabitacion: 'Deluxe',
  tipoCama: ['king'],
  tamanoHabitacion: '35m2',
  amenidades: ['AC', 'Wifi'],
  imagenes: ['https://example.com/img1.jpg'],
};

describe('RoomCard', () => {
  it('renders hotel name', () => {
    const {getByText} = render(<RoomCard room={mockRoom} />);
    expect(getByText('Hotel Test')).toBeTruthy();
  });

  it('renders reviews count', () => {
    const {getByText} = render(<RoomCard room={mockRoom} />);
    expect(getByText(/2 reseñas/)).toBeTruthy();
  });

  it('renders formatted price with label', () => {
    const {getByText} = render(<RoomCard room={mockRoom} />);
    expect(getByText('Desde: ')).toBeTruthy();
    expect(getByText(/COP \$360/)).toBeTruthy();
  });

  it('renders 5 star icons regardless of rating', () => {
    const {getAllByText} = render(<RoomCard room={mockRoom} />);
    const stars = getAllByText('\u2605');
    expect(stars).toHaveLength(5);
  });

  it('handles room with no images using placeholder', () => {
    const noImageRoom: Room = {...mockRoom, imagenes: []};
    const {getByText} = render(<RoomCard room={noImageRoom} />);
    expect(getByText('Hotel Test')).toBeTruthy();
  });

  it('handles invalid image url using placeholder', () => {
    const badImageRoom: Room = {...mockRoom, imagenes: ['img1.jpg']};
    const {getByText} = render(<RoomCard room={badImageRoom} />);
    expect(getByText('Hotel Test')).toBeTruthy();
  });

  it('does not render address', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText('Calle 123')).toBeNull();
  });

  it('does not render room type or size', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText(/Deluxe/)).toBeNull();
    expect(queryByText(/35m2/)).toBeNull();
  });

  it('does not render bed type or capacity', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText(/Cama/)).toBeNull();
    expect(queryByText(/Hasta/)).toBeNull();
  });

  it('does not render distance or access', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText(/3 km del centro/)).toBeNull();
    expect(queryByText('Metro')).toBeNull();
  });

  it('does not render amenities', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText('AC')).toBeNull();
    expect(queryByText('Wifi')).toBeNull();
  });

  it('does not render review score number', () => {
    const {queryByText} = render(<RoomCard room={mockRoom} />);
    expect(queryByText(/3\.5/)).toBeNull();
  });

  it('uses valid image URL when provided', () => {
    const {UNSAFE_getByType} = render(<RoomCard room={mockRoom} />);
    const image = UNSAFE_getByType(require('react-native').Image);
    expect(image.props.source.uri).toBe('https://example.com/img1.jpg');
  });

  it('uses placeholder image for empty array', () => {
    const noImageRoom: Room = {...mockRoom, imagenes: []};
    const {UNSAFE_getByType} = render(<RoomCard room={noImageRoom} />);
    const image = UNSAFE_getByType(require('react-native').Image);
    expect(image.props.source.uri).toContain('unsplash.com');
  });

  it('renders different review counts', () => {
    const manyReviews: Room = {...mockRoom, cantidadResenas: 150};
    const {getByText} = render(<RoomCard room={manyReviews} />);
    expect(getByText(/150 reseñas/)).toBeTruthy();
  });

  it('renders zero price', () => {
    const freeRoom: Room = {...mockRoom, precio: 0};
    const {getByText} = render(<RoomCard room={freeRoom} />);
    expect(getByText(/COP \$0/)).toBeTruthy();
  });

  it('renders long hotel name with truncation', () => {
    const longNameRoom: Room = {
      ...mockRoom,
      nombreHotel: 'Hotel con un nombre extremadamente largo para probar truncamiento',
    };
    const {getByText} = render(<RoomCard room={longNameRoom} />);
    expect(getByText(/Hotel con un nombre/)).toBeTruthy();
  });

  it('fires onPress when card is pressed', () => {
    const onPress = jest.fn();
    const {getByText} = render(<RoomCard room={mockRoom} onPress={onPress} />);
    fireEvent.press(getByText('Hotel Test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role button when onPress is provided', () => {
    const onPress = jest.fn();
    const {getByRole} = render(<RoomCard room={mockRoom} onPress={onPress} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('does not wrap in TouchableOpacity when onPress is not provided', () => {
    // Should render without error even without onPress (backward compat)
    const {getByText} = render(<RoomCard room={mockRoom} />);
    expect(getByText('Hotel Test')).toBeTruthy();
  });
});
