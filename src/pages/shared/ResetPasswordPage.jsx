import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, GraduationCap, KeyRound, Loader2, Lock } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing from the link.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      const msg = res?.message || 'Password updated successfully. You can now sign in.';
      setSuccessMessage(msg);
      showToast(msg, 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-card border border-border-card rounded-3xl shadow-popover p-7 sm:p-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="hidden sm:flex absolute top-4 right-5 items-center text-accent/55 pointer-events-none"
        >
          <GraduationCap className="w-5 h-5 rotate-12" />
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-muted text-accent flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-main tracking-tight">Set New Password</h1>
          <p className="text-xs text-text-muted font-medium mt-1">
            Choose a strong password (minimum 6 characters) for your PeerLearn account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-2xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Continue to Sign In
            </Link>
          </div>
        ) : !token ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-medium">
              No reset token was found in this URL. Please request a fresh password reset link from the sign-in page.
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label
                htmlFor="reset-new-password"
                className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
              >
                New Password
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                <Lock className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-text-muted hover:text-text-main transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="reset-confirm-password"
                className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
              >
                Confirm Password
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                <Lock className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>

            <div className="text-center pt-1">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
