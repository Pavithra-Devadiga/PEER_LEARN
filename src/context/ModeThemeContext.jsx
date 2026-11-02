import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ModeThemeContext = createContext();

// ============================================================================
// ⚙️ DEV CONFIG: AUTH BYPASS SWITCH
// When false, real Supabase authentication is active!
// If you want to temporarily skip login during dev without credentials,
// you can click the floating pill at bottom-right or call window.__toggleAuthBypass()
// ============================================================================
const DEFAULT_BYPASS_AUTH = false;

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

  // Auth Bypass Switch (persisted in localStorage so you can toggle it in browser anytime)
  const [authBypass, setAuthBypassState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_auth_bypass');
    return saved !== null ? saved === 'true' : DEFAULT_BYPASS_AUTH;
  });

  // User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('peerlearn_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return { signedIn: false };
  });

  const [authLoading, setAuthLoading] = useState(true);

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
    if (user) {
      localStorage.setItem('peerlearn_user', JSON.stringify(user));
    }
  }, [user]);

  // Helper to format Supabase user into app user model
  const formatUser = (sbUser) => {
    if (!sbUser) return { signedIn: false };
    const fullName = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    return {
      id: sbUser.id,
      email: sbUser.email,
      name: fullName,
      avatar: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      initials: fullName.charAt(0).toUpperCase(),
      signedIn: true,
    };
  };

  // Restore session from Supabase on initial load
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          if (session?.user) {
            setUser(formatUser(session.user));
          } else if (!authBypass) {
            setUser({ signedIn: false });
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    checkSession();

    // Listen to real-time auth events (token refresh, sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(formatUser(session.user));
        } else if (!authBypass) {
          setUser({ signedIn: false });
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [authBypass]);

  // Expose handy console helper for you and your team:
  useEffect(() => {
    window.__toggleAuthBypass = () => {
      setAuthBypassState((prev) => {
        const next = !prev;
        if (next && (!user || !user.signedIn)) {
          // Provide demo user when activating bypass
          setUser({
            id: 'demo-user',
            name: 'Hannah',
            email: 'hannah.student@university.edu',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            initials: 'H',
            signedIn: true,
          });
        }
        console.log(`[PeerLearn Auth] Bypass mode is now: ${next ? 'ENABLED (Always logged in)' : 'DISABLED (Real Supabase Auth enforced)'}`);
        return next;
      });
    };
  }, [user]);

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
    setAuthBypassState((prev) => {
      const next = !prev;
      if (next && (!user || !user.signedIn)) {
        setUser({
          id: 'demo-user',
          name: 'Hannah',
          email: 'hannah.student@university.edu',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          initials: 'H',
          signedIn: true,
        });
      }
      return next;
    });
  };

  // Real Supabase sign in
  const signIn = async (credentials) => {
    if (credentials?.email && credentials?.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      if (data?.user) {
        setUser(formatUser(data.user));
      }
      navigate(`/${mode}/home`);
      return data;
    }

    // Demo fallback if called without credentials
    const fallbackUser = {
      id: 'demo-user',
      name: 'Hannah',
      email: 'hannah.student@university.edu',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      initials: 'H',
      signedIn: true,
    };
    setUser(fallbackUser);
    navigate(`/${mode}/home`);
  };

  // Real Supabase sign up
  const signUp = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
    if (data?.user && data?.session) {
      setUser(formatUser(data.user));
      navigate(`/${mode}/home`);
    }
    return data;
  };

  // Real Supabase sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error:', e);
    }
    setAuthBypassState(false);
    setUser({ signedIn: false });
    localStorage.removeItem('peerlearn_user');
    navigate('/');
  };

  // Effective authenticated status (True if bypass is enabled OR if user is signed in)
  const isAuthenticated = authBypass || Boolean(user?.signedIn);

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
        authLoading,
        signOut,
        signIn,
        signUp,
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
