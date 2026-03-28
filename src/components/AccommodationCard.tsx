import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Accommodation} from '../data/mockData';

interface AccommodationCardProps {
  accommodation: Accommodation;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('es-CO');
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

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
}) => {
  return (
    <View style={styles.card}>
      <Image source={{uri: accommodation.image}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {accommodation.name}
        </Text>
        <Text style={styles.price}>
          <Text style={styles.priceLabel}>Desde: </Text>
          COP ${formatPrice(accommodation.pricePerNight)} /noche
        </Text>
        <StarRating rating={accommodation.rating} />
        <Text style={styles.reviews}>{accommodation.reviews} resenas</Text>
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
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 2,
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
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
