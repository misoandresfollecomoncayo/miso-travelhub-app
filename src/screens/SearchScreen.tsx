import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Calendar} from '../components/Calendar';
import {CounterInput} from '../components/CounterInput';
import {Colors} from '../theme/colors';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';

type NavigationProp = NativeStackNavigationProp<SearchStackParamList, 'Search'>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const today = new Date();
  const [destination, setDestination] = useState('');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const isFormValid =
    destination.trim().length > 0 && startDate !== null && endDate !== null;

  const handleSelectDate = (day: number) => {
    if (startDate === null || (startDate !== null && endDate !== null)) {
      setStartDate(day);
      setEndDate(null);
    } else if (day > startDate) {
      setEndDate(day);
    } else {
      setStartDate(day);
      setEndDate(null);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const MONTH_NAMES = [
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

  const formatIsoDate = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleSearch = () => {
    if (startDate === null || endDate === null) {
      return;
    }

    const monthName = MONTH_NAMES[currentMonth];
    const dateRange = `${startDate} ${monthName} ${currentYear} - ${endDate} ${monthName} ${currentYear}`;

    const ciudad = destination.split(',')[0].trim();
    const checkin = formatIsoDate(currentYear, currentMonth, startDate);
    const checkout = formatIsoDate(currentYear, currentMonth, endDate);

    navigation.navigate('Results', {
      destination,
      dateRange,
      adults,
      ciudad,
      checkin,
      checkout,
      rooms,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Text style={styles.title}>Buscar hospedaje</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Destino:</Text>
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Ciudad, pais"
          />
        </View>

        <Calendar
          year={currentYear}
          month={currentMonth}
          startDate={startDate}
          endDate={endDate}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <CounterInput
          label="Numero de adultos"
          value={adults}
          min={1}
          onIncrement={() => setAdults(adults + 1)}
          onDecrement={() => setAdults(adults - 1)}
        />

        <CounterInput
          label="Numero de ninos"
          value={children}
          min={0}
          onIncrement={() => setChildren(children + 1)}
          onDecrement={() => setChildren(children - 1)}
        />

        <CounterInput
          label="Numero de habitaciones"
          value={rooms}
          min={1}
          onIncrement={() => setRooms(rooms + 1)}
          onDecrement={() => setRooms(rooms - 1)}
        />

        <TouchableOpacity
          testID="search-button"
          style={[styles.searchButton, !isFormValid && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!isFormValid}>
          <Text style={styles.searchButtonText}>BUSCAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 8,
    padding: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
