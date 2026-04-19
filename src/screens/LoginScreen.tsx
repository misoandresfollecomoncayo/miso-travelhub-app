import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {useAuth} from '../auth/AuthContext';
import {UserStackParamList} from '../navigation/UserStackNavigator';

const TRAVELHUB_LOGO = require('../assets/logo_travelhub.png');
const LOGIN_BACKGROUND = require('../assets/login_background.png');

const SCREEN_WIDTH = Dimensions.get('window').width;

type LoginNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  'Login'
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed);
};

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const {login, loading} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = isValidEmail(email);
  const passwordValid = password.length > 0;
  const formValid = emailValid && passwordValid;
  const showEmailError = emailTouched && !emailValid;

  const handleLogin = async () => {
    if (!formValid || loading) {
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo iniciar sesión';
      Alert.alert('Error', message);
    }
  };

  const handleForgot = () => navigation.navigate('ForgotPassword');
  const handleRegister = () => navigation.navigate('Register');

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ImageBackground
          source={LOGIN_BACKGROUND}
          style={styles.hero}
          resizeMode="cover">
          <Image
            testID="brand-logo"
            source={TRAVELHUB_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="TravelHub"
          />
        </ImageBackground>

        <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>

            <View
              style={[
                styles.inputWrapper,
                showEmailError && styles.inputWrapperError,
              ]}>
              <Text style={styles.inputLabel}>Correo electrónico:</Text>
              <TextInput
                testID="login-email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {showEmailError && (
              <Text style={styles.errorText} testID="login-email-error">
                Ingresa un correo electrónico válido.
              </Text>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña:</Text>
              <TextInput
                testID="login-password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              testID="login-forgot-link"
              style={styles.forgotLink}
              onPress={handleForgot}
              disabled={loading}
              accessibilityRole="link">
              <Text style={styles.forgotText}>
                ¿No recuerdas tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="login-submit-button"
              style={[
                styles.primaryButton,
                (!formValid || loading) && styles.primaryButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!formValid || loading}
              accessibilityRole="button"
              accessibilityLabel="Iniciar sesión"
              accessibilityState={{disabled: !formValid || loading}}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={Colors.white} testID="login-loading" />
              ) : (
                <Text style={styles.primaryButtonText}>INICIAR SESIÓN</Text>
              )}
            </TouchableOpacity>

          <TouchableOpacity
            testID="login-register-button"
            style={styles.secondaryButton}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
            activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>CREAR CUENTA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  hero: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 160,
    height: 116,
  },
  card: {
    padding: 24
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  inputWrapperError: {
    borderColor: '#D32F2F',
  },
  inputLabel: {
    fontSize: 13,
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
    marginBottom: 10,
    fontSize: 12,
    color: '#D32F2F',
    paddingHorizontal: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginBottom: 2,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
