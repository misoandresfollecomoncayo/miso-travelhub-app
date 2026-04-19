import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {UserStackParamList} from '../navigation/UserStackNavigator';
import {useAuth} from '../auth/AuthContext';
import {SelectField, SelectOption} from '../components/SelectField';

type RegisterNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  'Register'
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const COUNTRY_OPTIONS: SelectOption[] = [
  {value: 'CO', label: 'Colombia'},
  {value: 'AR', label: 'Argentina'},
  {value: 'BR', label: 'Brasil'},
  {value: 'CL', label: 'Chile'},
  {value: 'EC', label: 'Ecuador'},
  {value: 'ES', label: 'España'},
  {value: 'MX', label: 'México'},
  {value: 'PE', label: 'Perú'},
  {value: 'US', label: 'Estados Unidos'},
  {value: 'UY', label: 'Uruguay'},
  {value: 'VE', label: 'Venezuela'},
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  {value: 'es', label: 'Español'},
  {value: 'en', label: 'Inglés'},
];

const CURRENCY_OPTIONS: SelectOption[] = [
  {value: 'COP', label: 'COP — Peso colombiano'},
  {value: 'EUR', label: 'EUR — Euro'},
  {value: 'USD', label: 'USD — Dólar estadounidense'},
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const {register, loading} = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [country, setCountry] = useState('CO');
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('COP');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const nombreValid = fullName.trim().length > 0;
  const emailValid = EMAIL_REGEX.test(email.trim());
  const passwordValid = password.length >= MIN_PASSWORD;
  const confirmValid = confirm === password && confirm.length > 0;

  const formValid =
    nombreValid &&
    emailValid &&
    passwordValid &&
    confirmValid &&
    termsAccepted;

  const handleRegister = async () => {
    if (!formValid || loading) {
      return;
    }
    try {
      const nombre = fullName.trim();
      await register({
        email: email.trim(),
        // El API pide username; usamos el nombre completo
        username: nombre,
        nombre,
        password,
        telefono: phone.trim() || undefined,
        pais: country,
        idioma: language,
        moneda_preferida: currency,
      });
      // Éxito: el AuthContext actualizó el user; el UserStackNavigator
      // cambiará automáticamente a la pantalla de perfil.
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo crear la cuenta';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              testID="register-back-button"
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para comenzar a planear tus viajes.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre completo:</Text>
            <TextInput
              testID="register-name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Correo electrónico:</Text>
            <TextInput
              testID="register-email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Teléfono (opcional):</Text>
            <TextInput
              testID="register-phone"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <SelectField
            testID="register-country"
            label="País:"
            value={country}
            options={COUNTRY_OPTIONS}
            onChange={setCountry}
            disabled={loading}
          />

          <SelectField
            testID="register-language"
            label="Idioma:"
            value={language}
            options={LANGUAGE_OPTIONS}
            onChange={setLanguage}
            disabled={loading}
          />

          <SelectField
            testID="register-currency"
            label="Moneda preferida:"
            value={currency}
            options={CURRENCY_OPTIONS}
            onChange={setCurrency}
            disabled={loading}
          />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Contraseña (mínimo {MIN_PASSWORD} caracteres):
            </Text>
            <TextInput
              testID="register-password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirmar contraseña:</Text>
            <TextInput
              testID="register-confirm"
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          {confirm.length > 0 && !confirmValid && (
            <Text style={styles.errorText} testID="register-confirm-error">
              Las contraseñas no coinciden.
            </Text>
          )}

          <View style={styles.termsRow}>
            <TouchableOpacity
              testID="register-terms-checkbox"
              style={styles.checkbox}
              onPress={() => setTermsAccepted(prev => !prev)}
              disabled={loading}
              accessibilityRole="checkbox"
              accessibilityState={{checked: termsAccepted}}
              accessibilityLabel="Acepto los términos y condiciones de uso"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <View
                style={[
                  styles.checkboxBox,
                  termsAccepted && styles.checkboxBoxChecked,
                ]}>
                {termsAccepted && (
                  <Icon name="checkmark" size={16} color={Colors.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text
                testID="register-terms-link"
                style={styles.termsLink}
                onPress={() => navigation.navigate('TermsAndConditions')}
                accessibilityRole="link">
                términos y condiciones de uso
              </Text>{' '}
              de la aplicación.
            </Text>
          </View>

          <TouchableOpacity
            testID="register-submit-button"
            style={[
              styles.primaryButton,
              (!formValid || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!formValid || loading}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
            accessibilityState={{disabled: !formValid || loading}}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator
                color={Colors.white}
                testID="register-loading"
              />
            ) : (
              <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
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
  errorText: {
    marginTop: -4,
    marginBottom: 8,
    fontSize: 12,
    color: '#D32F2F',
    paddingHorizontal: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
  termsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
