import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useModeTheme } from '../../context/ModeThemeContext';
import { PillButton } from './PillButton';
import { apiRequest } from '../../lib/api';

export function Calendar({
  onOpenAvailabilityDrawer,
  className = '',
}) {
  const { mode, isAuthenticated } = useModeTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [calData, setCalData] = useState({
    monthLabel: now.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    sessionDays: [],
    freeDays: [],
    bookedDays: [],
    requestDays: [],
    upcomingItems: [],
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    apiRequest(`/api/calendar?mode=${mode}&year=${year}&month=${month}`)
      .then((data) => {
        if (active && data) setCalData(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mode, year, month, isAuthenticated]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const days = Array.from({ length: calData.daysInMonth || 28 }, (_, i) => i + 1);

  const getDayState = (day) => {
    if (mode === 'student') {
      if (calData.sessionDays?.includes(day)) return 'session';
      return 'normal';
    } else {
      if (calData.bookedDays?.includes(day)) return 'booked';
      if (calData.requestDays?.includes(day)) return 'requests';
      if (calData.freeDays?.includes(day)) return 'free';
      return 'normal';
    }
  };

  return (
    <div
      className={`bg-card rounded-3xl p-5 border border-border-card/80 shadow-card flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-text-main">
            {mode === 'student' ? 'Calendar' : 'Availability calendar'}
          </h3>
          <div className="flex items-center gap-1 text-text-muted">
            <span className="text-xs font-semibold mr-1 text-text-secondary">{calData.monthLabel}</span>
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-card-muted text-text-secondary"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-card-muted text-text-secondary"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((d, i) => (
            <span
              key={i}
              className="text-xs font-semibold text-text-muted py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {days.map((day) => {
            const state = getDayState(day);
            const isSelected = selectedDay === day;

            let badgeClasses =
              'w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold transition-all duration-150 cursor-pointer ';

            if (mode === 'student') {
              if (state === 'session') {
                badgeClasses += isSelected
                  ? 'bg-accent text-white shadow-sm ring-2 ring-accent/30'
                  : 'bg-accent-muted text-accent font-bold hover:bg-accent hover:text-white';
              } else {
                badgeClasses += isSelected
                  ? 'bg-card-muted text-text-main ring-1 ring-border-subtle'
                  : 'text-text-secondary hover:bg-card-muted hover:text-text-main';
              }
            } else {
              if (state === 'booked') {
                badgeClasses += 'bg-emerald-500 text-white font-bold shadow-sm';
              } else if (state === 'requests') {
                badgeClasses += 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/40';
              } else if (state === 'free') {
                badgeClasses += 'text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/40';
              } else {
                badgeClasses += isSelected
                  ? 'bg-card-muted text-text-main'
                  : 'text-text-secondary hover:bg-card-muted hover:text-text-main';
              }
            }

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={badgeClasses}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Tutor Mode Legend */}
        {mode === 'tutor' && (
          <div className="flex flex-wrap items-center justify-around gap-2 py-2 px-2 mb-3 bg-card-muted/50 rounded-2xl text-[11px] font-semibold text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-emerald-500" />
              <span>Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Requests</span>
            </div>
          </div>
        )}
      </div>

      {/* Under-Calendar Items */}
      <div className="space-y-2 pt-2 border-t border-border-subtle/50">
        {mode === 'student' ? (
          calData.upcomingItems && calData.upcomingItems.length > 0 ? (
            calData.upcomingItems.map((item, idx) => (
              <div
                key={idx}
                className={`w-full py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                  item.isAccent
                    ? 'bg-accent-muted text-accent'
                    : 'bg-card-muted text-text-secondary font-medium'
                }`}
              >
                <span className="truncate mr-2">{item.primary}</span>
                <span className="text-[10px] opacity-80 shrink-0">{item.secondary}</span>
              </div>
            ))
          ) : (
            <div className="w-full py-2 px-3 rounded-2xl bg-card-muted text-text-muted text-xs text-center">
              No sessions scheduled this month
            </div>
          )
        ) : (
          <>
            {calData.upcomingItems && calData.upcomingItems.length > 0 && (
              <div className="w-full py-2 px-3 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center justify-between">
                <span className="truncate mr-2">{calData.upcomingItems[0].primary}</span>
                <span className="text-[10px] opacity-80 shrink-0">{calData.upcomingItems[0].secondary}</span>
              </div>
            )}
            <PillButton
              variant="secondary"
              size="sm"
              onClick={onOpenAvailabilityDrawer}
              className="w-full text-xs font-semibold !py-2.5"
            >
              Edit weekly availability
            </PillButton>
          </>
        )}
      </div>
    </div>
  );
}
