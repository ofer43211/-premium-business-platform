/**
 * Theme Color Definitions
 * CSS variables for light and dark modes
 */

export const lightTheme = {
  // Background
  '--color-background': '#ffffff',
  '--color-surface': '#f8f9fa',
  '--color-surface-hover': '#e9ecef',

  // Text
  '--color-text-primary': '#212529',
  '--color-text-secondary': '#6c757d',
  '--color-text-disabled': '#adb5bd',

  // Primary
  '--color-primary': '#0d6efd',
  '--color-primary-hover': '#0b5ed7',
  '--color-primary-active': '#0a58ca',
  '--color-primary-text': '#ffffff',

  // Secondary
  '--color-secondary': '#6c757d',
  '--color-secondary-hover': '#5c636a',
  '--color-secondary-active': '#565e64',
  '--color-secondary-text': '#ffffff',

  // Status
  '--color-success': '#198754',
  '--color-success-bg': '#d1e7dd',
  '--color-error': '#dc3545',
  '--color-error-bg': '#f8d7da',
  '--color-warning': '#ffc107',
  '--color-warning-bg': '#fff3cd',
  '--color-info': '#0dcaf0',
  '--color-info-bg': '#cff4fc',

  // Borders
  '--color-border': '#dee2e6',
  '--color-border-hover': '#adb5bd',

  // Shadows
  '--shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
  '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.15)',
};

export const darkTheme = {
  // Background
  '--color-background': '#1a1a1a',
  '--color-surface': '#2d2d2d',
  '--color-surface-hover': '#3d3d3d',

  // Text
  '--color-text-primary': '#f8f9fa',
  '--color-text-secondary': '#adb5bd',
  '--color-text-disabled': '#6c757d',

  // Primary
  '--color-primary': '#0d6efd',
  '--color-primary-hover': '#3d8bfd',
  '--color-primary-active': '#6ea8fe',
  '--color-primary-text': '#ffffff',

  // Secondary
  '--color-secondary': '#6c757d',
  '--color-secondary-hover': '#868e96',
  '--color-secondary-active': '#a0a8b0',
  '--color-secondary-text': '#ffffff',

  // Status
  '--color-success': '#198754',
  '--color-success-bg': '#0f5132',
  '--color-error': '#dc3545',
  '--color-error-bg': '#842029',
  '--color-warning': '#ffc107',
  '--color-warning-bg': '#664d03',
  '--color-info': '#0dcaf0',
  '--color-info-bg': '#055160',

  // Borders
  '--color-border': '#495057',
  '--color-border-hover': '#6c757d',

  // Shadows
  '--shadow': '0 1px 3px rgba(0, 0, 0, 0.3)',
  '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.5)',
};

/**
 * Apply theme colors to document
 */
export function applyThemeColors(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;

  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const root = document.documentElement;

  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}
