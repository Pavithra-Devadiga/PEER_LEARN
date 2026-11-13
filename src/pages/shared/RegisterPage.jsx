import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModeTheme } from '../../context/ModeThemeContext';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, Loader2, Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';

export function RegisterPage() {
  const { signUp } = useModeTheme();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password });
      showToast('Account created successfully! Welcome to PeerLearn.', 'success', 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
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

        {/* Split-Screen Register Card */}
        <div className="relative bg-card rounded-3xl shadow-card border border-border-card overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[440px]">
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
                One account to learn new skills and mentor fellow students across campus.
              </p>
            </div>

            <div className="relative z-10 hidden md:flex items-center justify-center gap-2 text-[11px] font-semibold text-white/85 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 mx-auto">
              <span>Zero admin friction • Student-to-Student</span>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="relative p-5 sm:p-7 flex flex-col justify-center bg-card overflow-hidden">
            {/* Top-Right Decorative Dashed Arc */}
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
              <div className="text-center mb-3.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-accent tracking-tight">
                  Create Account
                </h1>
                <p className="text-xs text-text-muted font-medium mt-0.5">
                  Join PeerLearn with your university email
                </p>
              </div>

              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 overflow-hidden">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words min-w-0 flex-1">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name */}
                <div className="relative">
                  <label
                    htmlFor="reg-name"
                    className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                  >
                    Full Name
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                    <User className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Pavithra Devadiga"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="reg-email"
                    className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                  >
                    Email
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label
                    htmlFor="reg-password"
                    className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                  >
                    Password
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                    <Lock className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                      required
                      minLength={6}
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

                {/* Confirm Password */}
                <div className="relative">
                  <label
                    htmlFor="reg-confirm"
                    className="absolute -top-2 left-3.5 px-1.5 bg-card text-[10px] font-bold text-accent z-10"
                  >
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 bg-card transition-all">
                    <Lock className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60 focus:outline-none min-w-0"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-0.5 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-44 py-2.5 rounded-2xl bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center text-xs text-text-secondary mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
