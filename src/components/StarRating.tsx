import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({rating, size = 18}) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text
        key={i}
        style={[
          styles.star,
          {fontSize: size},
          i <= rating ? styles.starFilled : styles.starEmpty,
        ]}>
        {'\u2605'}
      </Text>,
    );
  }
  return (
    <View style={styles.container} accessibilityLabel={`${rating} de 5 estrellas`}>
      {stars}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  starFilled: {
    color: Colors.star,
  },
  starEmpty: {
    color: Colors.starEmpty,
  },
});
