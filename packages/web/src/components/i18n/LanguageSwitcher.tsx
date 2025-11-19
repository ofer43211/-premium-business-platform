/**
 * Language Switcher Component
 * Handles multi-language support with RTL (Hebrew) support
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
}

export interface LanguageSwitcherProps {
  languages: Language[];
  onLanguageChange?: (language: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  languages,
  onLanguageChange,
}) => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(
    (lang) => lang.code === i18n.language
  ) || languages[0];

  useEffect(() => {
    // Set document direction based on current language
    document.documentElement.dir = currentLanguage.dir;
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const handleLanguageChange = async (language: Language) => {
    await i18n.changeLanguage(language.code);
    document.documentElement.dir = language.dir;
    document.documentElement.lang = language.code;
    onLanguageChange?.(language);
  };

  return (
    <div className="language-switcher" data-testid="language-switcher">
      <select
        value={currentLanguage.code}
        onChange={(e) => {
          const selected = languages.find((lang) => lang.code === e.target.value);
          if (selected) {
            handleLanguageChange(selected);
          }
        }}
        data-testid="language-select"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <span
        className="current-direction"
        data-testid="current-direction"
        aria-hidden="true"
      >
        {currentLanguage.dir.toUpperCase()}
      </span>
    </div>
  );
};
