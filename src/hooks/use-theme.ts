
import { useContext } from 'react';
import { ThemeContext } from '@/App';

export function useTheme() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  
  return {
    isDark: isDarkMode,
    toggleTheme: toggleDarkMode
  };
}
