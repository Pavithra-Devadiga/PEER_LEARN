import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useModeTheme } from '../../context/ModeThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useModeTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={`p-1.5 sm:p-2 rounded-full text-text-secondary hover:text-text-main hover:bg-card-hover border border-transparent hover:border-border-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45 text-amber-400" />
      )}
    </button>
  );
}
