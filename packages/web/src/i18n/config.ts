/**
 * i18n Configuration
 * Multi-language support with RTL handling
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import he from './locales/he.json';
import ar from './locales/ar.json';

export const languages = {
  en: { code: 'en', name: 'English', dir: 'ltr' as const },
  he: { code: 'he', name: 'עברית', dir: 'rtl' as const },
  ar: { code: 'ar', name: 'العربية', dir: 'rtl' as const },
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLanguage: LanguageCode = 'en';

export const resources = {
  en: { translation: en },
  he: { translation: he },
  ar: { translation: ar },
} as const;

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    defaultNS: 'translation',
    fallbackLng: defaultLanguage,
    supportedLngs: Object.keys(languages),

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React i18next options
    react: {
      useSuspense: true,
    },
  });

/**
 * Change language and update document direction
 */
export function changeLanguage(lang: LanguageCode): Promise<void> {
  const language = languages[lang];

  // Update document direction
  document.documentElement.dir = language.dir;
  document.documentElement.lang = language.code;

  // Change i18n language
  return i18n.changeLanguage(lang);
}

/**
 * Get current language info
 */
export function getCurrentLanguage(): typeof languages[LanguageCode] {
  const code = (i18n.language || defaultLanguage) as LanguageCode;
  return languages[code] || languages[defaultLanguage];
}

/**
 * Check if current language is RTL
 */
export function isRTL(): boolean {
  return getCurrentLanguage().dir === 'rtl';
}

export default i18n;
