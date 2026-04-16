import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const VisaBadge: React.FC = () => (
  <View style={[styles.badge, styles.visa]} testID="card-brand-visa">
    <Text style={styles.visaText} allowFontScaling={false}>
      VISA
    </Text>
  </View>
);

const MastercardBadge: React.FC = () => (
  <View style={[styles.badge, styles.mastercard]} testID="card-brand-mastercard">
    <View style={[styles.mcCircle, styles.mcCircleRed]} />
    <View style={[styles.mcCircle, styles.mcCircleYellow]} />
  </View>
);

const AmexBadge: React.FC = () => (
  <View style={[styles.badge, styles.amex]} testID="card-brand-amex">
    <Text style={styles.amexText} allowFontScaling={false}>
      AMEX
    </Text>
  </View>
);

const DinersBadge: React.FC = () => (
  <View style={[styles.badge, styles.diners]} testID="card-brand-diners">
    <Text style={styles.dinersText} allowFontScaling={false}>
      DINERS
    </Text>
  </View>
);

export const CardBrandBadges: React.FC = () => {
  return (
    <View style={styles.container} testID="card-brand-badges">
      <VisaBadge />
      <MastercardBadge />
      <AmexBadge />
      <DinersBadge />
    </View>
  );
};

const BADGE_HEIGHT = 26;
const BADGE_WIDTH = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  badge: {
    height: BADGE_HEIGHT,
    width: BADGE_WIDTH,
    borderRadius: 4,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visa: {
    backgroundColor: '#1A1F71',
  },
  visaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  mastercard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mcCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  mcCircleRed: {
    backgroundColor: '#EB001B',
    marginRight: -5,
  },
  mcCircleYellow: {
    backgroundColor: '#F79E1B',
    opacity: 0.9,
  },
  amex: {
    backgroundColor: '#2E77BB',
  },
  amexText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  diners: {
    backgroundColor: '#0079BE',
  },
  dinersText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
