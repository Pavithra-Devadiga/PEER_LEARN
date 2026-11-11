import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';

export function LoginPage() {
  const { signIn, signInDemo } = useModeTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await signIn({ email, password });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setForgotSuccess('');
    setForgotSending(true);

    try {
      const res = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      const msg =
        res?.message ||
        'If an account exists for that email, a password reset link has been generated.';
      setForgotSuccess(msg);
      showToast('Password reset request recorded.', 'info');
    } catch (err) {
      setErrorMessage(err.message || 'Could not process password reset request.');
    } finally {
      setForgotSending(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await signInDemo();
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-4">
      <div className="relative max-w-[800px] w-full">
        {/* Decorative Floating Circles */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -top-3 -left-3 w-12 h-12 rounded-full bg-accent/20 blur-[1px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-4 -right-4 w-14 h-14 rounded-full bg-accent/15 blur-[1px] pointer-events-none"
        />

        {/* Split-Screen Auth Card */}
        <div className="relative bg-card rounded-3xl shadow-card border border-border-card overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
          {/* Left Panel: PeerLearn Photo & Editorial Overlay */}
          <div className="relative min-h-[180px] md:min-h-full overflow-hidden flex flex-col justify-between p-6 text-center bg-gradient-to-br from-indigo-600 via-violet-700 to-emerald-600">
            <img
              src="/images/auth-hero.jpg"
              alt="Students collaborating on PeerLearn"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-indigo-950/35 to-slate-950/55"
            />

            <div className="relative z-10 pt-1">
              <div className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                <span>PeerLearn</span>
              </div>
              <p className="text-xs text-white/90 max-w-[230px] mx-auto leading-relaxed mt-1.5 font-medium drop-shadow-sm">
                Knowledge is the only asset that multiplies when shared with peers.
              </p>
            </div>

            <div className="relative z-10 hidden md:flex items-center justify-center gap-2 text-[11px] font-semibold text-white/85 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 mx-auto">
              <span>Learn one skill, teach another</span>
            </div>
          </div>

          {/* Right Panel: Sign In Form */}
          <div className="relative p-6 sm:p-7 flex flex-col justify-center bg-card overflow-hidden">
            {/* Top-Right Decorative Dashed Arc Motif */}
            <div aria-hidden="true" className="hidden sm:flex absolute top-3.5 right-5 items-center text-accent/55 pointer-events-none">
              <svg width="82" height="32" viewBox="0 0 110 44" fill="none">
                <path
                  d="M4 10C34 2 62 34 102 22"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </svg>
              <GraduationCap className="w-4 h-4 -ml-2 -mt-1 rotate-12" />
            </div>

            <div className="relative z-10 w-full max-w-[300px] mx-auto">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-accent tracking-tight">
                  Welcome
                </h1>
                <p className="text-xs text-text-muted font-medium mt-0.5">
                  Login with Email
                </p>
              </div>

              {errorMessage && (
                <div className="mb-3.5 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 overflow-hidden">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words min-w-0 flex-1">{errorMessage}</span>
                </div>
              )}

              {forgotMode ? (
                <div className="space-y-3.5">
                  {forgotSuccess && (
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span className="break-words">{forgotSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                    <div className="relative">
                      <label
                        htmlFor="forgot-email"
                        className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                      >
                        Account Email
                      </label>
                      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                        <Mail className="w-4 h-4 text-text-muted shrink-0" />
                        <input
                          id="forgot-email"
                          type="email"
                          placeholder="you@university.edu"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="submit"
                        disabled={forgotSending}
                        className="w-full py-2.5 rounded-2xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {forgotSending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(false);
                          setErrorMessage('');
                          setForgotSuccess('');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted hover:text-accent transition-colors pt-0.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Floating-Label Email Input */}
                  <div className="relative">
                    <label
                      htmlFor="login-email"
                      className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                    >
                      Email Id
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                      <Mail className="w-4 h-4 text-text-muted shrink-0" />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                        required
                      />
                    </div>
                  </div>

                  {/* Floating-Label Password Input */}
                  <div className="relative">
                    <label
                      htmlFor="login-password"
                      className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                    >
                      Password
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                      <Lock className="w-4 h-4 text-text-muted shrink-0" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="text-text-muted hover:text-text-main transition-colors shrink-0"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotSuccess('');
                        setErrorMessage('');
                        setForgotMode(true);
                      }}
                      className="text-[11px] font-medium text-text-muted hover:text-accent transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-40 py-2.5 rounded-2xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center text-xs text-text-secondary mt-5">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-accent font-bold hover:underline">
                  Register Now
                </Link>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="text-[11px] font-semibold text-text-muted hover:text-accent transition-colors underline underline-offset-4 disabled:opacity-50"
                >
                  Presenting? Sign in with Demo Account (Hannah)
                </button>
              </div>
            </div>

            {/* Bottom Corner Academic Silhouette Accent */}
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute bottom-0 left-3 text-accent/15 pointer-events-none"
              width="92"
              height="48"
              viewBox="0 0 92 48"
              fill="currentColor"
            >
              <rect x="6" y="22" width="14" height="26" rx="2" />
              <rect x="24" y="10" width="22" height="38" rx="2" />
              <path d="M35 2L48 10H22L35 2Z" />
              <rect x="50" y="26" width="16" height="22" rx="2" />
            </svg>
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute bottom-0 right-3 text-accent/15 pointer-events-none"
              width="86"
              height="46"
              viewBox="0 0 86 46"
              fill="currentColor"
            >
              <rect x="10" y="18" width="18" height="28" rx="2" />
              <rect x="32" y="8" width="20" height="38" rx="2" />
              <circle cx="42" cy="18" r="3" fill="var(--color-bg-card)" />
              <rect x="56" y="24" width="18" height="22" rx="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
