'use client'
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { ReactNode } from "react";

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Storage key
const STORAGE_KEY = 'nexthire-theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Calculate actual theme based on theme setting
  const calculateActualTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  }, [getSystemTheme]);

  // Apply theme to document
  const applyTheme = useCallback((themeValue: 'light' | 'dark') => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(themeValue);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', themeValue);
    
    // Update CSS custom properties
    if (themeValue === 'dark') {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
    
    // Calculate and apply actual theme
    const actual = calculateActualTheme(newTheme);
    setActualTheme(actual);
    applyTheme(actual);
  }, [calculateActualTheme, applyTheme]);

  // Toggle between light and dark (ignoring system)
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // If currently system, toggle to opposite of system preference
      const systemTheme = getSystemTheme();
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, getSystemTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Get saved theme from localStorage
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme;
      const initialTheme = savedTheme || 'system';
      
      setThemeState(initialTheme);
      
      // Calculate and apply actual theme
      const actual = calculateActualTheme(initialTheme);
      setActualTheme(actual);
      applyTheme(actual);
      
      setMounted(true);
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      // Fallback to system theme
      const actual = getSystemTheme();
      setActualTheme(actual);
      applyTheme(actual);
      setMounted(true);
    }
  }, [calculateActualTheme, applyTheme, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newActual = getSystemTheme();
        setActualTheme(newActual);
        applyTheme(newActual);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, getSystemTheme, applyTheme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Legacy compatibility exports
export const useThemeContext = () => {
  const { actualTheme: isDark, toggleTheme, mounted } = useTheme();
  return {
    isDark: isDark === 'dark',
    toggleTheme,
    mounted
  };
};

export { ThemeProvider };
export { ThemeProvider as ThemeContextProvider };