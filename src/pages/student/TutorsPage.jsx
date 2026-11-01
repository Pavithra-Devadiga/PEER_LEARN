import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Calendar as CalendarIcon, Award, ChevronDown, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { RequestSessionModal } from '../../components/primitives/RequestSessionModal';
import { placeholderData } from '../../data/placeholderData';

export function TutorsPage() {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill');

  const [tutors, setTutors] = useState(placeholderData.tutorsList);
  const [selectedTutorForModal, setSelectedTutorForModal] = useState(null);
  const [expandedTutorId, setExpandedTutorId] = useState('tutor-1');
  const [proficiencyFilter, setProficiencyFilter] = useState('all');

  const recommendedTutor = tutors.find((t) => t.recommended);
  const otherTutors = tutors.filter((t) => !t.recommended);

  const filteredOtherTutors = otherTutors.filter((t) => {
    if (proficiencyFilter === 'all') return true;
    return t.proficiency.toLowerCase() === proficiencyFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Peer Tutors
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {initialSkill ? `Showing verified peer tutors teaching ${initialSkill}` : 'Connect with high-rated student tutors.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setProficiencyFilter(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                proficiencyFilter === lvl
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary border border-border-subtle hover:bg-card-hover'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Recommended Best Match Card */}
      {recommendedTutor && (
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-accent/30 bg-gradient-to-br from-indigo-500/10 via-card to-card shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-accent text-white font-bold text-xs shadow-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Best Match
            </span>
            <span className="text-xs font-semibold text-accent">
              {recommendedTutor.recommendReason}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <img
                src={recommendedTutor.avatar}
                alt={recommendedTutor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-accent shadow-sm"
              />
              <div>
                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                  {recommendedTutor.name}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                    {recommendedTutor.proficiency}
                  </span>
                </h2>
                <p className="text-xs text-text-muted">{recommendedTutor.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-text-secondary">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    {recommendedTutor.rating} ({recommendedTutor.reviewCount} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center text-text-muted">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                    Free {recommendedTutor.freeDays}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <PillButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  setExpandedTutorId(
                    expandedTutorId === recommendedTutor.id ? null : recommendedTutor.id
                  )
                }
              >
                {expandedTutorId === recommendedTutor.id ? 'Hide Details' : 'Full Profile'}
              </PillButton>

              <PillButton
                variant="primary"
                size="md"
                onClick={() => setSelectedTutorForModal(recommendedTutor)}
              >
                Request a session
              </PillButton>
            </div>
          </div>

          {/* Expanded Profile for Recommended Tutor */}
          {expandedTutorId === recommendedTutor.id && (
            <div className="mt-6 pt-6 border-t border-border-subtle/80 space-y-4 animate-in fade-in duration-200">
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {recommendedTutor.bio}
              </p>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Skills & Topic Checklist
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {recommendedTutor.topicsList.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-xl bg-card-muted border border-border-subtle text-xs text-text-main font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Recent Peer Feedback
                </h3>
                <div className="space-y-2">
                  {recommendedTutor.recentReviews.map((rev, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-card border border-border-subtle text-xs text-text-secondary"
                    >
                      <span className="font-bold text-text-main">{rev.student}: </span>
                      "{rev.text}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Tutors Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-main">All Tutors</h2>

        {filteredOtherTutors.map((tutor) => {
          const isExpanded = expandedTutorId === tutor.id;
          return (
            <Card key={tutor.id} padding="p-5 sm:p-6" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-14 h-14 rounded-full object-cover border border-border-subtle shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                      {tutor.name}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                        {tutor.proficiency}
                      </span>
                    </h3>
                    <p className="text-xs text-text-muted">{tutor.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-text-secondary">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        {tutor.rating} ({tutor.reviewCount} reviews)
                      </span>
                      <span>•</span>
                      <span className="text-text-muted">Free {tutor.freeDays}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <PillButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpandedTutorId(isExpanded ? null : tutor.id)}
                  >
                    {isExpanded ? 'Hide' : 'Profile'}
                  </PillButton>

                  <PillButton
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedTutorForModal(tutor)}
                  >
                    Request a session
                  </PillButton>
                </div>
              </div>

              {/* Expandable profile */}
              {isExpanded && (
                <div className="pt-4 border-t border-border-subtle space-y-3 animate-in fade-in duration-200">
                  <p className="text-xs text-text-secondary">{tutor.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.topicsList.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-xl bg-card-muted border border-border-subtle text-[11px] text-text-main"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Request Session Modal (Inside Expanded View Flow) */}
      <RequestSessionModal
        tutor={selectedTutorForModal}
        isOpen={!!selectedTutorForModal}
        onClose={() => setSelectedTutorForModal(null)}
      />
    </div>
  );
}
