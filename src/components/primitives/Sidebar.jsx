import React from 'react';
import { NavLink } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { Badge } from './Badge';

export function Sidebar({ className = '' }) {
  const { mode } = useModeTheme();

  const studentLinks = [
    { label: 'Home', path: '/student/home' },
    { label: 'Browse skills', path: '/student/browse' },
    { label: 'Tutors', path: '/student/tutors' },
    { label: 'My sessions', path: '/student/sessions', badge: '1' },
    { label: 'Learning', path: '/student/learning' },
  ];

  const tutorLinks = [
    { label: 'Home', path: '/tutor/home' },
    { label: 'My skills', path: '/tutor/skills' },
    { label: 'Requests', path: '/tutor/requests', badge: '3' },
    { label: 'My sessions', path: '/tutor/sessions' },
    { label: 'Contribute', path: '/tutor/contribute' },
    { label: 'Insights', path: '/tutor/insights' },
  ];

  const links = mode === 'student' ? studentLinks : tutorLinks;

  return (
    <aside
      className={`w-56 shrink-0 py-6 px-4 flex flex-col justify-between select-none ${className}`}
    >
      <nav className="flex flex-col gap-1.5" aria-label="Sidebar navigation">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : 'text-text-secondary hover:text-text-main hover:bg-card-muted/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'muted' : 'accent'}
                    className={isActive ? '!bg-white/20 !text-white !border-none' : ''}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
