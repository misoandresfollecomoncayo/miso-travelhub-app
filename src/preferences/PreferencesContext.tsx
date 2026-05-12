import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'es' | 'en';
export type Currency = 'COP' | 'EUR' | 'USD';

export const SUPPORTED_LANGUAGES: Language[] = ['es', 'en'];
export const SUPPORTED_CURRENCIES: Currency[] = ['COP', 'EUR', 'USD'];

const STORAGE_KEY_LANGUAGE = '@travelhub:language';
const STORAGE_KEY_CURRENCY = '@travelhub:currency';

const DEFAULT_LANGUAGE: Language = 'es';
const DEFAULT_CURRENCY: Currency = 'COP';

const normalizeLanguage = (value: string | null | undefined): Language => {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }
  const lower = value.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(lower as Language)
    ? (lower as Language)
    : DEFAULT_LANGUAGE;
};

const normalizeCurrency = (value: string | null | undefined): Currency => {
  if (!value) {
    return DEFAULT_CURRENCY;
  }
  const upper = value.toUpperCase();
  return SUPPORTED_CURRENCIES.includes(upper as Currency)
    ? (upper as Currency)
    : DEFAULT_CURRENCY;
};

interface PreferencesContextValue {
  language: Language;
  currency: Currency;
  initializing: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
);

export const PreferencesProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const [lang, curr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEY_CURRENCY),
        ]);
        if (!cancelled) {
          setLanguageState(normalizeLanguage(lang));
          setCurrencyState(normalizeCurrency(curr));
        }
      } catch {
        // Ignore — defaults are fine
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    const normalized = normalizeLanguage(lang);
    setLanguageState(normalized);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, normalized);
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = useCallback(async (curr: Currency) => {
    const normalized = normalizeCurrency(curr);
    setCurrencyState(normalized);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CURRENCY, normalized);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({language, currency, initializing, setLanguage, setCurrency}),
    [language, currency, initializing, setLanguage, setCurrency],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
};
