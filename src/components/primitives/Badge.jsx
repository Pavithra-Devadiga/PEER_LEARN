import React from 'react';

export function Badge({ children, variant = 'accent', className = '' }) {
  const variantStyles = {
    accent: 'bg-accent text-white',
    muted: 'bg-card-muted text-text-secondary border border-border-subtle',
    green: 'bg-emerald-500 text-white',
    violet: 'bg-indigo-500 text-white',
    amber: 'bg-amber-500 text-white',
    outline: 'border border-accent text-accent',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-full shadow-sm transition-all duration-200 ${
        variantStyles[variant] || variantStyles.accent
      } ${className}`}
    >
      {children}
    </span>
  );
}
