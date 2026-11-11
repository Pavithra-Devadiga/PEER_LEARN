import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest, getAuthToken, setAuthToken } from '../lib/api';

const ModeThemeContext = createContext();

export function ModeThemeProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_mode');
    if (saved === 'student' || saved === 'tutor') return saved;
    if (window.location.pathname.startsWith('/tutor')) return 'tutor';
    return 'student';
  });

  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('peerlearn_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [user, setUser] = useState(() => {
    const token = getAuthToken();
    const savedUser = localStorage.getItem('peerlearn_user');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return { signedIn: false };
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [badges, setBadges] = useState({ studentPendingCount: 0, tutorPendingCount: 0 });

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem('peerlearn_mode', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('peerlearn_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user && user.signedIn) {
      localStorage.setItem('peerlearn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('peerlearn_user');
    }
  }, [user]);

  const refreshBadges = useCallback(async () => {
    if (!getAuthToken()) return;
    try {
      const data = await apiRequest('/api/dashboard/badges');
      if (data) setBadges(data);
    } catch {
      // ignore background badge refresh errors
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getAuthToken()) return null;
    const profile = await apiRequest('/api/auth/me');
    if (profile) {
      setUser(profile);
    }
    return profile;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const token = getAuthToken();
      if (!token) {
        if (mounted) {
          setUser({ signedIn: false });
          setAuthLoading(false);
        }
        return;
      }

      try {
        const profile = await apiRequest('/api/auth/me');
        if (mounted && profile) {
          setUser(profile);
          refreshBadges();
        }
      } catch {
        if (mounted) {
          setAuthToken(null);
          setUser({ signedIn: false });
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    verifySession();

    const handleUnauthorized = () => {
      setAuthToken(null);
      localStorage.removeItem('peerlearn_user');
      setUser({ signedIn: false });
      setBadges({ studentPendingCount: 0, tutorPendingCount: 0 });
    };

    const handleStorageSync = (e) => {
      if (e.key === 'peerlearn_token') {
        if (!e.newValue) {
          setUser({ signedIn: false });
          setBadges({ studentPendingCount: 0, tutorPendingCount: 0 });
        } else {
          verifySession();
        }
      } else if (e.key === 'peerlearn_user' && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          // ignore parse error
        }
      }
    };

    window.addEventListener('peerlearn:unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorageSync);
    return () => {
      mounted = false;
      window.removeEventListener('peerlearn:unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [refreshBadges]);

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

  const applyAuthSession = useCallback((token, userProfile) => {
    if (token) {
      setAuthToken(token);
    }
    if (userProfile) {
      localStorage.setItem('peerlearn_user', JSON.stringify(userProfile));
      setUser(userProfile);
    }
  }, []);

  const signIn = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data?.token && data?.user) {
      applyAuthSession(data.token, data.user);
      refreshBadges();
      navigate(`/${mode}/home`);
    }
    return data;
  };

  const signInDemo = async () => {
    const data = await apiRequest('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (data?.token && data?.user) {
      applyAuthSession(data.token, data.user);
      refreshBadges();
      navigate(`/${mode}/home`);
    }
    return data;
  };

  const signUp = async ({ name, email, password }) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data?.token && data?.user) {
      applyAuthSession(data.token, data.user);
      refreshBadges();
      navigate(`/${mode}/home`);
      return { ...data, session: true };
    }
    return data;
  };

  const updateProfile = async (payload) => {
    const data = await apiRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    applyAuthSession(data?.token, data?.user);
    return data;
  };

  const signOut = async () => {
    try {
      if (getAuthToken()) {
        await apiRequest('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      // still clear client session even if server unreachable
    }
    setAuthToken(null);
    setUser({ signedIn: false });
    setBadges({ studentPendingCount: 0, tutorPendingCount: 0 });
    localStorage.removeItem('peerlearn_user');
    navigate('/');
  };

  const isAuthenticated = Boolean(user?.signedIn);

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
        authLoading,
        badges,
        refreshBadges,
        refreshProfile,
        signOut,
        signIn,
        signInDemo,
        signUp,
        updateProfile,
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
