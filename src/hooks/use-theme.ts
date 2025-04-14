
import { useContext } from 'react';
import { ThemeContext } from '@/App';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Add the toggleDarkMode function that was missing
  const toggleDarkMode = () => {
    context.setIsDarkMode(!context.isDarkMode);
  };
  
  return {
    ...context,
    toggleDarkMode,
    // Add aliases for compatibility with components using isDark and toggleTheme
    isDark: context.isDarkMode,
    toggleTheme: toggleDarkMode
  };
};

export default useTheme;
