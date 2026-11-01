import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { ModeToggle } from './ModeToggle';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';
import { PillButton } from './PillButton';

export function TopBar() {
  const { mode, isAuthenticated } = useModeTheme();
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between py-4 px-6 sm:px-8 border-b border-border-subtle/60 backdrop-blur-md bg-app/80 sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Logo */}
      <Link
        to={isAuthenticated ? `/${mode}/home` : '/'}
        className="flex items-center gap-2 group select-none"
      >
        <span className="font-extrabold text-2xl tracking-tight text-text-main group-hover:opacity-90 transition-opacity">
          Peer<span className="text-accent transition-colors duration-200">Learn</span>
        </span>
      </Link>

      {/* Right: In ONE soft pill group */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-card/90 border border-border-pill rounded-full shadow-pill backdrop-blur-lg transition-all duration-200">
        {isAuthenticated ? (
          <>
            {/* (1) Mode toggle */}
            <ModeToggle />

            {/* Separator */}
            <div className="w-[1px] h-5 bg-border-subtle mx-0.5" />

            {/* (2) Theme toggle */}
            <ThemeToggle />

            {/* Separator */}
            <div className="w-[1px] h-5 bg-border-subtle mx-0.5" />

            {/* (3) Profile Menu */}
            <ProfileMenu />
          </>
        ) : (
          <>
            <ThemeToggle />
            <div className="w-[1px] h-5 bg-border-subtle mx-1" />
            <PillButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </PillButton>
            <PillButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
            >
              Register
            </PillButton>
          </>
        )}
      </div>
    </header>
  );
}
