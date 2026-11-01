import React, { useState } from 'react';
import { PillButton } from '../../components/primitives/PillButton';
import { Card } from '../../components/primitives/Card';
import { useModeTheme } from '../../context/ModeThemeContext';
import { Check, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser } = useModeTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setUser((prev) => ({ ...prev, name, email }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-6 bg-card rounded-3xl border border-border-card shadow-card">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-accent"
        />
        <div>
          <h1 className="text-2xl font-bold text-text-main">{user.name}</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 font-bold">
              Student Active
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
              Tutor Active
            </span>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-text-main mb-6">Profile Details & Security</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" /> Change Password
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  placeholder="••••••••"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <PillButton type="submit" variant="primary">
              {saved ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved Changes
                </span>
              ) : (
                'Save Changes'
              )}
            </PillButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
