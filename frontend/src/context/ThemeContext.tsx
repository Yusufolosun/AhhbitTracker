/**
 * @module ThemeContext
 * Context provider for managing light/dark theme state.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/** Supported theme values. */
type Theme = 'light' | 'dark';

/** Shape of the theme context value. */
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Get the initial theme from localStorage or default to dark.
 * Dark mode is the default as this is a Web3 dApp.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

/**
 * Provider component for theme state management.
 * Persists theme preference to localStorage and applies CSS class to document root.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme state and toggle function.
 * Must be used within a ThemeProvider.
 *
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
