import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { PillButton } from '../../components/primitives/PillButton';
import { Card } from '../../components/primitives/Card';
import { useModeTheme } from '../../context/ModeThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { signIn } = useModeTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-muted text-accent font-semibold text-xs sm:text-sm mb-6 border border-accent/20">
        <Sparkles className="w-4 h-4" />
        <span>No applications. No admin approvals. Just peer learning.</span>
      </div>

      {/* Main Pitch */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-text-main tracking-tight leading-[1.1] mb-6">
        Learn one skill, <br className="hidden sm:inline" />
        <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
          teach another.
        </span>
      </h1>

      <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
        PeerLearn is a student skill exchange. One single account to learn and teach. Flip between student and tutor mode with a single toggle.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        <PillButton
          size="lg"
          variant="primary"
          onClick={() => {
            signIn();
          }}
          className="shadow-md"
        >
          Explore Demo as Hannah <ArrowRight className="w-5 h-5 ml-1" />
        </PillButton>
        <PillButton
          size="lg"
          variant="secondary"
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </PillButton>
      </div>

      {/* How it works cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <Card className="hover:border-accent/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">1. Browse & Request</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Search peer tutors by verified skill, ratings, and free weekly slots. Submit requests with zero hassle.
          </p>
        </Card>

        <Card className="hover:border-accent/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">2. Teach What You Love</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Add skills anytime. Set weekly availability templates and accept student requests with built-in clash prevention.
          </p>
        </Card>

        <Card className="hover:border-accent/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">3. Track & Verify</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Review shared topic checklists, test yourself with instant quizzes, and earn ratings that prove your skills.
          </p>
        </Card>
      </div>
    </div>
  );
}
