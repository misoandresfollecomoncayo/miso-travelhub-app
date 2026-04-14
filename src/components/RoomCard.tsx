import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Room} from '../data/room';

interface RoomCardProps {
  room: Room;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400';

const formatPrice = (price: number): string => price.toLocaleString('es-CO');

const resolveImage = (images: string[]): string => {
  const first = images[0];
  if (first && /^https?:\/\//i.test(first)) {
    return first;
  }
  return PLACEHOLDER_IMAGE;
};

const StarRating: React.FC<{rating: number}> = ({rating}) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text
        key={i}
        style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>
        {'\u2605'}
      </Text>,
    );
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

export const RoomCard: React.FC<RoomCardProps> = ({room}) => {
  return (
    <View style={styles.card}>
      <Image source={{uri: resolveImage(room.imagenes)}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {room.nombreHotel}
        </Text>
        <Text style={styles.price}>
          <Text style={styles.priceLabel}>Desde: </Text>
          COP ${formatPrice(room.precio)} /noche
        </Text>
        <View style={styles.ratingRow}>
          <StarRating rating={room.estrellas} />
          <Text style={styles.reviews}> ({room.cantidadResenas} reseñas)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  image: {
    width: 120,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.grayLight,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  priceLabel: {
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 18,
    marginRight: 2,
  },
  starFilled: {
    color: Colors.star,
  },
  starEmpty: {
    color: Colors.starEmpty,
  },
});
