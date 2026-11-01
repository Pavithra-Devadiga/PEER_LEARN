import React from 'react';

export function StatCard({ value, label, hint, className = '' }) {
  return (
    <div
      className={`bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border-subtle/80 shadow-card flex flex-col justify-center transition-all duration-200 hover:shadow-card-hover hover:border-border-subtle ${className}`}
    >
      <div className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-none mb-1.5">
        {value}
      </div>
      <div className="text-xs font-semibold text-text-muted leading-tight">
        {label}
      </div>
      {hint && (
        <div className="text-[11px] text-text-subtle/60 mt-1 hidden sm:block truncate">
          {hint}
        </div>
      )}
    </div>
  );
}
