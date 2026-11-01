import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useModeTheme } from '../../context/ModeThemeContext';

export function ProfileMenu({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useModeTheme();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-card-hover border border-transparent hover:border-border-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-border-subtle shadow-sm"
        />
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-text-main' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl border border-border-subtle shadow-popover p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border-subtle mb-1">
            <p className="text-sm font-semibold text-text-main">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>

          <button
            onClick={handleNavigateProfile}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-main hover:bg-card-muted rounded-xl transition-colors duration-150 text-left"
          >
            <User className="w-4 h-4 text-text-muted" />
            <span>My Profile</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors duration-150 text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
