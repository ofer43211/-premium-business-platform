/**
 * Custom useTranslation hook with TypeScript support
 */
import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

/**
 * Custom hook for translations
 * Wraps react-i18next's useTranslation with type safety
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  return {
    t: t as TFunction,
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}

/**
 * Hook for checking RTL status
 */
export function useRTL(): boolean {
  const { i18n } = useI18nTranslation();
  const lang = i18n.language;
  return lang === 'he' || lang === 'ar';
}

/**
 * Hook for getting text direction
 */
export function useDirection(): 'ltr' | 'rtl' {
  const isRTL = useRTL();
  return isRTL ? 'rtl' : 'ltr';
}
