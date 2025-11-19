/**
 * Tests for LanguageSwitcher Component
 * Coverage: Multi-language support, RTL handling, i18n integration
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { LanguageSwitcher, Language } from '../LanguageSwitcher';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: jest.fn((lang) => Promise.resolve()),
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LanguageSwitcher', () => {
  const mockLanguages: Language[] = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
  ];

  beforeEach(() => {
    // Reset document attributes
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Rendering', () => {
    it('should render language selector', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });

    it('should render all available languages', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      const select = screen.getByTestId('language-select') as HTMLSelectElement;
      const options = Array.from(select.options);

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('English');
      expect(options[1]).toHaveTextContent('עברית');
      expect(options[2]).toHaveTextContent('العربية');
    });

    it('should display current language direction', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      const direction = screen.getByTestId('current-direction');
      expect(direction).toHaveTextContent('LTR');
    });

    it('should have accessible label', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      const select = screen.getByTestId('language-select');
      expect(select).toHaveAttribute('aria-label', 'Select language');
    });
  });

  describe('Language Switching', () => {
    it('should change language when option is selected', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <LanguageSwitcher
          languages={mockLanguages}
          onLanguageChange={mockOnChange}
        />
      );

      const select = screen.getByTestId('language-select');
      await user.selectOptions(select, 'he');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          code: 'he',
          name: 'עברית',
          dir: 'rtl',
        });
      });
    });

    it('should update document direction when language changes', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      const select = screen.getByTestId('language-select');
      await user.selectOptions(select, 'he');

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('he');
      });
    });

    it('should update document direction on mount', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('RTL Support', () => {
    it('should set RTL direction for Hebrew', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      await user.selectOptions(screen.getByTestId('language-select'), 'he');

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should set RTL direction for Arabic', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      await user.selectOptions(screen.getByTestId('language-select'), 'ar');

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should switch from RTL to LTR', async () => {
      const user = userEvent.setup();

      // Start with Hebrew (RTL)
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';

      render(<LanguageSwitcher languages={mockLanguages} />);

      // Switch to English (LTR)
      await user.selectOptions(screen.getByTestId('language-select'), 'en');

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.documentElement.lang).toBe('en');
      });
    });

    it('should update direction indicator when switching to RTL', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      await user.selectOptions(screen.getByTestId('language-select'), 'he');

      await waitFor(() => {
        expect(screen.getByTestId('current-direction')).toHaveTextContent('RTL');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onLanguageChange callback', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      const select = screen.getByTestId('language-select');

      // Should not throw
      await expect(user.selectOptions(select, 'he')).resolves.not.toThrow();
    });

    it('should handle single language', () => {
      const singleLanguage = [{ code: 'en', name: 'English', dir: 'ltr' as const }];

      render(<LanguageSwitcher languages={singleLanguage} />);

      const select = screen.getByTestId('language-select') as HTMLSelectElement;
      expect(select.options).toHaveLength(1);
    });

    it('should default to first language if current not found', () => {
      // Mock i18n with unknown language
      const { useTranslation } = require('react-i18next');
      useTranslation.mockImplementation(() => ({
        i18n: {
          language: 'unknown',
          changeLanguage: jest.fn(),
        },
      }));

      render(<LanguageSwitcher languages={mockLanguages} />);

      // Should default to first language (English)
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on direction indicator', () => {
      render(<LanguageSwitcher languages={mockLanguages} />);

      const direction = screen.getByTestId('current-direction');
      expect(direction).toHaveAttribute('aria-hidden', 'true');
    });

    it('should maintain focus after language change', async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher languages={mockLanguages} />);

      const select = screen.getByTestId('language-select');
      select.focus();

      await user.selectOptions(select, 'he');

      await waitFor(() => {
        expect(document.activeElement).toBe(select);
      });
    });
  });
});
