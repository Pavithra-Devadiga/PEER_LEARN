import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ModeThemeContext = createContext();

// ============================================================================
// ⚙️ DEV CONFIG: AUTH BYPASS SWITCH
// When true, you and your team will NEVER be asked to log in while developing.
// Set to false when you want to test real auth flows (login/register/protected routes).
// You can also toggle this dynamically from the browser console with:
//   window.__toggleAuthBypass()
// ============================================================================
const DEFAULT_BYPASS_AUTH = true;

export function ModeThemeProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'student' | 'tutor'
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_mode');
    if (saved === 'student' || saved === 'tutor') return saved;
    if (window.location.pathname.startsWith('/tutor')) return 'tutor';
    return 'student';
  });

  // Theme: 'light' | 'dark'
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Auth Bypass Switch (persisted in localStorage so you can toggle it in the browser anytime)
  const [authBypass, setAuthBypassState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_auth_bypass');
    return saved !== null ? saved === 'true' : DEFAULT_BYPASS_AUTH;
  });

  // Default Mock / Demo user
  const demoUser = {
    id: 'user-demo-1',
    name: 'Hannah',
    email: 'hannah.student@university.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    initials: 'H',
    signedIn: true,
  };

  // User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('peerlearn_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return demoUser;
  });

  // Effective authenticated status (True if bypass is enabled OR if user is signed in)
  const isAuthenticated = authBypass || Boolean(user?.signedIn);

  // Sync mode to DOM
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem('peerlearn_mode', mode);
  }, [mode]);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('peerlearn_theme', theme);
  }, [theme]);

  // Sync user & authBypass
  useEffect(() => {
    localStorage.setItem('peerlearn_auth_bypass', String(authBypass));
  }, [authBypass]);

  useEffect(() => {
    localStorage.setItem('peerlearn_user', JSON.stringify(user));
  }, [user]);

  // Expose handy console helper for you and your team:
  useEffect(() => {
    window.__toggleAuthBypass = () => {
      setAuthBypassState((prev) => {
        const next = !prev;
        console.log(`[PeerLearn Auth] Bypass mode is now: ${next ? 'ENABLED (Always logged in)' : 'DISABLED (Real auth enforced)'}`);
        return next;
      });
    };
  }, []);

  // Mode-prefixed route guardian
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/student') && mode !== 'student') {
      setModeState('student');
    } else if (path.startsWith('/tutor') && mode !== 'tutor') {
      setModeState('tutor');
    }
  }, [location.pathname, mode]);

  const setMode = (newMode) => {
    if (newMode === mode) return;
    setModeState(newMode);
    navigate(`/${newMode}/home`);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleAuthBypass = () => {
    setAuthBypassState((prev) => !prev);
  };

  const signOut = () => {
    // When signing out, if auth bypass was on, turn it off so you can see the landing/login page
    setAuthBypassState(false);
    setUser((prev) => ({ ...prev, signedIn: false }));
    navigate('/');
  };

  const signIn = (credentials) => {
    const loggedUser = {
      id: 'user-demo-1',
      name: credentials?.email?.split('@')[0] || 'Hannah',
      email: credentials?.email || 'hannah.student@university.edu',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      initials: 'H',
      signedIn: true,
    };
    setUser(loggedUser);
    navigate(`/${mode}/home`);
  };

  return (
    <ModeThemeContext.Provider
      value={{
        mode,
        setMode,
        theme,
        toggleTheme,
        user,
        setUser,
        isAuthenticated,
        authBypass,
        toggleAuthBypass,
        signOut,
        signIn,
      }}
    >
      {children}
    </ModeThemeContext.Provider>
  );
}

export function useModeTheme() {
  const context = useContext(ModeThemeContext);
  if (!context) {
    throw new Error('useModeTheme must be used within a ModeThemeProvider');
  }
  return context;
}
