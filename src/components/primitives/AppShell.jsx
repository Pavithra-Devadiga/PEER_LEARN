import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AvailabilityDrawer } from './AvailabilityDrawer';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export function AppShell() {
  const { mode, isAuthenticated, authBypass, toggleAuthBypass } = useModeTheme();
  const location = useLocation();
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  // If user is signed out and auth is NOT bypassed, show clean full-width layout
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

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Main Content Area */}
        <main
          key={location.pathname + mode}
          className="flex-1 min-w-0 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <Outlet context={{ openAvailabilityDrawer: () => setIsAvailabilityOpen(true) }} />
        </main>
      </div>

      {/* Tutor Availability Drawer */}
      <AvailabilityDrawer
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
      />

      {/* 🛠️ DEV TOOL: Auth Mode Indicator / Toggle Pill (bottom-right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleAuthBypass}
          title="Click to toggle Auth requirement on/off for development"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg border backdrop-blur-md transition-all duration-200 ${
            authBypass
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
          }`}
        >
          {authBypass ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Dev Mode: Auth Bypassed</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Dev Mode: Real Auth Active</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
