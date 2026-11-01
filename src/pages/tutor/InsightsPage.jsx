import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { StatCard } from '../../components/primitives/StatCard';
import { placeholderData } from '../../data/placeholderData';
import { Star, TrendingUp, Calendar, Filter } from 'lucide-react';

export function InsightsPage() {
  const [filterSkill, setFilterSkill] = useState('all');
  const reviews = placeholderData.tutor.recentReviews;

  const ratingDistribution = [
    { stars: 5, percentage: 89, count: 17 },
    { stars: 4, percentage: 11, count: 2 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 },
  ];

  const mostBookedSlots = [
    { slot: 'Tuesday 4:00 PM', bookings: 12, skill: 'Python' },
    { slot: 'Thursday 5:30 PM', bookings: 6, skill: 'Guitar' },
    { slot: 'Friday 6:00 PM', bookings: 4, skill: 'React' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Teaching Insights & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Review your student ratings, repeat student metrics, and highest-demand booking hours.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value="4.8" label="Average Rating" hint="Based on 19 ratings" />
        <StatCard value="100%" label="Completion Rate" hint="Zero tutor cancellations" />
        <StatCard value="82%" label="Repeat Students" hint="7 students booked again" />
        <StatCard value="35 min" label="Avg Response" hint="Fast booking replies" />
      </div>

      {/* Grid: Rating Breakdown & Top Booking Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Rating Breakdown
          </h2>

          <div className="space-y-2.5">
            {ratingDistribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-text-secondary flex items-center gap-0.5">
                  {row.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-card-muted rounded-full overflow-hidden border border-border-subtle/50">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right font-semibold text-text-muted">
                  {row.percentage}%
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-card-muted/50 border border-border-subtle text-xs text-text-muted mt-2">
            <span className="font-bold text-text-main">Top Praise:</span> "Clear explanations", "Very patient with edge cases", "Great analogies".
          </div>
        </Card>

        {/* Most Booked Slots */}
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" /> Most Booked Weekly Hours
          </h2>

          <div className="space-y-3">
            {mostBookedSlots.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card-muted/60 border border-border-subtle/80 text-xs"
              >
                <div>
                  <div className="font-bold text-text-main">{item.slot}</div>
                  <div className="text-[11px] text-text-muted">{item.skill}</div>
                </div>
                <span className="font-bold text-accent px-3 py-1 rounded-full bg-accent-muted">
                  {item.bookings} sessions
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Demand Tip:</span> Students frequently look for slots between 4 PM - 6 PM on Tuesdays.
          </div>
        </Card>
      </div>

      {/* Review List */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-main">Student Reviews</h2>
          <span className="text-xs text-text-muted font-semibold">19 reviews total</span>
        </div>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-card-muted/50 border border-border-subtle text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-main">{rev.student}</span>
                  <span className="px-2 py-0.5 rounded-full bg-card text-text-muted border border-border-subtle text-[10px] font-semibold">
                    {rev.skill}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {rev.rating}.0
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed">
                "{rev.comment}"
              </p>
              <div className="text-[10px] text-text-muted pt-1">{rev.date}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
