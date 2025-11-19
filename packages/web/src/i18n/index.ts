/**
 * i18n Module Exports
 * Multi-language support with RTL handling
 */

// Configuration
export {
  default as i18n,
  changeLanguage,
  getCurrentLanguage,
  isRTL,
  languages,
  defaultLanguage,
  type LanguageCode,
} from './config';

// Hooks
export { useTranslation, useRTL, useDirection } from './hooks/useTranslation';

// Components
export { LanguageSwitcher, LanguageLink } from './components/LanguageSwitcher';
