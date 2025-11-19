/**
 * Theme Toggle Component
 * Button to toggle between light/dark themes
 */
import React from 'react';
import { useTheme } from './useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle"
    >
      {isDark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 2C10.5523 2 11 2.44772 11 3V4C11 4.55228 10.5523 5 10 5C9.44772 5 9 4.55228 9 4V3C9 2.44772 9.44772 2 10 2Z"
            fill="currentColor"
          />
          <path
            d="M10 15C10.5523 15 11 15.4477 11 16V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V16C9 15.4477 9.44772 15 10 15Z"
            fill="currentColor"
          />
          <path
            d="M3 10C3 9.44772 3.44772 9 4 9H5C5.55228 9 6 9.44772 6 10C6 10.5523 5.55228 11 5 11H4C3.44772 11 3 10.5523 3 10Z"
            fill="currentColor"
          />
          <path
            d="M14 10C14 9.44772 14.4477 9 15 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H15C14.4477 11 14 10.5523 14 10Z"
            fill="currentColor"
          />
          <path
            d="M10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7Z"
            fill="currentColor"
          />
          <path
            d="M5.05025 5.05025C5.44078 4.65973 6.07394 4.65973 6.46447 5.05025L7.17157 5.75736C7.5621 6.14788 7.5621 6.78105 7.17157 7.17157C6.78105 7.5621 6.14788 7.5621 5.75736 7.17157L5.05025 6.46447C4.65973 6.07394 4.65973 5.44078 5.05025 5.05025Z"
            fill="currentColor"
          />
          <path
            d="M12.8284 12.8284C13.219 12.4379 13.8521 12.4379 14.2426 12.8284L14.9497 13.5355C15.3403 13.9261 15.3403 14.5592 14.9497 14.9497C14.5592 15.3403 13.9261 15.3403 13.5355 14.9497L12.8284 14.2426C12.4379 13.8521 12.4379 13.219 12.8284 12.8284Z"
            fill="currentColor"
          />
          <path
            d="M14.9497 5.05025C15.3403 5.44078 15.3403 6.07394 14.9497 6.46447L14.2426 7.17157C13.8521 7.5621 13.219 7.5621 12.8284 7.17157C12.4379 6.78105 12.4379 6.14788 12.8284 5.75736L13.5355 5.05025C13.9261 4.65973 14.5592 4.65973 14.9497 5.05025Z"
            fill="currentColor"
          />
          <path
            d="M7.17157 12.8284C7.5621 13.219 7.5621 13.8521 7.17157 14.2426L6.46447 14.9497C6.07394 15.3403 5.44078 15.3403 5.05025 14.9497C4.65973 14.5592 4.65973 13.9261 5.05025 13.5355L5.75736 12.8284C6.14788 12.4379 6.78105 12.4379 7.17157 12.8284Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            fill="currentColor"
          />
        </svg>
      )}
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </button>
  );
}

/**
 * Theme Select Component
 * Dropdown to select light/dark/auto
 */
interface ThemeSelectProps {
  className?: string;
}

export function ThemeSelect({ className = '' }: ThemeSelectProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`theme-select ${className}`} data-testid="theme-select">
      <label htmlFor="theme-select-input" className="sr-only">
        Select theme
      </label>
      <select
        id="theme-select-input"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
        className="theme-select-input"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto (System)</option>
      </select>
    </div>
  );
}
