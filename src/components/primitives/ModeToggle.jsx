import React from 'react';
import { useModeTheme } from '../../context/ModeThemeContext';

export function ModeToggle({ className = '' }) {
  const { mode, setMode } = useModeTheme();

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setMode(mode === 'student' ? 'tutor' : 'student');
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Mode selector"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center p-1 rounded-full bg-card-muted/80 backdrop-blur-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
    >
      <button
        role="tab"
        aria-selected={mode === 'student'}
        onClick={() => setMode('student')}
        className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-sm font-semibold rounded-full transition-all duration-200 ${
          mode === 'student'
            ? 'bg-accent text-white shadow-sm'
            : 'text-text-secondary hover:text-text-main'
        }`}
      >
        Student
      </button>

      <button
        role="tab"
        aria-selected={mode === 'tutor'}
        onClick={() => setMode('tutor')}
        className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-sm font-semibold rounded-full transition-all duration-200 ${
          mode === 'tutor'
            ? 'bg-accent text-white shadow-sm'
            : 'text-text-secondary hover:text-text-main'
        }`}
      >
        Tutor
      </button>
    </div>
  );
}
