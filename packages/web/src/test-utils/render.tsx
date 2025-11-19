/**
 * Custom render function for React Testing Library
 * Includes common providers and setup
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

// Initialize i18n for tests
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.success': 'Success',
      },
    },
    he: {
      translation: {
        'common.loading': 'טוען...',
        'common.error': 'אירעה שגיאה',
        'common.success': 'הצלחה',
      },
    },
  },
});

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper with all providers
 */
function AllProviders({ children }: AllProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

/**
 * Custom render function
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
