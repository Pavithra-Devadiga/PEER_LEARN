import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '../../components/primitives/Card';
import { StatCard } from '../../components/primitives/StatCard';
import { Calendar } from '../../components/primitives/Calendar';
import { placeholderData } from '../../data/placeholderData';
import { ArrowRight, Star, Clock, Check, X } from 'lucide-react';
import { PillButton } from '../../components/primitives/PillButton';
import { useModeTheme } from '../../context/ModeThemeContext';

export function TutorHomePage() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const { user } = useModeTheme();
  const data = placeholderData.tutor;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner (Green Accent) */}
      <div className="w-full p-6 sm:p-8 rounded-3xl border border-border-card bg-[var(--banner-bg)] text-text-main shadow-card flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-[var(--banner-text)]">
          Welcome back, {user?.name || data.name}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary font-medium">
          {data.welcomeSubtitle}
        </p>
      </div>

      {/* 2. 5-Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {data.stats.map((stat, i) => (
          <StatCard
            key={i}
            value={stat.value}
            label={stat.label}
            hint={stat.hint}
          />
        ))}
      </div>

      {/* 3. Two Columns: Left Stack & Right Availability Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Stack of Content Cards) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pending Requests Card (Call To Action) */}
          <Card padding="p-5 sm:p-6" className="border-accent/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-text-main">
                  Pending requests
                </h2>
                <p className="text-xs text-text-muted">
                  {data.pendingRequestsSummary.note}
                </p>
              </div>

              <button
                onClick={() => navigate('/tutor/requests')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                View all ({data.pendingRequestsSummary.count}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-card-muted/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center font-bold text-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    {data.pendingRequestsSummary.slot} — {data.pendingRequestsSummary.skill}
                  </h3>
                  <p className="text-xs text-text-muted">
                    3 students requesting this same slot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/tutor/requests')}
                >
                  Review Requests
                </PillButton>
              </div>
            </div>
          </Card>

          {/* My Skills Card */}
          <Card padding="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">My skills</h2>
              <button
                onClick={() => navigate('/tutor/skills')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Manage skills <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.skillsTaught.map((skill, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/80 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card text-text-muted border border-border-subtle mb-2 inline-block">
                      {skill.level}
                    </span>
                    <h3 className="text-sm font-bold text-text-main">
                      {skill.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs text-text-muted">
                    <span>{skill.sessionsTaught} taught</span>
                    <span className="flex items-center font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                      {skill.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reviews Card */}
          <Card padding="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">Recent reviews</h2>
              <button
                onClick={() => navigate('/tutor/insights')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                All reviews <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {data.recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle/70 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-text-main">
                      {rev.student} <span className="font-normal text-text-muted">({rev.skill})</span>
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {rev.rating}.0
                    </div>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Availability Calendar Card) */}
        <div className="lg:col-span-1">
          <Calendar onOpenAvailabilityDrawer={outletCtx?.openAvailabilityDrawer} />
        </div>
      </div>
    </div>
  );
}
