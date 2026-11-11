import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle2, Clock, Sparkles, BookOpen, Video, HelpCircle, Calendar, Check } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [interest, setInterest] = useState('');

  const handleQuickStart = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Airy Two-Column Editorial Hero (Seamless below borderless navbar) */}
      <section className="relative overflow-hidden">
        {/* Soft atmospheric background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.06] via-transparent to-transparent pointer-events-none"
        />

        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-8 pt-8 sm:pt-14 pb-10 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-10">
            {/* Left Column: Punchy Headline, Subtitle & Pill Input */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-6xl font-extrabold text-text-main tracking-tight leading-[1.1]">
                Learn together.
              </h1>

              <p className="text-base sm:text-lg text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
                PeerLearn is your campus skill-exchange platform for 1-on-1 mentoring, live checklists, and calmer collaborative study.
              </p>

              {/* Signature Pill Prompt Input + Arrow Button */}
              <form
                onSubmit={handleQuickStart}
                className="max-w-md mx-auto lg:mx-0 bg-card rounded-full p-1.5 pl-5 border border-border-pill shadow-pill flex items-center gap-2 focus-within:ring-2 focus-within:ring-accent/30 transition-all"
              >
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="What skill do you want to learn?"
                  className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  aria-label="Get started"
                  className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Clear Sign In / Register Options */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-bold text-accent hover:underline"
                >
                  Register to explore →
                </button>
                <span className="text-border-subtle">•</span>
                <span className="text-text-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-bold text-text-main hover:text-accent transition-colors underline underline-offset-4"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Editorial Visual */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-card-hover border border-border-card bg-gradient-to-br from-indigo-500/15 via-card to-emerald-500/15 aspect-[4/3]">
                <img
                  src="/images/auth-hero.jpg"
                  alt="College students mentoring and studying together"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover object-[center_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border-card shadow-sm text-xs">
                  <div className="flex items-center gap-2 font-bold text-text-main">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <span>One account to learn &amp; teach</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    Student ⇄ Tutor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Showcase Rows */}
      <section id="features" className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-muted text-accent text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Features
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Everything you need to learn &amp; teach
          </h2>
        </div>

        {/* Row 1: Visual Left, Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-7 md:gap-12">
          <div className="rounded-3xl overflow-hidden shadow-card border border-border-card bg-gradient-to-br from-indigo-100/80 via-amber-50/70 to-emerald-100/60 dark:from-indigo-950/40 dark:via-card dark:to-emerald-950/30 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {['Python', 'SQL', 'Figma'].map((skill, idx) => (
                  <span
                    key={skill}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border ${
                      idx === 0
                        ? 'bg-accent text-white border-accent'
                        : 'bg-card/90 text-text-secondary border-border-subtle'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-card/95 px-2.5 py-1 rounded-full shadow-sm border border-border-subtle">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 • 42 sessions
              </span>
            </div>

            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-border-subtle shadow-sm space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-muted text-accent font-extrabold text-xs flex items-center justify-center shrink-0 border border-accent/20">
                    SJ
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-text-main truncate">Sarah Jenkins</p>
                    <p className="text-[11px] text-text-muted truncate">Lead Python TA • Verified Tutor</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-accent bg-accent-muted px-2.5 py-1 rounded-full shrink-0">
                  ₹89 / hr
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                “Let&apos;s break down functions, recursion, and SQL joins with hands-on examples.”
              </p>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {['Functions', 'SQL Joins', 'Recursion'].map((topic) => (
                  <span
                    key={topic}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-card-muted text-text-secondary border border-border-subtle"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-card/85 border border-border-subtle text-[11px]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Next open slot: Tue 4:00 PM
              </span>
              <span className="font-bold text-accent">Request 1-on-1 →</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              Find the right peer tutor
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Browse skills taught by fellow students, inspect real peer ratings, affordable INR hourly rates, and open weekly slots, then request a 1-on-1 session focused on the exact topics you need.
            </p>
          </div>
        </div>

        {/* Row 2: Text Left, Visual Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-7 md:gap-12">
          <div className="space-y-3.5 order-2 md:order-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              Teach on your own schedule
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Flip into Tutor mode anytime using the same account. Set weekly availability slots, accept or decline incoming requests in one click, and let automatic clash prevention keep your calendar clean.
            </p>
          </div>

          <div className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-card border border-border-card bg-gradient-to-br from-sky-100/80 via-indigo-50/70 to-emerald-100/70 dark:from-sky-950/40 dark:via-card dark:to-emerald-950/30 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm border border-border-subtle">
                <Calendar className="w-3.5 h-3.5" /> Weekly Slots
              </span>
              <span className="text-[11px] font-semibold text-text-muted bg-card/95 px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
                Conflict-free • ₹69–₹149/hr
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {[
                { day: 'Tue', time: '4:00 PM', status: 'Booked', active: true },
                { day: 'Thu', time: '5:30 PM', status: 'Open', active: false },
                { day: 'Fri', time: '6:00 PM', status: 'Open', active: false },
              ].map((slot) => (
                <div
                  key={slot.day}
                  className={`p-2.5 sm:p-3 rounded-2xl text-center border shadow-sm ${
                    slot.active
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-card/95 text-text-main border-border-subtle'
                  }`}
                >
                  <div className="text-xs font-extrabold">{slot.day}</div>
                  <div className="text-[10px] opacity-90 mt-0.5 font-medium">{slot.time}</div>
                  <div
                    className={`mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      slot.active ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {slot.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-3 border border-border-subtle shadow-sm flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-main truncate">New Request: Aarav M.</p>
                <p className="text-[11px] text-text-muted truncate">Python • Functions &amp; Recursion</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  <Check className="w-3 h-3" /> Accept
                </span>
                <span className="px-2.5 py-1 rounded-full bg-card-muted text-text-secondary text-[11px] font-semibold border border-border-subtle">
                  Later
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Visual Left, Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-7 md:gap-12">
          <div className="rounded-3xl overflow-hidden shadow-card border border-border-card bg-gradient-to-br from-amber-100/70 via-rose-50/60 to-indigo-100/70 dark:from-amber-950/30 dark:via-card dark:to-indigo-950/30 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 text-text-main text-xs font-bold shadow-sm border border-border-subtle">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> Live Checklist
              </span>
              <span className="text-xs font-extrabold text-accent bg-card/95 px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
                86% Mastery
              </span>
            </div>

            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-border-subtle shadow-sm space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-text-muted line-through">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Variables, Data Types &amp; Loops</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted line-through">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Lists, Dictionaries &amp; Error Handling</span>
              </div>
              <div className="flex items-center gap-2 text-text-main font-semibold">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Functions, Scope &amp; Recursion</span>
              </div>

              <div className="pt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-text-muted">
                  <span>Session Progress</span>
                  <span className="text-accent">2 / 3 covered</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-card-muted overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-accent" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/90 border border-border-subtle text-text-main">
                <Video className="w-3 h-3 text-emerald-500" /> Video Meet Link
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/90 border border-border-subtle text-text-main">
                <BookOpen className="w-3 h-3 text-accent" /> Study Guides
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/90 border border-border-subtle text-text-main">
                <HelpCircle className="w-3 h-3 text-amber-500" /> Post-Class Quiz
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              Make progress, steadily
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Collaborate with live session chat and instant meeting links, tick off curriculum topics together in real time, and reinforce weak areas with verified study guides and post-class topic quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Clear 3-Step "How It Works" Section */}
      <section id="about" className="max-w-5xl mx-auto w-full px-4 sm:px-8 pt-4 pb-10 sm:py-12">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            How it works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            From skill gap to mastery in 3 steps
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            One account lets you book help as a student and mentor classmates as a tutor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              step: '01',
              title: 'Choose a skill & slot',
              desc: 'Pick from peer-taught coding, design, language, or music skills, compare affordable INR rates, and request a free weekly time slot.',
              badge: 'Browse & Request',
            },
            {
              step: '02',
              title: 'Learn 1-on-1 live',
              desc: 'Once accepted, message directly in session chat, join via the live video link, and check off syllabus topics together.',
              badge: 'Live Session',
            },
            {
              step: '03',
              title: 'Verify with guides & quizzes',
              desc: 'Download peer-contributed PDF notes and complete post-class topic quizzes to track weak areas and build mastery.',
              badge: 'Learning Hub',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-3xl bg-card border border-border-card shadow-card p-5 sm:p-6 flex flex-col justify-between gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-accent-muted text-accent font-extrabold text-xs flex items-center justify-center border border-accent/20">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-card-muted text-text-muted border border-border-subtle">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-text-main">{item.title}</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Delicate Wave & Sprout Divider + Centered Minimal Footer */}
      <footer className="mt-12 bg-card-muted/45 pt-10 pb-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Delicate curved line with center leaf/sparkle motif */}
          <div className="w-full max-w-2xl flex items-center justify-center mb-6 text-text-muted/50">
            <svg className="w-full h-8" viewBox="0 0 600 32" fill="none" preserveAspectRatio="none">
              <path
                d="M0 18 Q 150 26 292 18 M308 18 Q 450 10 600 18"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M300 17 C296 10, 290 9, 292 4 C297 5, 300 10, 300 17 Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M300 17 C304 10, 310 9, 308 4 C303 5, 300 10, 300 17 Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>

          <span className="font-extrabold text-lg tracking-tight text-text-main mb-3">
            Peer<span className="text-accent">Learn</span>
          </span>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-text-secondary mb-2">
            <a href="#features" className="hover:text-text-main transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-text-main transition-colors">
              How it works
            </a>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-text-main transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="hover:text-text-main transition-colors"
            >
              Register
            </button>
          </div>

          <p className="text-[11px] text-text-muted mt-1">
            Student-to-Student Skill Exchange • Powered by Spring Boot &amp; PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
