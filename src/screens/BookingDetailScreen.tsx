import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
import {formatPrice} from '../utils/format';
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

const CANCEL_COLOR = '#D32F2F';

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

const formatLongDate = (iso: string): string => {
  if (!iso) {
    return '';
  }
  const dayPart = iso.slice(0, 10);
  const [y, m, d] = dayPart.split('-').map(n => Number(n));
  if (!y || !m || !d) {
    return iso;
  }
  return `${d} ${MONTH_NAMES_LOWER[m - 1]} ${y}`;
};

const formatBookingDateRange = (checkin: string, checkout: string): string =>
  `${formatLongDate(checkin)} - ${formatLongDate(checkout)}`;

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
  const {booking} = route.params;

  const destination = [booking.ciudad, booking.pais].filter(Boolean).join(', ');
  const dateRange = formatBookingDateRange(
    booking.fechaCheckIn,
    booking.fechaCheckOut,
  );

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

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Cancelación pendiente',
              'La cancelación estará disponible próximamente.',
            );
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
            testID="booking-detail-back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consultar reserva</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.qrContainer} testID="booking-detail-qr">
          <QRCode value={booking.id || 'unknown'} size={130} />
        </View>
        <Field
          testID="booking-detail-id"
          label="Id reserva:"
          value={booking.id}
        />
        <Field
          testID="booking-detail-destination"
          label="Destino:"
          value={destination || '—'}
        />
        <Field
          testID="booking-detail-hospedaje"
          label="Hospedaje:"
          value={booking.nombreHotel}
          onPress={handleHospedajePress}
        />
        <Field
          testID="booking-detail-dates"
          label="Fecha:"
          value={dateRange}
        />
        <Field
          testID="booking-detail-guests"
          label="Número de adultos:"
          value={String(booking.numHuespedes)}
        />
        <Field
          testID="booking-detail-total"
          label="Total pagado:"
          value={`COP $${formatPrice(booking.total)}`}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          testID="booking-detail-cancel-button"
          style={styles.cancelButton}
          onPress={handleCancelar}
          accessibilityRole="button"
          accessibilityLabel="Cancelar reserva"
          activeOpacity={0.85}>
          <Text style={styles.cancelButtonText}>CANCELAR RESERVA</Text>
        </TouchableOpacity>
      </View>
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
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: CANCEL_COLOR,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: CANCEL_COLOR,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
