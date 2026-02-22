'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeName = 'butcher' | 'forest' | 'stone';
type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'meatshop-theme';
const THEME_MODE_STORAGE_KEY = 'meatshop-theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('butcher');
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
    if (stored) {
      setThemeState(stored);
    }
    if (storedMode) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-mode', mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [theme, mode]);

  const setTheme = (nextTheme: ThemeName) => {
    setThemeState(nextTheme);
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
  };

  const value = useMemo(() => ({ theme, mode, setTheme, toggleMode }), [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
