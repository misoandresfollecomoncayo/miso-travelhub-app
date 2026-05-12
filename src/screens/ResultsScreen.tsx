import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {RoomCard} from '../components/RoomCard';
import {Room} from '../data/room';
import {searchRooms} from '../services/searchApi';
import {useT} from '../i18n/useT';
import {TranslationKey} from '../i18n/translations';
import {useAuth} from '../auth/AuthContext';
import {usePreferences} from '../preferences/PreferencesContext';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';

/**
 * Mapea el mensaje crudo del backend (o un código sentinela del servicio) a
 * un string localizado para mostrar al usuario.
 */
const mapErrorToMessage = (
  raw: string,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string => {
  if (raw === 'NETWORK_ERROR') {
    return t('results.errorNetwork');
  }
  if (raw === 'UNKNOWN_ERROR' || raw.startsWith('HTTP_')) {
    return t('results.errorGeneric');
  }
  const lower = raw.toLowerCase();
  if (lower.includes('check-in') && lower.includes('lower than today')) {
    return t('results.errorCheckinPast');
  }
  if (
    lower.includes('check-out') &&
    (lower.includes('lower') || lower.includes('before'))
  ) {
    return t('results.errorCheckoutBeforeCheckin');
  }
  // Si no reconocemos el mensaje, devolvemos el detalle crudo del backend —
  // suele ser corto y en inglés, pero al menos da contexto al usuario y al
  // equipo en bug reports en lugar de "Error 400".
  return raw;
};

type ResultsRouteProp = RouteProp<SearchStackParamList, 'Results'>;
type ResultsNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Results'
>;

const computeNights = (checkin: string, checkout: string): number => {
  const start = Date.parse(checkin);
  const end = Date.parse(checkout);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 1;
  }
  const diffMs = end - start;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

export const ResultsScreen: React.FC = () => {
  const route = useRoute<ResultsRouteProp>();
  const navigation = useNavigation<ResultsNavigationProp>();
  const t = useT();
  const {user} = useAuth();
  const {currency} = usePreferences();
  const {destination, dateRange, adults, ciudad, checkin, checkout, rooms} =
    route.params;
  // Sin sesión: COP. Con sesión: la moneda configurada por el usuario.
  const queryCurrency = user ? currency : 'COP';

  const nights = computeNights(checkin, checkout);

  const [results, setResults] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchRooms({
          ciudad,
          checkin,
          checkout,
          group: adults,
          rooms,
          moneda: queryCurrency,
        });
        if (!cancelled) {
          setResults(data);
        }
      } catch (err) {
        if (!cancelled) {
          // Guardamos el mensaje crudo (o sentinela 'UNKNOWN_ERROR'); se
          // traduce/mapea en el render con `mapErrorToMessage` para evitar
          // refetches al cambiar idioma.
          const message =
            err instanceof Error ? err.message : 'UNKNOWN_ERROR';
          setError(message);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [ciudad, checkin, checkout, adults, rooms, queryCurrency]);

  const renderTitle = () => {
    if (loading) {
      return t('results.searching');
    }
    if (error) {
      return t('results.errorTitle');
    }
    return t('results.foundCount', {n: results.length});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>{renderTitle()}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>{t('results.summaryDestination')}</Text>
            {destination}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>{t('results.summaryDates')}</Text>
            {dateRange}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>{t('results.summaryAdults')}</Text>
            {adults}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>{t('results.summaryRooms')}</Text>
            {rooms}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.editIcon}>{'\u270E'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.stateContainer} testID="results-loading">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{mapErrorToMessage(error, t)}</Text>
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>{t('results.empty')}</Text>
        </View>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <RoomCard
              room={item}
              onPress={() =>
                navigation.navigate('Detail', {
                  room: item,
                  nights,
                  destination,
                  dateRange,
                  adults,
                  checkin,
                  checkout,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginVertical: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontWeight: '700',
  },
  editButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  editIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
