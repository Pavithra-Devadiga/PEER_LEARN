import React, { useState, useEffect } from 'react';
import { Card } from '../../components/primitives/Card';
import { StatCard } from '../../components/primitives/StatCard';
import { Star, Calendar } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export function InsightsPage() {
  const [insights, setInsights] = useState({
    avgRating: '—',
    totalReviews: 0,
    completionRate: '100%',
    repeatStudentsPct: '0%',
    repeatStudentCount: 0,
    ratingDistribution: [
      { stars: 5, percentage: 0, count: 0 },
      { stars: 4, percentage: 0, count: 0 },
      { stars: 3, percentage: 0, count: 0 },
      { stars: 2, percentage: 0, count: 0 },
      { stars: 1, percentage: 0, count: 0 },
    ],
    mostBookedSlots: [],
    reviews: [],
  });

  useEffect(() => {
    let active = true;
    apiRequest('/api/tutor/insights')
      .then((res) => {
        if (active && res) setInsights(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
        <StatCard value={insights.avgRating} label="Average Rating" hint={`Based on ${insights.totalReviews} ratings`} />
        <StatCard value={insights.completionRate} label="Completion Rate" hint="Completed vs cancelled" />
        <StatCard value={insights.repeatStudentsPct} label="Repeat Students" hint={`${insights.repeatStudentCount} students booked again`} />
        <StatCard value={String(insights.totalReviews)} label="Total Reviews" hint="Verified student feedback" />
      </div>

      {/* Grid: Rating Breakdown & Top Booking Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Rating Breakdown
          </h2>

          <div className="space-y-2.5">
            {insights.ratingDistribution.map((row) => (
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
            <span className="font-bold text-text-main">Summary:</span> Ratings are aggregated live from student feedback stored in your RDBMS `reviews` table.
          </div>
        </Card>

        {/* Most Booked Slots */}
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" /> Most Booked Weekly Hours
          </h2>

          {insights.mostBookedSlots.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">
              Slot demand analytics will appear once you have booked sessions.
            </div>
          ) : (
            <div className="space-y-3">
              {insights.mostBookedSlots.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-card-muted/60 border border-border-subtle/80 text-xs"
                >
                  <div>
                    <div className="font-bold text-text-main">{item.slot}</div>
                    <div className="text-[11px] text-text-muted">{item.skill}</div>
                  </div>
                  <span className="font-bold text-accent px-3 py-1 rounded-full bg-accent-muted">
                    {item.bookings} session{item.bookings === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Demand Tip:</span> Keep your weekly availability drawer updated so students can discover open slots.
          </div>
        </Card>
      </div>

      {/* Review List */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-main">Student Reviews</h2>
          <span className="text-xs text-text-muted font-semibold">{insights.totalReviews} reviews total</span>
        </div>

        {insights.reviews.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">
            No student reviews recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {insights.reviews.map((rev) => (
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
        )}
      </Card>
    </div>
  );
}
