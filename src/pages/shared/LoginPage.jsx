import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PillButton } from '../../components/primitives/PillButton';
import { Card } from '../../components/primitives/Card';
import { useModeTheme } from '../../context/ModeThemeContext';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, mode } = useModeTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await signIn({ email, password });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-card border border-border-card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-text-main mb-2">Welcome Back</h1>
          <p className="text-sm text-text-secondary">Sign in to your PeerLearn account</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@university.edu"
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

          <PillButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </PillButton>
        </form>

        <div className="text-center mt-6 text-xs text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-bold hover:underline">
            Register now
          </Link>
        </div>
      </Card>
    </div>
  );
}
