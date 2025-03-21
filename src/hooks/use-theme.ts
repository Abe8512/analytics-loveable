
import { useContext, useEffect } from 'react';
import { ThemeContext } from '@/App';

export const useTheme = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // Apply theme-specific CSS variables when theme changes
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Add specific animation classes based on theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme-animations');
      document.documentElement.classList.remove('light-theme-animations');
    } else {
      document.documentElement.classList.add('light-theme-animations');
      document.documentElement.classList.remove('dark-theme-animations');
    }
  
    return () => {
      document.documentElement.style.removeProperty('--theme-transition');
    };
  }, [isDarkMode]);
  
  return {
    isDark: isDarkMode,
    toggleTheme,
    themeClass: isDarkMode ? 'dark-theme' : 'light-theme',
  };
};
