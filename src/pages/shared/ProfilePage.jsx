import React, { useState, useEffect, useCallback } from 'react';
import { PillButton } from '../../components/primitives/PillButton';
import { Card } from '../../components/primitives/Card';
import { useModeTheme } from '../../context/ModeThemeContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api';
import {
  Check,
  Shield,
  AlertCircle,
  User,
  Calendar,
  BookOpen,
  Award,
  Star,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Monitor,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile, refreshProfile, theme, toggleTheme, mode, setMode, signOut } = useModeTheme();
  const { showToast } = useToast();

  // Personal Profile State
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [title, setTitle] = useState(user.title || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loginSessions, setLoginSessions] = useState([]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiRequest('/api/auth/sessions');
      if (Array.isArray(data)) setLoginSessions(data);
    } catch {
      // ignore gracefully
    }
  }, []);

  useEffect(() => {
    refreshProfile().catch(() => {});
    loadSessions();
  }, [refreshProfile, loadSessions]);

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setTitle(user.title || '');
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
  }, [user]);

  const avatarPresets = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Peer')}`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name || 'Peer')}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name || 'Peer')}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || 'Peer')}`,
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaving(true);
    try {
      await updateProfile({ name, email, title, bio, avatar });
      setProfileSaved(true);
      showToast('Profile settings saved!', 'success');
      loadSessions();
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      const msg = err.message || 'Failed to update profile.';
      setProfileError(msg);
      showToast(msg, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if ((user.hasPassword !== false && !currentPassword) || !newPassword) {
      setPasswordError('Please fill in the required password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      showToast('Password updated successfully!', 'success');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setPasswordError(msg);
      showToast(msg, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await apiRequest(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' });
      showToast('Session revoked.', 'info');
      loadSessions();
    } catch (err) {
      showToast(err.message || 'Could not revoke session.', 'error');
    }
  };

  const stats = user.stats || {
    sessionsLearned: 0,
    sessionsTaught: 0,
    skillsCount: 0,
    avgRating: '—',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Account &amp; Profile
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage your public tutor bio, personal account details, and security preferences.
        </p>
      </div>

      {/* 1. Profile Hero Summary Card */}
      <Card padding="p-5 sm:p-8" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <img
              src={avatar || user.avatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-accent shadow-sm bg-card-muted shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight truncate">
                {user.name}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">
                {user.title || 'Student & Peer Learner'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-muted">
                <span className="break-all">{user.email}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {user.memberSince || '2026'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
              Student Active
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              Tutor Active
            </span>
          </div>
        </div>

        {/* Account Activity Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border-subtle/70">
          <div className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Sessions Learned</span>
            </div>
            <div className="text-xl font-extrabold text-text-main">{stats.sessionsLearned}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sessions Taught</span>
            </div>
            <div className="text-xl font-extrabold text-text-main">{stats.sessionsTaught}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Skills Listed</span>
            </div>
            <div className="text-xl font-extrabold text-text-main">{stats.skillsCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Tutor Rating</span>
            </div>
            <div className="text-xl font-extrabold text-text-main">{stats.avgRating}</div>
          </div>
        </div>
      </Card>

      {/* 2. Personal Information & Public Tutor Bio */}
      <Card padding="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-lg font-bold text-text-main">Personal Information &amp; Public Bio</h3>
            <p className="text-xs text-text-muted">
              This information appears on your profile and when students browse you as a tutor.
            </p>
          </div>
        </div>

        {profileError && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Academic Headline / Title
            </label>
            <input
              type="text"
              placeholder="e.g. CS Junior • React & PostgreSQL Mentor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              About Me / Teaching Bio
            </label>
            <textarea
              rows={3}
              placeholder="Share what you are studying, skills you love teaching, or your learning goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main resize-none"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Avatar URL or Quick Preset
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-xs font-medium text-text-main"
              />
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                {avatarPresets.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(presetUrl)}
                    title="Use preset avatar"
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                      avatar === presetUrl ? 'border-accent scale-105' : 'border-border-subtle hover:border-accent/50'
                    }`}
                  >
                    <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <PillButton type="submit" variant="primary" disabled={profileSaving}>
              {profileSaved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Profile Saved
                </span>
              ) : profileSaving ? (
                'Saving...'
              ) : (
                'Save Profile'
              )}
            </PillButton>
          </div>
        </form>
      </Card>

      {/* 3. Security & Password + Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="p-6 sm:p-8" className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-lg font-bold text-text-main">Password &amp; Security</h3>
              <p className="text-xs text-text-muted">Update your password to keep your account secure.</p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {user.hasPassword !== false && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  placeholder="••••••••"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  placeholder="Min 6 characters"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  placeholder="Re-enter new password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <PillButton type="submit" variant="secondary" disabled={passwordSaving}>
                {passwordSaved ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> Password Updated
                  </span>
                ) : passwordSaving ? (
                  'Updating...'
                ) : (
                  'Update Password'
                )}
              </PillButton>
            </div>
          </form>
        </Card>

        {/* Preferences & Account Card */}
        <Card padding="p-6 sm:p-8" className="flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-text-main">Preferences</h3>

            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                Appearance
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-card-muted border border-border-subtle hover:bg-card-hover text-sm font-semibold text-text-main transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-xs text-accent font-bold">Switch</span>
              </button>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                Active Role Workspace
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('student')}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    mode === 'student'
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-card-muted text-text-secondary border-border-subtle hover:bg-card-hover'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setMode('tutor')}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    mode === 'tutor'
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-card-muted text-text-secondary border-border-subtle hover:bg-card-hover'
                  }`}
                >
                  Tutor
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <PillButton
              variant="ghost"
              icon={LogOut}
              onClick={signOut}
              className="w-full text-rose-500 hover:bg-rose-500/10"
            >
              Sign Out of Account
            </PillButton>
          </div>
        </Card>
      </div>

      {/* 4. Login Activity & Active Sessions (Stored in PostgreSQL user_sessions) */}
      <Card padding="p-6 sm:p-8" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-lg font-bold text-text-main">Login Activity &amp; Active Session</h3>
              <p className="text-xs text-text-muted">
                Authenticated securely via stateless Bearer JWT with HMAC-SHA256 signature verification.
              </p>
            </div>
          </div>
        </div>

        {loginSessions.length === 0 ? (
          <p className="text-xs text-text-muted">No session history found.</p>
        ) : (
          <div className="space-y-3">
            {loginSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card-muted/50 border border-border-subtle/70 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-text-main">{sess.device}</span>
                    <span className="px-2 py-0.5 rounded-full bg-card border border-border-subtle font-bold text-[10px] text-text-secondary">
                      {sess.authMethod}
                    </span>
                    {sess.isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        Current Session
                      </span>
                    ) : sess.active ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-card text-text-muted font-semibold text-[10px]">
                        Signed Out / Revoked
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted">
                    IP: {sess.ipAddress} • Signed in {sess.loggedInAt}
                  </p>
                </div>

                {sess.active && !sess.isCurrent && (
                  <PillButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-rose-500 hover:bg-rose-500/10 self-start sm:self-center"
                  >
                    Revoke
                  </PillButton>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
