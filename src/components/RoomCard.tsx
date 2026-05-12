import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Room} from '../data/room';
import {formatAmount} from '../utils/currency';
import {resolveImage} from '../utils/images';
import {useT} from '../i18n/useT';
import {StarRating} from './StarRating';

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({room, onPress}) => {
  const t = useT();
  const hasDiscount =
    room.precioOriginal !== undefined && room.precioOriginal > room.precio;
  const content = (
    <>
      <Image source={{uri: resolveImage(room.imagenes)}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {room.nombreHotel}
        </Text>
        {hasDiscount ? (
          <View style={styles.priceBlock}>
            <Text style={styles.priceFromRow}>
              <Text style={styles.priceLabel}>{t('roomCard.fromLabel')}</Text>
              <Text
                style={styles.priceOriginal}
                testID="room-card-original-price">
                {formatAmount(room.precioOriginal as number, room.moneda)}
              </Text>
            </Text>
            <Text style={styles.priceCurrent}>
              {formatAmount(room.precio, room.moneda)}{' '}
              <Text style={styles.priceUnit}>{t('roomCard.perNight')}</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.price}>
            <Text style={styles.priceLabel}>{t('roomCard.fromLabel')}</Text>
            {formatAmount(room.precio, room.moneda)} {t('roomCard.perNight')}
          </Text>
        )}
        <View style={styles.ratingRow}>
          <StarRating rating={room.estrellas} />
          <Text style={styles.reviews}>
            {' '}
            {t('roomCard.reviewsCount', {n: room.cantidadResenas})}
          </Text>
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
        accessibilityLabel={t('roomCard.viewDetailAccessibility', {
          hotel: room.nombreHotel,
        })}
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
  // Layout cuando hay descuento: dos líneas — "Desde: <tachado>" arriba (más
  // pequeño y discreto) y el precio final con "/noche" abajo (más prominente).
  priceBlock: {
    marginBottom: 4,
  },
  priceFromRow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceOriginal: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  priceCurrent: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
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
