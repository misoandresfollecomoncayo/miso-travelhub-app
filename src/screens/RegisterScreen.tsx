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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {UserStackParamList} from '../navigation/UserStackNavigator';

type RegisterNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  'Register'
>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = () => {
    if (!termsAccepted) {
      return;
    }
    Alert.alert('Crear cuenta', 'Funcionalidad próximamente');
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
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Teléfono:</Text>
            <TextInput
              testID="register-phone"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña:</Text>
            <TextInput
              testID="register-password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
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
            />
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity
              testID="register-terms-checkbox"
              style={styles.checkbox}
              onPress={() => setTermsAccepted(prev => !prev)}
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
              !termsAccepted && styles.primaryButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!termsAccepted}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
            accessibilityState={{disabled: !termsAccepted}}
            activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>
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
