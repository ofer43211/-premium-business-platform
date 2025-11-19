/**
 * Tests for Language Switcher Component
 * Coverage: Dropdown and button variants, language switching
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n, { changeLanguage } from '../config';
import { LanguageSwitcher, LanguageLink } from '../components/LanguageSwitcher';

// Test wrapper with i18n provider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    // Reset to English before each test
    await changeLanguage('en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Dropdown Variant', () => {
    it('should render dropdown by default', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });

    it('should show all language options', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByTestId('language-select') as HTMLSelectElement;

      expect(select).toHaveTextContent('English');
      expect(select).toHaveTextContent('עברית');
      expect(select).toHaveTextContent('العربية');
    });

    it('should have current language selected', async () => {
      await changeLanguage('he');

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByTestId('language-select') as HTMLSelectElement;
      expect(select.value).toBe('he');
    });

    it('should change language when option is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByTestId('language-select');

      await user.selectOptions(select, 'he');

      await waitFor(() => {
        expect(i18n.language).toBe('he');
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('he');
      });
    });

    it('should change to Arabic', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByTestId('language-select');

      await user.selectOptions(select, 'ar');

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByTestId('language-select');
      expect(select).toHaveAttribute('aria-label', 'Select language');
      expect(screen.getByLabelText('Select Language')).toBeInTheDocument();
    });
  });

  describe('Button Variant', () => {
    it('should render buttons when variant is buttons', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" />
        </TestWrapper>
      );

      expect(screen.getByTestId('lang-button-en')).toBeInTheDocument();
      expect(screen.getByTestId('lang-button-he')).toBeInTheDocument();
      expect(screen.getByTestId('lang-button-ar')).toBeInTheDocument();
    });

    it('should show all language buttons', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" />
        </TestWrapper>
      );

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('עברית')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });

    it('should mark current language button as active', async () => {
      await changeLanguage('he');

      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" />
        </TestWrapper>
      );

      const heButton = screen.getByTestId('lang-button-he');
      expect(heButton).toHaveClass('active');
      expect(heButton).toHaveAttribute('aria-current', 'true');
    });

    it('should change language when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" />
        </TestWrapper>
      );

      const heButton = screen.getByTestId('lang-button-he');
      await user.click(heButton);

      await waitFor(() => {
        expect(i18n.language).toBe('he');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should have proper accessibility labels', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to עברית')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to العربية')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to dropdown', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher className="custom-class" />
        </TestWrapper>
      );

      const switcher = screen.getByTestId('language-switcher');
      expect(switcher).toHaveClass('custom-class');
    });

    it('should apply custom className to buttons', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="buttons" className="custom-class" />
        </TestWrapper>
      );

      const switcher = screen.getByTestId('language-switcher');
      expect(switcher).toHaveClass('custom-class');
    });
  });
});

describe('LanguageLink', () => {
  beforeEach(async () => {
    await changeLanguage('en');
  });

  it('should render language link', () => {
    render(
      <TestWrapper>
        <LanguageLink lang="he" />
      </TestWrapper>
    );

    expect(screen.getByTestId('language-link-he')).toBeInTheDocument();
  });

  it('should show language name by default', () => {
    render(
      <TestWrapper>
        <LanguageLink lang="he" />
      </TestWrapper>
    );

    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('should show custom children if provided', () => {
    render(
      <TestWrapper>
        <LanguageLink lang="he">Switch to Hebrew</LanguageLink>
      </TestWrapper>
    );

    expect(screen.getByText('Switch to Hebrew')).toBeInTheDocument();
    expect(screen.queryByText('עברית')).not.toBeInTheDocument();
  });

  it('should change language when clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LanguageLink lang="ar" />
      </TestWrapper>
    );

    const link = screen.getByTestId('language-link-ar');
    await user.click(link);

    await waitFor(() => {
      expect(i18n.language).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  it('should prevent default link behavior', async () => {
    render(
      <TestWrapper>
        <LanguageLink lang="he" />
      </TestWrapper>
    );

    const link = screen.getByTestId('language-link-he');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    link.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <LanguageLink lang="he" className="custom-link" />
      </TestWrapper>
    );

    const link = screen.getByTestId('language-link-he');
    expect(link).toHaveClass('custom-link');
  });

  it('should have proper accessibility label', () => {
    render(
      <TestWrapper>
        <LanguageLink lang="ar" />
      </TestWrapper>
    );

    const link = screen.getByTestId('language-link-ar');
    expect(link).toHaveAttribute('aria-label', 'Switch to العربية');
  });
});
