import {useCallback, useMemo} from 'react';
import {usePreferences} from '../preferences/PreferencesContext';
import {
  translate,
  format,
  getMonthName,
  getDayShortNames,
  TranslationKey,
} from './translations';

/**
 * Hook de traducción. Devuelve una función `t(key, vars?)` que resuelve la
 * traducción contra el idioma actual, con interpolación opcional de
 * placeholders `{x}`.
 */
export const useT = (): ((
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string) => {
  const {language} = usePreferences();
  return useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const raw = translate(key, language);
      return vars ? format(raw, vars) : raw;
    },
    [language],
  );
};

/**
 * Hook para acceder a meses/días localizados (Calendar, date formatters).
 */
export const useDates = () => {
  const {language} = usePreferences();
  return useMemo(
    () => ({
      monthFull: (idx: number) => getMonthName(idx, language, 'full'),
      monthShort: (idx: number) => getMonthName(idx, language, 'short'),
      monthCapitalized: (idx: number) =>
        getMonthName(idx, language, 'capitalized'),
      dayShortNames: () => getDayShortNames(language),
    }),
    [language],
  );
};
