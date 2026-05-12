import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {Colors} from '../theme/colors';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';
import {formatAmount} from '../utils/currency';
import {useT} from '../i18n/useT';

type SuccessRouteProp = RouteProp<SearchStackParamList, 'ReservationSuccess'>;

// Naranja para indicar "pendiente de confirmación del hotel" — la reserva
// fue enviada pero todavía no está confirmada (estado PENDIENTE).
const PENDING_COLOR = '#F57C00';

export const ReservationSuccessScreen: React.FC = () => {
  const route = useRoute<SuccessRouteProp>();
  const t = useT();
  const {
    nombreHotel,
    destination,
    dateRange,
    nights,
    adults,
    total,
    moneda,
    confirmationCode,
  } = route.params;

  const nightsLabel = nights === 1 ? t('success.nightSingular') : t('success.nightPlural');
  const adultsLabel = adults === 1 ? t('success.adultSingular') : t('success.adultPlural');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrapper} testID="success-icon">
          <Icon name="checkmark-circle" size={96} color={PENDING_COLOR} />
        </View>

        <Text style={styles.title}>{t('success.title')}</Text>
        <Text style={styles.subtitle}>{t('success.subtitle')}</Text>

        <View style={styles.summaryCard}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>{t('success.confirmationCode')}</Text>
            <Text style={styles.codeValue} testID="success-code">
              {confirmationCode}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('success.destination')}</Text>
            <Text style={styles.summaryValue}>{destination}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('success.lodging')}</Text>
            <Text style={styles.summaryValue}>{nombreHotel}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('success.dates')}</Text>
            <Text style={styles.summaryValue}>{dateRange}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('success.nightsLabel')}</Text>
            <Text style={styles.summaryValue}>
              {nights} {nightsLabel}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('success.adultsLabel')}</Text>
            <Text style={styles.summaryValue} testID="success-adults">
              {adults} {adultsLabel}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('success.totalPaid')}</Text>
            <Text style={styles.totalValue}>{formatAmount(total, moneda)}</Text>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    marginTop: 32,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.white,
  },
  codeRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 0.4,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 0.6,
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
