/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, languages, type LanguageCode } from '../config';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as LanguageCode;

  const handleLanguageChange = async (lang: LanguageCode) => {
    await changeLanguage(lang);
  };

  if (variant === 'buttons') {
    return (
      <div className={`language-switcher-buttons ${className}`} data-testid="language-switcher">
        {(Object.keys(languages) as LanguageCode[]).map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`lang-button ${currentLang === lang ? 'active' : ''}`}
            data-testid={`lang-button-${lang}`}
            aria-label={`Switch to ${languages[lang].name}`}
            aria-current={currentLang === lang ? 'true' : 'false'}
          >
            {languages[lang].name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`language-switcher-dropdown ${className}`} data-testid="language-switcher">
      <label htmlFor="language-select" className="sr-only">
        Select Language
      </label>
      <select
        id="language-select"
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
        className="language-select"
        data-testid="language-select"
        aria-label="Select language"
      >
        {(Object.keys(languages) as LanguageCode[]).map((lang) => (
          <option key={lang} value={lang}>
            {languages[lang].name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Inline Language Link
 * Simple text link to switch language
 */
interface LanguageLinkProps {
  lang: LanguageCode;
  className?: string;
  children?: React.ReactNode;
}

export function LanguageLink({ lang, className = '', children }: LanguageLinkProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await changeLanguage(lang);
  };

  return (
    <a
      href={`#lang-${lang}`}
      onClick={handleClick}
      className={`language-link ${className}`}
      data-testid={`language-link-${lang}`}
      aria-label={`Switch to ${languages[lang].name}`}
    >
      {children || languages[lang].name}
    </a>
  );
}
