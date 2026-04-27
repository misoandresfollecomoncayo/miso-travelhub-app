import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {useAuth} from '../auth/AuthContext';
import {getBookings, BookingListItem} from '../services/bookingApi';
import {formatPrice} from '../utils/format';
import {resolveImage} from '../utils/images';
import {ReservationsStackParamList} from '../navigation/ReservationsStackNavigator';

type ReservationsNavigationProp = NativeStackNavigationProp<
  ReservationsStackParamList,
  'ReservationsList'
>;

const MONTH_NAMES_LOWER = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const formatDate = (iso: string): string => {
  if (!iso) {
    return '';
  }
  // Acepta tanto YYYY-MM-DD como YYYY-MM-DDTHH:mm:ssZ
  const dayPart = iso.slice(0, 10);
  const [y, m, d] = dayPart.split('-').map(n => Number(n));
  if (!y || !m || !d) {
    return iso;
  }
  return `${d} ${MONTH_NAMES_LOWER[m - 1]} ${y}`;
};

const formatDateRange = (checkin: string, checkout: string): string => {
  return `${formatDate(checkin)} → ${formatDate(checkout)}`;
};

interface StatusStyle {
  label: string;
  bg: string;
  fg: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  PENDIENTE: {label: 'Pendiente', bg: '#FFF3E0', fg: '#E65100'},
  CONFIRMADA: {label: 'Confirmada', bg: '#E8F5E9', fg: '#2E7D32'},
  CONFIRMADO: {label: 'Confirmada', bg: '#E8F5E9', fg: '#2E7D32'},
  COMPLETADA: {label: 'Completada', bg: '#E3F2FD', fg: '#1565C0'},
  COMPLETADO: {label: 'Completada', bg: '#E3F2FD', fg: '#1565C0'},
  CANCELADA: {label: 'Cancelada', bg: '#FFEBEE', fg: '#C62828'},
  CANCELADO: {label: 'Cancelada', bg: '#FFEBEE', fg: '#C62828'},
};

const getStatusStyle = (status: string): StatusStyle => {
  const upper = (status || '').toUpperCase();
  return (
    STATUS_STYLES[upper] || {
      label: status || 'Sin estado',
      bg: Colors.grayLight,
      fg: Colors.textSecondary,
    }
  );
};

interface BookingCardProps {
  booking: BookingListItem;
  onPress: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({booking, onPress}) => {
  const status = getStatusStyle(booking.estado);
  const cover = resolveImage(booking.imagenes);
  const ciudadPais = [booking.ciudad, booking.pais].filter(Boolean).join(', ');
  const guestsLabel =
    booking.numHuespedes === 1 ? '1 huésped' : `${booking.numHuespedes} huéspedes`;

  return (
    <TouchableOpacity
      style={styles.card}
      testID={`booking-card-${booking.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de la reserva en ${booking.nombreHotel}`}
      activeOpacity={0.7}>
      <Image source={{uri: cover}} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {booking.nombreHotel}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
            <Text style={[styles.statusText, {color: status.fg}]}>
              {status.label}
            </Text>
          </View>
        </View>
        {ciudadPais.length > 0 && (
          <View style={styles.metaRow}>
            <Icon
              name="location-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {ciudadPais}
            </Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <Icon
            name="calendar-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {formatDateRange(booking.fechaCheckIn, booking.fechaCheckOut)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="people-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{guestsLabel}</Text>
        </View>
        <Text style={styles.totalText}>
          Total: <Text style={styles.totalAmount}>COP ${formatPrice(booking.total)}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ReservationsScreen: React.FC = () => {
  const {user, initializing} = useAuth();
  const navigation = useNavigation<ReservationsNavigationProp>();
  const userToken = user?.token ?? null;
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userToken) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings(userToken);
      setBookings(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las reservas';
      setError(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    if (userToken) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [userToken, fetchBookings]);

  if (initializing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerWrapper}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Reservas</Text>
        <View style={styles.centerWrapper}>
          <Icon
            name="lock-closed-outline"
            size={56}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>Inicia sesión</Text>
          <Text style={styles.emptySubtitle}>
            Inicia sesión para ver tus reservas.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Reservas</Text>
        <View style={styles.centerWrapper} testID="reservations-loading">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Reservas</Text>
        <View style={styles.centerWrapper}>
          <Icon
            name="cloud-offline-outline"
            size={56}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No se pudieron cargar tus reservas</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            testID="reservations-retry"
            style={styles.retryButton}
            onPress={fetchBookings}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
            activeOpacity={0.85}>
            <Text style={styles.retryText}>REINTENTAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Reservas</Text>
        <View style={styles.centerWrapper}>
          <Icon name="bed-outline" size={56} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Aún no tienes reservas</Text>
          <Text style={styles.emptySubtitle}>
            Cuando hagas una reserva la verás aquí.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <TouchableOpacity
          testID="reservations-refresh"
          style={styles.refreshButton}
          onPress={fetchBookings}
          accessibilityRole="button"
          accessibilityLabel="Actualizar reservas"
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        testID="reservations-list"
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <BookingCard
            booking={item}
            onPress={() =>
              navigation.navigate('BookingDetail', {booking: item})
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginLeft: 32,
  },
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: 110,
    height: 'auto',
    minHeight: 130,
    backgroundColor: Colors.grayLight,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  totalText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  totalAmount: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
