import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { useCallback, useEffect, useState } from 'react';

import en from './locales/en';
import vi from './locales/vi';

const i18n = new I18n({ en, vi });

// Set locale from device language, default to English
i18n.locale = getLocales()[0]?.languageCode ?? 'en';

// Fall back to English for any missing Vietnamese translations
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

// Set of listener callbacks to notify all components when locale changes
const listeners = new Set<(locale: string) => void>();

export function changeLanguage(newLocale: string) {
  i18n.locale = newLocale;
  listeners.forEach((listener) => listener(newLocale));
}

export function toggleLanguage() {
  const next = i18n.locale === 'vi' ? 'en' : 'vi';
  changeLanguage(next);
}

/**
 * React hook to get the current locale and triggers re-render across all screens when locale changes.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState(i18n.locale);

  useEffect(() => {
    const handleLocaleChange = (newLocale: string) => {
      setLocaleState(newLocale);
    };
    listeners.add(handleLocaleChange);
    return () => {
      listeners.delete(handleLocaleChange);
    };
  }, []);

  const setLocale = useCallback((newLocale: string) => {
    changeLanguage(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    toggleLanguage();
  }, []);

  return { locale, setLocale, toggleLocale, t: i18n.t.bind(i18n) };
}
