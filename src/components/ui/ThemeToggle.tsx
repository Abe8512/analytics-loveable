
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Lightbulb } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'minimal';
  className?: string;
}

const ThemeToggle = ({ variant = 'icon', className = '' }: ThemeToggleProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Icon variant - just the icon
  if (variant === 'icon') {
    return (
      <button
        aria-label="Toggle theme"
        onClick={toggleDarkMode}
        className={`relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDarkMode ? 'dark' : 'light'}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isDarkMode ? <Moon className="h-5 w-5 text-ai-blue" /> : <Sun className="h-5 w-5 text-ai-orange" />}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  // Pill variant - with text
  if (variant === 'pill') {
    return (
      <button
        aria-label="Toggle theme"
        onClick={toggleDarkMode}
        className={`relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          isDarkMode 
            ? 'bg-surface-dark-hover text-ai-blue' 
            : 'bg-surface-light-hover text-ai-orange'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDarkMode ? 'dark' : 'light'}
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {isDarkMode ? (
              <>
                <Moon className="h-4 w-4" /> <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" /> <span>Light</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  // Minimal variant - subtle design
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleDarkMode}
      className={`relative overflow-hidden rounded-md transition-colors ${
        isDarkMode 
          ? 'bg-surface-dark border border-white/5' 
          : 'bg-surface-light border border-gray-200/50'
      } ${className}`}
    >
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className={`px-2 py-1 ${!isDarkMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
          <Sun className="h-4 w-4" />
        </div>
        <div className={`px-2 py-1 ${isDarkMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
          <Moon className="h-4 w-4" />
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 h-0.5 bg-gradient-ai"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </button>
  );
};

export default ThemeToggle;
