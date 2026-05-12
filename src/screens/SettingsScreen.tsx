import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {
  usePreferences,
  Language,
  Currency,
  SUPPORTED_LANGUAGES,
  SUPPORTED_CURRENCIES,
} from '../preferences/PreferencesContext';
import {useT} from '../i18n/useT';
import {TranslationKey} from '../i18n/translations';
import {UserStackParamList} from '../navigation/UserStackNavigator';

type SettingsNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  'Settings'
>;

interface OptionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

const OptionRow: React.FC<OptionRowProps> = ({
  label,
  selected,
  onPress,
  testID,
}) => (
  <TouchableOpacity
    testID={testID}
    style={styles.optionRow}
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{selected}}
    accessibilityLabel={label}
    activeOpacity={0.7}>
    <Text
      style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
      {label}
    </Text>
    {selected && (
      <Icon name="checkmark" size={22} color={Colors.primary} />
    )}
  </TouchableOpacity>
);

const LANGUAGE_LABELS: Record<Language, TranslationKey> = {
  es: 'settings.language.es',
  en: 'settings.language.en',
};

const CURRENCY_LABELS: Record<Currency, TranslationKey> = {
  COP: 'settings.currency.cop',
  EUR: 'settings.currency.eur',
  USD: 'settings.currency.usd',
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const t = useT();
  const {language, currency, setLanguage, setCurrency} = usePreferences();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="settings-back-button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {t('settings.section.language')}
        </Text>
        <View style={styles.card} testID="settings-language-card">
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <View key={lang}>
              {index > 0 && <View style={styles.divider} />}
              <OptionRow
                testID={`settings-language-${lang}`}
                label={t(LANGUAGE_LABELS[lang])}
                selected={lang === language}
                onPress={() => setLanguage(lang)}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          {t('settings.section.currency')}
        </Text>
        <View style={styles.card} testID="settings-currency-card">
          {SUPPORTED_CURRENCIES.map((curr, index) => (
            <View key={curr}>
              {index > 0 && <View style={styles.divider} />}
              <OptionRow
                testID={`settings-currency-${curr}`}
                label={t(CURRENCY_LABELS[curr])}
                selected={curr === currency}
                onPress={() => setCurrency(curr)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  optionLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginLeft: 16,
  },
});
