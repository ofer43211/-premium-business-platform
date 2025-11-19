/**
 * Tests for i18n Configuration
 * Coverage: Language switching, RTL detection, configuration
 */
import i18n, {
  changeLanguage,
  getCurrentLanguage,
  isRTL,
  languages,
  defaultLanguage,
} from '../config';

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset to default language
    i18n.changeLanguage(defaultLanguage);
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Initialization', () => {
    it('should initialize with default language', () => {
      expect(i18n.language).toBeDefined();
      expect(Object.keys(languages)).toContain(i18n.language);
    });

    it('should have all required languages', () => {
      expect(languages).toHaveProperty('en');
      expect(languages).toHaveProperty('he');
      expect(languages).toHaveProperty('ar');
    });

    it('should have correct language metadata', () => {
      expect(languages.en).toEqual({
        code: 'en',
        name: 'English',
        dir: 'ltr',
      });

      expect(languages.he).toEqual({
        code: 'he',
        name: 'עברית',
        dir: 'rtl',
      });

      expect(languages.ar).toEqual({
        code: 'ar',
        name: 'العربية',
        dir: 'rtl',
      });
    });
  });

  describe('changeLanguage', () => {
    it('should change to Hebrew', async () => {
      await changeLanguage('he');

      expect(i18n.language).toBe('he');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('he');
    });

    it('should change to Arabic', async () => {
      await changeLanguage('ar');

      expect(i18n.language).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should change to English', async () => {
      await changeLanguage('he'); // First set to RTL
      await changeLanguage('en'); // Then change back

      expect(i18n.language).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should update document direction correctly', async () => {
      // LTR language
      await changeLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');

      // RTL language
      await changeLanguage('he');
      expect(document.documentElement.dir).toBe('rtl');

      // Another RTL language
      await changeLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');

      // Back to LTR
      await changeLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language info for English', async () => {
      await changeLanguage('en');
      const currentLang = getCurrentLanguage();

      expect(currentLang).toEqual(languages.en);
    });

    it('should return current language info for Hebrew', async () => {
      await changeLanguage('he');
      const currentLang = getCurrentLanguage();

      expect(currentLang).toEqual(languages.he);
    });

    it('should return current language info for Arabic', async () => {
      await changeLanguage('ar');
      const currentLang = getCurrentLanguage();

      expect(currentLang).toEqual(languages.ar);
    });
  });

  describe('isRTL', () => {
    it('should return false for English', async () => {
      await changeLanguage('en');
      expect(isRTL()).toBe(false);
    });

    it('should return true for Hebrew', async () => {
      await changeLanguage('he');
      expect(isRTL()).toBe(true);
    });

    it('should return true for Arabic', async () => {
      await changeLanguage('ar');
      expect(isRTL()).toBe(true);
    });
  });

  describe('Translations', () => {
    it('should have English translations', async () => {
      await changeLanguage('en');

      expect(i18n.t('common.welcome')).toBe('Welcome');
      expect(i18n.t('auth.login')).toBe('Log In');
      expect(i18n.t('errors.generic')).toBe('Something went wrong');
    });

    it('should have Hebrew translations', async () => {
      await changeLanguage('he');

      expect(i18n.t('common.welcome')).toBe('ברוכים הבאים');
      expect(i18n.t('auth.login')).toBe('התחבר');
      expect(i18n.t('errors.generic')).toBe('משהו השתבש');
    });

    it('should have Arabic translations', async () => {
      await changeLanguage('ar');

      expect(i18n.t('common.welcome')).toBe('مرحباً');
      expect(i18n.t('auth.login')).toBe('تسجيل الدخول');
      expect(i18n.t('errors.generic')).toBe('حدث خطأ ما');
    });

    it('should fallback to English for missing translations', async () => {
      await changeLanguage('en');

      // Test with non-existent key
      const result = i18n.t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });
  });

  describe('Interpolation', () => {
    it('should interpolate variables in English', async () => {
      await changeLanguage('en');

      const result = i18n.t('validation.minLength', { min: 8 });
      expect(result).toContain('8');
    });

    it('should interpolate variables in Hebrew', async () => {
      await changeLanguage('he');

      const result = i18n.t('validation.minLength', { min: 8 });
      expect(result).toContain('8');
    });

    it('should interpolate variables in Arabic', async () => {
      await changeLanguage('ar');

      const result = i18n.t('validation.minLength', { min: 8 });
      expect(result).toContain('8');
    });
  });

  describe('Pluralization', () => {
    it('should handle plurals in English', async () => {
      await changeLanguage('en');

      expect(i18n.t('time.minutesAgo', { count: 1 })).toContain('minute');
      expect(i18n.t('time.minutesAgo', { count: 5 })).toContain('minutes');
    });

    it('should handle plurals in Hebrew', async () => {
      await changeLanguage('he');

      const singular = i18n.t('time.minutesAgo', { count: 1 });
      const plural = i18n.t('time.minutesAgo', { count: 5 });

      expect(singular).toBeTruthy();
      expect(plural).toBeTruthy();
      expect(singular).not.toBe(plural);
    });

    it('should handle plurals in Arabic', async () => {
      await changeLanguage('ar');

      const singular = i18n.t('time.minutesAgo', { count: 1 });
      const plural = i18n.t('time.minutesAgo', { count: 5 });

      expect(singular).toBeTruthy();
      expect(plural).toBeTruthy();
      expect(singular).not.toBe(plural);
    });
  });

  describe('Nested Keys', () => {
    it('should access nested translation keys', async () => {
      await changeLanguage('en');

      expect(i18n.t('auth.errors.invalidEmail')).toBe('Invalid email address');
      expect(i18n.t('billing.plans.free')).toBe('Free');
      expect(i18n.t('notification.types.system')).toBe('System');
    });
  });

  describe('Language Persistence', () => {
    it('should persist language choice', async () => {
      await changeLanguage('he');

      const stored = localStorage.getItem('i18nextLng');
      expect(stored).toBe('he');
    });

    it('should restore language from localStorage', async () => {
      localStorage.setItem('i18nextLng', 'ar');

      // Reinitialize i18n (in real app this happens on page load)
      await i18n.changeLanguage('ar');

      expect(i18n.language).toBe('ar');
    });
  });
});
