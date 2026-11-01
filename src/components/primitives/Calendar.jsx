import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useModeTheme } from '../../context/ModeThemeContext';
import { PillButton } from './PillButton';

export function Calendar({
  onOpenAvailabilityDrawer,
  className = '',
}) {
  const { mode } = useModeTheme();
  const [selectedDay, setSelectedDay] = useState(4);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Days in month: 28 days for clean calendar matching wireframes
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  // Student mode session days
  const studentSessionDays = [4, 9, 19];

  // Tutor mode state days
  const tutorFreeDays = [2, 16];
  const tutorBookedDays = [9];
  const tutorRequestDays = [4, 11, 18];

  const getDayState = (day) => {
    if (mode === 'student') {
      if (studentSessionDays.includes(day)) return 'session';
      return 'normal';
    } else {
      if (tutorBookedDays.includes(day)) return 'booked';
      if (tutorRequestDays.includes(day)) return 'requests';
      if (tutorFreeDays.includes(day)) return 'free';
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
            <span className="text-xs font-semibold mr-1 text-text-secondary">Oct 2026</span>
            <button className="p-1 rounded-full hover:bg-card-muted text-text-secondary">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-full hover:bg-card-muted text-text-secondary">
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
              'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-150 cursor-pointer ';

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
              // Tutor mode states
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
          <div className="flex items-center justify-around py-2 px-1 mb-3 bg-card-muted/50 rounded-2xl text-[11px] font-semibold text-text-secondary">
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
          <>
            <div className="w-full py-2 px-3 rounded-2xl bg-accent-muted text-accent text-xs font-semibold flex items-center justify-between">
              <span>Tue 4 pm, Python</span>
              <span className="text-[10px] opacity-80">Marcus V.</span>
            </div>
            <div className="w-full py-2 px-3 rounded-2xl bg-card-muted text-text-secondary text-xs font-medium flex items-center justify-between">
              <span>Fri 6 pm, Guitar</span>
              <span className="text-[10px] opacity-80">Elena R.</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-full py-2 px-3 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center justify-between">
              <span>Tue 4 pm, booked</span>
              <span className="text-[10px] opacity-80">Marcus Vance</span>
            </div>
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
