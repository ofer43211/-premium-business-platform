/**
 * Theme Types
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
}

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export interface ThemeColors {
  // Background
  background: string;
  surface: string;
  surfaceHover: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;

  // Primary
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryText: string;

  // Secondary
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  secondaryText: string;

  // Status
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;

  // Borders
  border: string;
  borderHover: string;

  // Shadows
  shadow: string;
  shadowLg: string;
}
