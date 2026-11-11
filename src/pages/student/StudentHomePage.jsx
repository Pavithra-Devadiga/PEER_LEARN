import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/primitives/Card';
import { StatCard } from '../../components/primitives/StatCard';
import { Calendar } from '../../components/primitives/Calendar';
import { ArrowRight, Clock } from 'lucide-react';
import { useModeTheme } from '../../context/ModeThemeContext';
import { apiRequest } from '../../lib/api';

export function StudentHomePage() {
  const navigate = useNavigate();
  const { user } = useModeTheme();
  const [data, setData] = useState({
    name: user?.name || '',
    welcomeSubtitle: 'Loading your learning dashboard...',
    stats: [
      { label: 'Streak (wks)', value: '—', hint: 'Consecutive weeks' },
      { label: 'Sessions', value: '—', hint: 'Completed sessions' },
      { label: 'Hours', value: '—', hint: 'Hours learned' },
      { label: 'Skills tried', value: '—', hint: 'Unique topics' },
      { label: 'Quiz avg', value: '—', hint: 'Score average' },
    ],
    nextSessions: [],
    skillProgress: [],
    badges: [],
  });

  useEffect(() => {
    let active = true;
    apiRequest('/api/student/dashboard')
      .then((res) => {
        if (active && res) setData(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="w-full p-7 sm:p-9 rounded-3xl border border-border-card bg-[var(--banner-bg)] text-text-main shadow-card flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 text-[var(--banner-text)]">
          Welcome back, {user?.name || data.name}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary font-medium">
          {data.welcomeSubtitle}
        </p>
      </div>

      {/* 2. 5-Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.stats.map((stat, i) => (
          <StatCard
            key={i}
            value={stat.value}
            label={stat.label}
            hint={stat.hint}
          />
        ))}
      </div>

      {/* 3. Two Columns: Left Stack & Right Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Stack of Content Cards) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Sessions */}
          <Card padding="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">Next sessions</h2>
              <button
                onClick={() => navigate('/student/sessions')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {data.nextSessions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-card-muted/40 border border-border-subtle/50 text-xs text-text-muted text-center">
                  No upcoming sessions yet. Browse skills to book a peer tutor!
                </div>
              ) : (
                data.nextSessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => navigate('/student/sessions')}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-card-muted/60 border border-border-subtle/70 hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-main">
                          {sess.title}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {sess.time} with {sess.tutor}
                        </p>
                      </div>
                    </div>

                    <span className="self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full bg-card text-text-secondary border border-border-subtle shadow-sm shrink-0">
                      {sess.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Skill Progress */}
          <Card padding="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">Skill progress</h2>
              <button
                onClick={() => navigate('/student/learning')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Learning hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {data.skillProgress.length === 0 ? (
                <div className="p-4 rounded-2xl bg-card-muted/40 border border-border-subtle/50 text-xs text-text-muted text-center">
                  Topic progress appears once your first session begins.
                </div>
              ) : (
                data.skillProgress.map((prog, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-main">{prog.skill}</span>
                      <span className="text-text-muted font-semibold">
                        {prog.covered} of {prog.total} topics
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-card-muted rounded-full overflow-hidden border border-border-subtle/50">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Badges and Milestones */}
          <Card padding="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-main">Badges and milestones</h2>
              <span className="text-xs text-text-muted font-semibold">{data.badges.length} unlocked</span>
            </div>

            {data.badges.length === 0 ? (
              <div className="p-4 rounded-2xl bg-card-muted/40 border border-border-subtle/50 text-xs text-text-muted text-center">
                Complete sessions and quizzes to unlock peer learning badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-2xl bg-card-muted/50 border border-border-subtle/60 flex flex-col items-center text-center"
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-xs font-bold text-text-main leading-tight mb-0.5">
                      {badge.name}
                    </span>
                    <span className="text-[10px] text-text-muted leading-tight">
                      {badge.desc}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Calendar Card) */}
        <div className="lg:col-span-1">
          <Calendar />
        </div>
      </div>
    </div>
  );
}
