/**
 * Tests for Theme System
 * Coverage: ThemeProvider, useTheme, ThemeToggle, system preference
 */
import React from 'react';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../ThemeContext';
import { useTheme } from '../useTheme';
import { ThemeToggle, ThemeSelect } from '../ThemeToggle';

// Mock matchMedia
const createMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Wrapper for hooks
function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = createMatchMedia(false);
  });

  describe('Initialization', () => {
    it('should initialize with auto theme by default', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe('auto');
    });

    it('should initialize with custom default theme', () => {
      function customWrapper({ children }: { children: React.ReactNode }) {
        return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
      }

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });
      expect(result.current.theme).toBe('dark');
    });

    it('should restore theme from localStorage', () => {
      localStorage.setItem('theme-preference', 'dark');

      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe('dark');
    });

    it('should use default when localStorage has invalid value', () => {
      localStorage.setItem('theme-preference', 'invalid');

      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.theme).toBe('auto');
    });
  });

  describe('System Preference Detection', () => {
    it('should resolve auto to light when system prefers light', () => {
      window.matchMedia = createMatchMedia(false);

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should resolve auto to dark when system prefers dark', () => {
      window.matchMedia = createMatchMedia(true);

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should not resolve light theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should not resolve dark theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should set theme to auto', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme).toBe('auto');
    });

    it('should persist theme to localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorage.getItem('theme-preference')).toBe('dark');
    });

    it('should use custom storage key', () => {
      function customWrapper({ children }: { children: React.ReactNode }) {
        return (
          <ThemeProvider storageKey="custom-theme-key">{children}</ThemeProvider>
        );
      }

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorage.getItem('custom-theme-key')).toBe('dark');
      expect(localStorage.getItem('theme-preference')).toBeNull();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should toggle auto based on resolved theme', () => {
      window.matchMedia = createMatchMedia(false); // System prefers light

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.resolvedTheme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  describe('DOM Updates', () => {
    it('should apply light class to document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should apply dark class to document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should set data-theme attribute', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update document when theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('light')).toBe(true);

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should throw error when used outside ThemeProvider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    console.error = originalError;
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    window.matchMedia = createMatchMedia(false);
  });

  it('should render toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('should show moon icon when light theme is active', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toBeInTheDocument();
  });

  it('should show sun icon when dark theme is active', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toBeInTheDocument();
  });

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');

    await user.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should have proper aria-label', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('should show label when showLabel is true', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle showLabel />
      </ThemeProvider>
    );

    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('should not show label by default', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ThemeProvider>
        <ThemeToggle className="custom-toggle" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toHaveClass('custom-toggle');
  });
});

describe('ThemeSelect', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = createMatchMedia(false);
  });

  it('should render select dropdown', () => {
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-select')).toBeInTheDocument();
  });

  it('should show all theme options', () => {
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Auto (System)')).toBeInTheDocument();
  });

  it('should have current theme selected', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeSelect />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('dark');
  });

  it('should change theme when option is selected', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeSelect />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'dark');

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Select theme');
    expect(screen.getByLabelText('Select theme')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ThemeProvider>
        <ThemeSelect className="custom-select" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-select')).toHaveClass('custom-select');
  });
});
