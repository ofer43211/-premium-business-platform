/**
 * Theme Context and Provider
 * Manages light/dark theme with system preference detection
 */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ThemeMode, ThemeContextValue } from './types';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-preference';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Resolve the actual theme (auto becomes light or dark)
  const resolvedTheme: 'light' | 'dark' = theme === 'auto' ? systemPreference : theme;

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
