import React from 'react';

export function TintedCard({
  title,
  subtitle,
  category,
  tutorCount,
  icon: Icon,
  tint = 'violet',
  onClick,
  className = '',
  actionLabel = 'Explore Tutors',
}) {
  const tintMap = {
    violet: {
      bg: 'bg-indigo-50/60 dark:bg-indigo-950/20',
      border: 'border-indigo-100 dark:border-indigo-900/30',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    },
    blue: {
      bg: 'bg-sky-50/60 dark:bg-sky-950/20',
      border: 'border-sky-100 dark:border-sky-900/30',
      iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
      badge: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    },
    green: {
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    },
    yellow: {
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      border: 'border-amber-100 dark:border-amber-900/30',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    },
    peach: {
      bg: 'bg-rose-50/60 dark:bg-rose-950/20',
      border: 'border-rose-100 dark:border-rose-900/30',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    },
  };

  const style = tintMap[tint] || tintMap.violet;

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-5 border ${style.bg} ${style.border} shadow-card transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          {Icon ? (
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${style.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          ) : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
              {category || 'Skill'}
            </span>
          )}

          {tutorCount !== undefined && (
            <span className="text-xs font-semibold text-text-muted">
              {tutorCount} {tutorCount === 1 ? 'tutor' : 'tutors'}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-text-main mb-1 tracking-tight">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-subtle/40">
        <span className="text-xs font-semibold text-accent flex items-center gap-1 group">
          {actionLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </div>
  );
}
