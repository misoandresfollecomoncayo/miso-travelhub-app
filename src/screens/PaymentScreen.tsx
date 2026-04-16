import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {SearchStackParamList} from '../navigation/SearchStackNavigator';
import {CardBrandBadges} from '../components/CardBrandBadges';
import {formatPrice, generateConfirmationCode} from '../utils/format';
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
} from '../utils/payment';

type PaymentRouteProp = RouteProp<SearchStackParamList, 'Payment'>;
type PaymentNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'Payment'
>;

const PROCESSING_DELAY_MS = 1500;

export const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentRouteProp>();
  const navigation = useNavigation<PaymentNavigationProp>();
  const {nombreHotel, destination, dateRange, nights, adults, total} =
    route.params;

  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [touched, setTouched] = useState({
    card: false,
    expiry: false,
    cvc: false,
  });
  const [loading, setLoading] = useState(false);

  const cardValid = isValidCardNumber(card);
  const expiryValid = isValidExpiry(expiry);
  const cvcValid = isValidCvc(cvc);
  const formValid = cardValid && expiryValid && cvcValid;

  const showCardError = touched.card && !cardValid;
  const showExpiryError = touched.expiry && !expiryValid;
  const showCvcError = touched.cvc && !cvcValid;

  const handlePay = () => {
    if (!formValid || loading) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigation.replace('ReservationSuccess', {
        nombreHotel,
        destination,
        dateRange,
        nights,
        adults,
        total,
        confirmationCode: generateConfirmationCode(),
      });
    }, PROCESSING_DELAY_MS);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="payment-back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pago seguro</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total a pagar</Text>
            <Text style={styles.summaryAmount} testID="payment-total">
              COP ${formatPrice(total)}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Datos de la tarjeta</Text>
            <CardBrandBadges />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Número de tarjeta</Text>
            <View
              style={[
                styles.inputContainer,
                showCardError && styles.inputContainerError,
              ]}>
              <Icon
                name="card-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <TextInput
                testID="payment-card"
                style={styles.input}
                value={card}
                onChangeText={value => setCard(formatCardNumber(value))}
                onBlur={() => setTouched(prev => ({...prev, card: true}))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.gray}
                keyboardType="number-pad"
                maxLength={19}
                autoComplete="cc-number"
                editable={!loading}
              />
            </View>
            {showCardError && (
              <Text style={styles.errorText} testID="payment-card-error">
                Ingresa un número de tarjeta válido (16 dígitos).
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowField]}>
              <Text style={styles.fieldLabel}>Vencimiento</Text>
              <View
                style={[
                  styles.inputContainer,
                  showExpiryError && styles.inputContainerError,
                ]}>
                <Icon
                  name="calendar-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  testID="payment-expiry"
                  style={styles.input}
                  value={expiry}
                  onChangeText={value => setExpiry(formatExpiry(value))}
                  onBlur={() => setTouched(prev => ({...prev, expiry: true}))}
                  placeholder="MM/YY"
                  placeholderTextColor={Colors.gray}
                  keyboardType="number-pad"
                  maxLength={5}
                  editable={!loading}
                />
              </View>
              {showExpiryError && (
                <Text style={styles.errorText} testID="payment-expiry-error">
                  Fecha inválida o vencida.
                </Text>
              )}
            </View>

            <View style={[styles.fieldGroup, styles.rowField]}>
              <Text style={styles.fieldLabel}>CVC</Text>
              <View
                style={[
                  styles.inputContainer,
                  showCvcError && styles.inputContainerError,
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  testID="payment-cvc"
                  style={styles.input}
                  value={cvc}
                  onChangeText={value => setCvc(formatCvc(value))}
                  onBlur={() => setTouched(prev => ({...prev, cvc: true}))}
                  placeholder="123"
                  placeholderTextColor={Colors.gray}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
              {showCvcError && (
                <Text style={styles.errorText} testID="payment-cvc-error">
                  El CVC debe tener 3 dígitos.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.secureRow}>
            <Icon
              name="lock-closed"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.secureText}>
              Pago 100% seguro. Tus datos están protegidos.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            testID="payment-pay-button"
            style={[
              styles.payButton,
              (!formValid || loading) && styles.payButtonDisabled,
            ]}
            onPress={handlePay}
            disabled={!formValid || loading}
            accessibilityRole="button"
            accessibilityLabel="Pagar"
            accessibilityState={{disabled: !formValid || loading}}
            activeOpacity={0.85}>
            {loading ? (
              <View style={styles.loadingRow} testID="payment-loading">
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.payButtonText}>  Procesando...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>
                PAGAR COP ${formatPrice(total)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
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
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputContainerError: {
    borderColor: '#D32F2F',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#D32F2F',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowField: {
    flex: 1,
    marginHorizontal: 4,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  secureText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
