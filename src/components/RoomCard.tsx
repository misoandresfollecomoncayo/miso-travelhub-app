import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Room} from '../data/room';
import {formatPrice} from '../utils/format';
import {resolveImage} from '../utils/images';
import {StarRating} from './StarRating';

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({room, onPress}) => {
  const content = (
    <>
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
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${room.nombreHotel}`}
        activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
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
});
