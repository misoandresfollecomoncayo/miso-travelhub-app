import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {ReservationsStackParamList} from '../navigation/ReservationsStackNavigator';
import {formatAmount} from '../utils/currency';
import {usePreferences} from '../preferences/PreferencesContext';
import {useT, useDates} from '../i18n/useT';
import {TranslationKey} from '../i18n/translations';
import {Room} from '../data/room';
import {BookingListItem} from '../services/bookingApi';

type BookingDetailRouteProp = RouteProp<
  ReservationsStackParamList,
  'BookingDetail'
>;
type BookingDetailNavigationProp = NativeStackNavigationProp<
  ReservationsStackParamList,
  'BookingDetail'
>;

interface StatusInfo {
  labelKey: TranslationKey | null;
  rawLabel: string;
  bg: string;
  fg: string;
}

const STATUS_INFO: Record<
  string,
  Omit<StatusInfo, 'rawLabel'> & {labelKey: TranslationKey}
> = {
  PENDIENTE: {labelKey: 'reservations.status.pending', bg: '#E65100', fg: '#FFF'},
  CONFIRMADA: {labelKey: 'reservations.status.confirmed', bg: '#1565C0', fg: '#FFF'},
  CONFIRMADO: {labelKey: 'reservations.status.confirmed', bg: '#1565C0', fg: '#FFF'},
  PAGADA: {labelKey: 'reservations.status.paid', bg: '#2E7D32', fg: '#FFF'},
  COMPLETADA: {labelKey: 'reservations.status.completed', bg: '#E3F2FD', fg: '#1565C0'},
  COMPLETADO: {labelKey: 'reservations.status.completed', bg: '#E3F2FD', fg: '#1565C0'},
  CANCELADA: {labelKey: 'reservations.status.cancelled', bg: '#FFEBEE', fg: '#C62828'},
  CANCELADO: {labelKey: 'reservations.status.cancelled', bg: '#FFEBEE', fg: '#C62828'},
};

const getStatusInfo = (status: string): StatusInfo => {
  const upper = (status || '').toUpperCase();
  const known = STATUS_INFO[upper];
  if (known) {
    return {labelKey: known.labelKey, rawLabel: '', bg: known.bg, fg: known.fg};
  }
  return {
    labelKey: null,
    rawLabel: status || '',
    bg: Colors.grayLight,
    fg: Colors.textSecondary,
  };
};

const isPendingStatus = (status: string): boolean =>
  (status || '').toUpperCase() === 'PENDIENTE';

const isConfirmedStatus = (status: string): boolean => {
  const upper = (status || '').toUpperCase();
  return upper === 'CONFIRMADA' || upper === 'CONFIRMADO';
};

// Exportado para que callers externos puedan ramificar lógica cuando una
// reserva ya esté pagada (post-pasarela).
export const isPaidStatus = (status: string): boolean => {
  const upper = (status || '').toUpperCase();
  return upper === 'PAGADA' || upper === 'PAGADO';
};

const PAYMENT_GATEWAY_BASE =
  'https://miso-pasarela-pagos-evbwp.ondigitalocean.app/payment';
const PAYMENT_RETURN_URL = 'AppTravelhub';

export const buildPaymentUrl = (params: {
  invoiceId: string;
  currency: string;
  /**
   * Monto en la MISMA moneda que `currency`. El caller es responsable de
   * convertir desde COP (almacenamiento interno) a la moneda objetivo antes
   * de invocar esta función.
   */
  amount: number;
  lang: string;
}): string => {
  // El gateway espera dos decimales para monedas con centavos (EUR/USD) y
  // un entero para COP. Redondeamos a 2 decimales y dejamos que el backend
  // interprete según el código de moneda.
  const amountStr =
    params.currency.toUpperCase() === 'COP'
      ? String(Math.round(params.amount))
      : params.amount.toFixed(2);
  const query = new URLSearchParams({
    invoiceId: params.invoiceId,
    currency: params.currency.toUpperCase(),
    amount: amountStr,
    lang: params.lang.toUpperCase(),
    returnUrl: PAYMENT_RETURN_URL,
  });
  return `${PAYMENT_GATEWAY_BASE}?${query.toString()}`;
};

const buildFormatLongDate = (monthFull: (m: number) => string) =>
  (iso: string): string => {
    if (!iso) {
      return '';
    }
    const dayPart = iso.slice(0, 10);
    const [y, m, d] = dayPart.split('-').map(n => Number(n));
    if (!y || !m || !d) {
      return iso;
    }
    return `${d} ${monthFull(m - 1)} ${y}`;
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

const toIsoDay = (iso: string): string => iso.slice(0, 10);

const bookingToRoom = (booking: BookingListItem): Room => ({
  id: booking.id,
  nombreHotel: booking.nombreHotel,
  // No tenemos precio por noche en el booking; usamos 0 para que el footer
  // no aplique en el modo viewOnly (el footer se oculta de cualquier forma).
  precio: 0,
  precioConImpuestos: 0,
  moneda: booking.moneda,
  direccion: booking.direccion,
  capacidadMaxima: booking.numHuespedes,
  distancia: booking.distancia,
  acceso: booking.acceso,
  estrellas: booking.estrellas,
  puntuacionResena: 0,
  cantidadResenas: 0,
  tipoHabitacion: booking.tipoHabitacion,
  tipoCama: booking.tipoCama,
  tamanoHabitacion: booking.tamanoHabitacion,
  amenidades: booking.amenidades,
  imagenes: booking.imagenes,
});

interface FieldProps {
  label: string;
  value: string;
  testID?: string;
  onPress?: () => void;
}

const Field: React.FC<FieldProps> = ({label, value, testID, onPress}) => {
  const inner = (
    <View style={styles.fieldInner}>
      <View style={styles.fieldTexts}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      {onPress && (
        <Icon
          name="chevron-forward"
          size={18}
          color={Colors.textSecondary}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        style={styles.field}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.field} testID={testID}>
      {inner}
    </View>
  );
};

export const BookingDetailScreen: React.FC = () => {
  const route = useRoute<BookingDetailRouteProp>();
  const navigation = useNavigation<BookingDetailNavigationProp>();
  // Sólo necesitamos `language` para el query string del gateway; la moneda
  // y el total provienen de la propia reserva, no de las preferencias.
  const {language} = usePreferences();
  const t = useT();
  const {monthFull} = useDates();
  const formatLongDate = buildFormatLongDate(monthFull);
  const {booking} = route.params;

  const destination = [booking.ciudad, booking.pais].filter(Boolean).join(', ');
  const dateRange = `${formatLongDate(booking.fechaCheckIn)} - ${formatLongDate(
    booking.fechaCheckOut,
  )}`;

  const handleHospedajePress = () => {
    const room = bookingToRoom(booking);
    const checkinIso = toIsoDay(booking.fechaCheckIn);
    const checkoutIso = toIsoDay(booking.fechaCheckOut);
    navigation.navigate('Detail', {
      room,
      nights: computeNights(checkinIso, checkoutIso),
      destination,
      dateRange,
      adults: booking.numHuespedes,
      checkin: checkinIso,
      checkout: checkoutIso,
      viewOnly: true,
    });
  };

  const status = getStatusInfo(booking.estado);
  const statusLabel = status.labelKey
    ? t(status.labelKey)
    : status.rawLabel || t('reservations.status.unknown');
  const showQr = !isPendingStatus(booking.estado);
  const showPayButton = isConfirmedStatus(booking.estado);

  const handlePagar = async () => {
    // La reserva ya viene con su propio total + moneda (la que se usó al
    // crear la reserva). NO se convierte a la preferencia actual del usuario.
    const url = buildPaymentUrl({
      invoiceId: booking.id,
      currency: booking.moneda,
      amount: booking.total,
      lang: language,
    });
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('bookingDetail.payOpenError'));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="booking-detail-back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('bookingDetail.headerTitle')}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {showQr && (
          <View style={styles.qrContainer} testID="booking-detail-qr">
            <QRCode value={booking.id || 'unknown'} size={130} />
          </View>
        )}
        <Field
          testID="booking-detail-id"
          label={t('bookingDetail.bookingId')}
          value={booking.id}
        />
        <View style={styles.field} testID="booking-detail-status">
          <View style={styles.fieldInner}>
            <View style={styles.fieldTexts}>
              <Text style={styles.fieldLabel}>
                {t('bookingDetail.status')}
              </Text>
              <View
                style={[styles.statusBadge, {backgroundColor: status.bg}]}>
                <Text style={[styles.statusText, {color: status.fg}]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Field
          testID="booking-detail-destination"
          label={t('bookingDetail.destination')}
          value={destination || '—'}
        />
        <Field
          testID="booking-detail-hospedaje"
          label={t('bookingDetail.lodging')}
          value={booking.nombreHotel}
          onPress={handleHospedajePress}
        />
        <Field
          testID="booking-detail-dates"
          label={t('bookingDetail.date')}
          value={dateRange}
        />
        <Field
          testID="booking-detail-guests"
          label={t('bookingDetail.adults')}
          value={String(booking.numHuespedes)}
        />
        <Field
          testID="booking-detail-total"
          label={t('bookingDetail.totalPaid')}
          value={formatAmount(booking.total, booking.moneda)}
        />
      </ScrollView>

      {showPayButton && (
        <View style={styles.footer}>
          <TouchableOpacity
            testID="booking-detail-pay-button"
            style={styles.payButton}
            onPress={handlePagar}
            accessibilityRole="button"
            accessibilityLabel={t('bookingDetail.payButton')}
            activeOpacity={0.85}>
            <Text style={styles.payButtonText}>
              {t('bookingDetail.payButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  field: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  fieldInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldTexts: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
