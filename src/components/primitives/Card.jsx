import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-3xl border border-border-card/80 shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card-hover hover:border-border-subtle/80 cursor-pointer' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
