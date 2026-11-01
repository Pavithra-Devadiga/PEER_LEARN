import React from 'react';

export function PillButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-accent text-white shadow-sm hover:opacity-95 hover:shadow-card',
    secondary:
      'bg-card-muted text-text-main border border-border-subtle hover:bg-card-hover shadow-sm',
    pill:
      'bg-pill text-text-main border border-border-pill hover:bg-pill-hover shadow-pill',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-main hover:bg-card-muted',
    accentGhost:
      'bg-accent-muted text-accent hover:opacity-90',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
