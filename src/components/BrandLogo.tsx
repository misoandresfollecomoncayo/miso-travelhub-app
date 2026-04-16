import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme/colors';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({size = 'large'}) => {
  const iconSize = size === 'small' ? 24 : size === 'medium' ? 36 : 48;
  const circleSize = iconSize * 1.6;
  const textSize = size === 'small' ? 18 : size === 'medium' ? 28 : 36;

  return (
    <View style={styles.container} testID="brand-logo">
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}>
        <Icon name="airplane" size={iconSize} color={Colors.primary} />
      </View>
      <View style={styles.textRow}>
        <Text style={[styles.textTravel, {fontSize: textSize}]}>Travel</Text>
        <Text style={[styles.textHub, {fontSize: textSize}]}>Hub</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '-15deg'}],
    marginBottom: 4,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTravel: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  textHub: {
    color: Colors.accent,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
