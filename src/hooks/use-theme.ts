
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/App';

export function useTheme() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);
  
  // To avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return {
    isDark: mounted ? isDarkMode : false,
    toggleTheme: toggleDarkMode,
  };
}
