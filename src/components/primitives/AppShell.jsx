import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AvailabilityDrawer } from './AvailabilityDrawer';

export function AppShell() {
  const { mode, isAuthenticated, badges } = useModeTheme();
  const location = useLocation();
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  const mobileLinks = mode === 'student'
    ? [
        { label: 'Home', path: '/student/home' },
        { label: 'Browse', path: '/student/browse' },
        { label: 'Tutors', path: '/student/tutors' },
        { label: 'Sessions', path: '/student/sessions', count: badges?.studentPendingCount },
        { label: 'Learning', path: '/student/learning' },
      ]
    : [
        { label: 'Home', path: '/tutor/home' },
        { label: 'Skills', path: '/tutor/skills' },
        { label: 'Requests', path: '/tutor/requests', count: badges?.tutorPendingCount },
        { label: 'Sessions', path: '/tutor/sessions' },
        { label: 'Contribute', path: '/tutor/contribute' },
        { label: 'Insights', path: '/tutor/insights' },
      ];

  // Clean full-width layout for unauthenticated pages (Landing, Sign In, Register)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-app text-text-main transition-colors duration-200">
        <TopBar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-text-main transition-colors duration-200">
      <TopBar />

      {/* Mobile Navigation Bar (visible on small/tablet screens) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-b border-border-subtle/60 bg-app/80 backdrop-blur-md px-4 py-2.5 overflow-x-auto"
      >
        <div className="flex items-center gap-2 min-w-max">
          {mobileLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-card text-text-secondary border border-border-subtle'
                }`
              }
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-5 sm:py-8 gap-6 lg:gap-8">
        {/* Left Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Main Content Area */}
        <main
          key={location.pathname + mode}
          className="flex-1 min-w-0 pb-10 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <Outlet context={{ openAvailabilityDrawer: () => setIsAvailabilityOpen(true) }} />
        </main>
      </div>

      {/* Tutor Availability Drawer */}
      <AvailabilityDrawer
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
      />
    </div>
  );
}
