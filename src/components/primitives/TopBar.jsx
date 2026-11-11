import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { ModeToggle } from './ModeToggle';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';

export function TopBar() {
  const { mode, isAuthenticated } = useModeTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    !isAuthenticated &&
    (location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/reset-password');

  // Centered PeerLearn brand only on Login / Register pages (no top-right options, no divider line)
  if (isAuthPage) {
    return (
      <header className="w-full sticky top-0 z-40 backdrop-blur-md bg-app/70 transition-colors duration-200">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-center py-2.5 px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2 group select-none">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-text-main group-hover:opacity-90 transition-opacity">
              Peer<span className="text-accent transition-colors duration-200">Learn</span>
            </span>
          </Link>
        </div>
      </header>
    );
  }

  // Authenticated Workspace TopBar (no harsh bottom line)
  if (isAuthenticated) {
    return (
      <header className="w-full backdrop-blur-md bg-app/75 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 py-3 sm:py-4 px-3.5 sm:px-8">
          <Link to={`/${mode}/home`} className="flex items-center gap-1.5 group select-none shrink-0">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-text-main group-hover:opacity-90 transition-opacity">
              Peer<span className="text-accent transition-colors duration-200">Learn</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 bg-card/90 border border-border-pill rounded-full shadow-pill backdrop-blur-lg transition-all duration-200 shrink-0">
            <ModeToggle />
            <div className="w-[1px] h-4 sm:h-5 bg-border-subtle mx-0.5" />
            <ThemeToggle />
            <div className="w-[1px] h-4 sm:h-5 bg-border-subtle mx-0.5" />
            <ProfileMenu />
          </div>
        </div>
      </header>
    );
  }

  // Public Landing Page TopBar (matching reference: Brand left, clean links middle, pill CTA right, NO bottom border line)
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur-md bg-app/65 transition-colors duration-200">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2 py-4 sm:py-5 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 group select-none shrink-0">
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-text-main group-hover:opacity-90 transition-opacity">
            Peer<span className="text-accent transition-colors duration-200">Learn</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <a href="#features" className="hover:text-text-main transition-colors">
            Features
          </a>
          <a href="#about" className="hover:text-text-main transition-colors">
            How it works
          </a>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="hover:text-text-main transition-colors"
          >
            Sign in
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="md:hidden px-2.5 py-1.5 text-xs font-bold text-text-secondary hover:text-text-main transition-colors"
          >
            Sign in
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="px-3.5 sm:px-5 py-2 rounded-full bg-text-main text-app font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
