import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof DarkColors;
}

export const DarkColors = {
  background: '#09090b',
  card: '#18181b',
  cardBorder: '#ffffff',
  foreground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  primary: '#2dd4bf',
  primaryForeground: '#09090b',
  accent: '#fbbf24',
  accentForeground: '#09090b',
  destructive: '#fb7185',
  border: '#ffffff',
  tabBar: '#09090b',
  tabBarBorder: '#ffffff',
  shadow: '#ffffff',
};

export const LightColors = {
  background: '#F4F4F5',
  card: '#FFFFFF',
  cardBorder: '#09090b',
  foreground: '#09090b',
  muted: '#E4E4E7',
  mutedForeground: '#52525B',
  primary: '#009689',
  primaryForeground: '#FFFFFF',
  accent: '#009689',
  accentForeground: '#FFFFFF',
  destructive: '#EF4444',
  border: '#09090b',
  tabBar: '#009689',
  tabBarBorder: '#09090b',
  shadow: '#09090b',
};

const THEME_KEY = 'pollsphere_theme_mode';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  isDark: true,
  toggleTheme: () => {},
  colors: DarkColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        } else {
          // By default always set Dark mode
          setMode('dark');
        }
      })
      .catch(() => setMode('dark'))
      .finally(() => setReady(true));
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    SecureStore.setItemAsync(THEME_KEY, next).catch(() => {});
  };

  const isDark = mode === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
