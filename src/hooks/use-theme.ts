
import { useContext } from 'react';
import { ThemeContext } from '@/App';

export const useTheme = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  return {
    isDark: isDarkMode,
    toggleTheme,
  };
};
