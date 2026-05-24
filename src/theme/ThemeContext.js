import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './index';
import appStorage from '../storage/appStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  // Initialize state based on system scheme immediately for better UX
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  // Update theme when system scheme changes, but ONLY if user hasn't set a preference
  useEffect(() => {
    const syncWithSystem = async () => {
      try {
        const savedTheme = await appStorage.getItem('theme_mode');
        if (!savedTheme) {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.error('System sync failed', e);
      }
    };
    syncWithSystem();
  }, [systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await appStorage.getItem('theme_mode');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Fallback to system scheme if no preference is saved
        setIsDark(systemColorScheme === 'dark'); 
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
      // Fallback to system on error
      setIsDark(systemColorScheme === 'dark');
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    try {
      await appStorage.setItem('theme_mode', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const theme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
