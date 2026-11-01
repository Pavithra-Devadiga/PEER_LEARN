import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PillButton } from '../../components/primitives/PillButton';
import { Card } from '../../components/primitives/Card';
import { useModeTheme } from '../../context/ModeThemeContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn, mode } = useModeTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn();
    navigate(`/${mode}/home`);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-text-main mb-2">Create Account</h1>
          <p className="text-sm text-text-secondary">Join PeerLearn to learn & teach simultaneously</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Hannah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              University Email
            </label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm font-medium text-text-main"
              required
            />
          </div>

          <PillButton type="submit" variant="primary" size="lg" className="w-full mt-6">
            Create Account
          </PillButton>
        </form>

        <div className="text-center mt-6 text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
