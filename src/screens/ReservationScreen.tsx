import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';
import {Calendar} from '../components/Calendar';
import {CounterInput} from '../components/CounterInput';
import {formatPrice} from '../utils/format';
import {resolveImage} from '../utils/images';

type ReservationRouteProp = RouteProp<SearchStackParamList, 'Reservation'>;
type ReservationNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Reservation'
>;

const TAX_RATE = 0.19;
const CANCELLATION_POLICY =
  'Cancelación gratuita hasta 48 horas antes del check-in.';
const TAX_POLICY = 'Los precios incluyen IVA.';

const MONTH_NAMES_LOWER = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

interface ParsedIso {
  year: number;
  month: number; // 0-indexed
  day: number;
}

const parseIsoDate = (iso: string): ParsedIso => {
  const [y, m, d] = iso.split('-').map(n => Number(n));
  return {year: y, month: (m || 1) - 1, day: d || 1};
};

const toIsoDate = (year: number, month: number, day: number): string => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const computeNights = (checkin: string, checkout: string): number => {
  const start = Date.parse(checkin);
  const end = Date.parse(checkout);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 1;
  }
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const formatDateRange = (checkin: string, checkout: string): string => {
  const s = parseIsoDate(checkin);
  const e = parseIsoDate(checkout);
  return `${s.day} ${MONTH_NAMES_LOWER[s.month]} ${s.year} - ${e.day} ${
    MONTH_NAMES_LOWER[e.month]
  } ${e.year}`;
};

export const ReservationScreen: React.FC = () => {
  const route = useRoute<ReservationRouteProp>();
  const navigation = useNavigation<ReservationNavigationProp>();
  const {room, destination, checkin: initialCheckin, checkout: initialCheckout} =
    route.params;

  const maxCapacity = Math.max(1, room.capacidadMaxima || 1);

  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [checkinIso, setCheckinIso] = useState<string>(initialCheckin);
  const [checkoutIso, setCheckoutIso] = useState<string>(initialCheckout);
  const [adultsCount, setAdultsCount] = useState<number>(
    Math.min(Math.max(1, route.params.adults || 1), maxCapacity),
  );

  // Modal de fechas: estado temporal
  const initialParsed = parseIsoDate(checkinIso);
  const initialEnd = parseIsoDate(checkoutIso);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState<number>(initialParsed.month);
  const [tempYear, setTempYear] = useState<number>(initialParsed.year);
  const [tempStart, setTempStart] = useState<number | null>(initialParsed.day);
  const [tempEnd, setTempEnd] = useState<number | null>(
    initialParsed.year === initialEnd.year &&
      initialParsed.month === initialEnd.month
      ? initialEnd.day
      : null,
  );

  const nights = computeNights(checkinIso, checkoutIso);
  const dateRange = formatDateRange(checkinIso, checkoutIso);
  const subtotal = room.precio * nights;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes;
  const nightsLabel = nights === 1 ? 'noche' : 'noches';
  const heroImage = resolveImage(room.imagenes);

  const openDateModal = () => {
    const ci = parseIsoDate(checkinIso);
    const co = parseIsoDate(checkoutIso);
    setTempMonth(ci.month);
    setTempYear(ci.year);
    setTempStart(ci.day);
    setTempEnd(
      ci.year === co.year && ci.month === co.month ? co.day : null,
    );
    setDateModalOpen(true);
  };

  const handleSelectTempDate = (day: number) => {
    if (tempStart === null || (tempStart !== null && tempEnd !== null)) {
      setTempStart(day);
      setTempEnd(null);
    } else if (day > tempStart) {
      setTempEnd(day);
    } else {
      setTempStart(day);
      setTempEnd(null);
    }
  };

  const handleTempPrevMonth = () => {
    if (tempMonth === 0) {
      setTempMonth(11);
      setTempYear(tempYear - 1);
    } else {
      setTempMonth(tempMonth - 1);
    }
    setTempStart(null);
    setTempEnd(null);
  };

  const handleTempNextMonth = () => {
    if (tempMonth === 11) {
      setTempMonth(0);
      setTempYear(tempYear + 1);
    } else {
      setTempMonth(tempMonth + 1);
    }
    setTempStart(null);
    setTempEnd(null);
  };

  const canConfirmDates =
    tempStart !== null && tempEnd !== null && tempEnd > tempStart;

  const confirmDates = () => {
    if (!canConfirmDates || tempStart === null || tempEnd === null) {
      return;
    }
    setCheckinIso(toIsoDate(tempYear, tempMonth, tempStart));
    setCheckoutIso(toIsoDate(tempYear, tempMonth, tempEnd));
    setDateModalOpen(false);
  };

  const cancelDates = () => {
    setDateModalOpen(false);
  };

  const incrementAdults = () => {
    setAdultsCount(prev => Math.min(maxCapacity, prev + 1));
  };

  const decrementAdults = () => {
    setAdultsCount(prev => Math.max(1, prev - 1));
  };

  const handlePagar = () => {
    if (!policiesAccepted) {
      return;
    }
    Alert.alert(
      'Confirmar reserva',
      `¿Deseas confirmar el pago de COP $${formatPrice(total)}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Confirmar',
          onPress: () => {
            navigation.navigate('Payment', {
              nombreHotel: room.nombreHotel,
              destination,
              dateRange,
              nights,
              adults: adultsCount,
              total,
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="reservation-back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reservar</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Image source={{uri: heroImage}} style={styles.heroImage} />

        <View style={styles.summaryField}>
          <Text style={styles.fieldLabel}>Destino:</Text>
          <Text style={styles.fieldValue}>{destination}</Text>
        </View>

        <View style={styles.summaryField}>
          <Text style={styles.fieldLabel}>Hospedaje:</Text>
          <Text style={styles.fieldValue}>{room.nombreHotel}</Text>
        </View>

        <TouchableOpacity
          testID="reservation-edit-dates"
          style={styles.summaryField}
          onPress={openDateModal}
          accessibilityRole="button"
          accessibilityLabel="Editar fechas de la reserva"
          activeOpacity={0.7}>
          <Text style={styles.fieldLabel}>Fecha:</Text>
          <View style={styles.fieldValueRow}>
            <Text style={styles.fieldValue}>{dateRange}</Text>
            <Icon
              name="create-outline"
              size={18}
              color={Colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.summaryField}>
          <CounterInput
            label="Número de adultos"
            value={adultsCount}
            min={1}
            max={maxCapacity}
            onIncrement={incrementAdults}
            onDecrement={decrementAdults}
          />
          <Text style={styles.capacityHint}>
            Capacidad máxima: {maxCapacity}{' '}
            {maxCapacity === 1 ? 'persona' : 'personas'}
          </Text>
        </View>

        <View style={styles.breakdownCard} testID="reservation-breakdown">
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>
              COP ${formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>IVA (19%)</Text>
            <Text style={styles.breakdownValue}>
              COP ${formatPrice(taxes)}
            </Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownTotalLabel}>Total</Text>
            <Text style={styles.breakdownTotalValue}>
              COP ${formatPrice(total)}
            </Text>
          </View>
        </View>

        <View style={styles.policiesCard} testID="reservation-policies">
          <View style={styles.policyRow}>
            <Icon
              name="information-circle-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.policyText}>{CANCELLATION_POLICY}</Text>
          </View>
          <View style={styles.policyRow}>
            <Icon
              name="receipt-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.policyText}>{TAX_POLICY}</Text>
          </View>
        </View>

        <View style={styles.consentRow}>
          <TouchableOpacity
            testID="reservation-consent-checkbox"
            style={styles.checkbox}
            onPress={() => setPoliciesAccepted(prev => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{checked: policiesAccepted}}
            accessibilityLabel="Al continuar, aceptas nuestras políticas de reservación"
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <View
              style={[
                styles.checkboxBox,
                policiesAccepted && styles.checkboxBoxChecked,
              ]}>
              {policiesAccepted && (
                <Icon name="checkmark" size={16} color={Colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.consentText}>
            Al continuar, aceptas nuestras{' '}
            <Text
              testID="reservation-policies-link"
              style={styles.consentLink}
              onPress={() => navigation.navigate('ReservationPolicies')}
              accessibilityRole="link">
              políticas de reservación
            </Text>
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>COP ${formatPrice(total)}</Text>
          <Text style={styles.nightsLabel}>
            Por{' '}
            <Text style={styles.nightsLink}>
              {nights} {nightsLabel}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          testID="reservation-pay-button"
          style={[
            styles.payButton,
            !policiesAccepted && styles.payButtonDisabled,
          ]}
          onPress={handlePagar}
          disabled={!policiesAccepted}
          accessibilityRole="button"
          accessibilityLabel="Pagar reserva"
          accessibilityState={{disabled: !policiesAccepted}}
          activeOpacity={0.85}>
          <Text style={styles.payButtonText}>PAGAR RESERVA</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={cancelDates}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent} testID="reservation-date-modal">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar fechas</Text>
              <TouchableOpacity
                testID="reservation-date-modal-close"
                onPress={cancelDates}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                accessibilityRole="button"
                accessibilityLabel="Cerrar">
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Calendar
              year={tempYear}
              month={tempMonth}
              startDate={tempStart}
              endDate={tempEnd}
              onSelectDate={handleSelectTempDate}
              onPrevMonth={handleTempPrevMonth}
              onNextMonth={handleTempNextMonth}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                testID="reservation-date-cancel"
                style={styles.modalSecondaryButton}
                onPress={cancelDates}
                accessibilityRole="button"
                accessibilityLabel="Cancelar">
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="reservation-date-confirm"
                style={[
                  styles.modalPrimaryButton,
                  !canConfirmDates && styles.modalPrimaryButtonDisabled,
                ]}
                onPress={confirmDates}
                disabled={!canConfirmDates}
                accessibilityRole="button"
                accessibilityLabel="Confirmar fechas">
                <Text style={styles.modalPrimaryText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerSafeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.grayLight,
  },
  summaryField: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  breakdownCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginVertical: 8,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  policiesCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  policyText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    padding: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.grayBorder,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  consentText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  consentLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nightsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nightsLink: {
    textDecorationLine: 'underline',
    color: Colors.textPrimary,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalSecondaryButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.5,
  },
  modalPrimaryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
