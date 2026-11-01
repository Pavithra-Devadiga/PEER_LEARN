import React, { useState } from 'react';
import { X, CheckCircle, Calendar as CalendarIcon, Clock, BookOpen, ListChecks } from 'lucide-react';
import { PillButton } from './PillButton';

export function RequestSessionModal({ tutor, isOpen, onClose }) {
  const [selectedSkill, setSelectedSkill] = useState(tutor?.skillsTaught?.[0] || 'Python');
  const [selectedSlot, setSelectedSlot] = useState(tutor?.availabilitySlots?.[0]?.id || null);
  const [selectedTopics, setSelectedTopics] = useState(new Set(['Functions & Scope']));
  const [step, setStep] = useState(1); // 1: Pick details, 2: Confirmation

  if (!isOpen || !tutor) return null;

  const toggleTopic = (topic) => {
    const next = new Set(selectedTopics);
    if (next.has(topic)) {
      next.delete(topic);
    } else {
      next.add(topic);
    }
    setSelectedTopics(next);
  };

  const handleConfirm = () => {
    setStep(2);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card rounded-3xl shadow-2xl border border-border-card p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-12 h-12 rounded-full object-cover border border-border-subtle"
              />
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  Request a session with {tutor.name}
                </h2>
                <p className="text-xs text-text-muted">
                  {tutor.proficiency} • {tutor.rating}★ ({tutor.reviewCount} reviews)
                </p>
              </div>
            </div>

            {/* 1. Skill Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> 1. Select Skill
              </label>
              <div className="flex flex-wrap gap-2">
                {tutor.skillsTaught.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                      selectedSkill === skill
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-card-muted text-text-secondary border-border-subtle hover:bg-card-hover'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Slot Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" /> 2. Pick a free slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tutor.availabilitySlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                      selectedSlot === slot.id
                        ? 'bg-accent-muted border-accent text-accent font-semibold ring-1 ring-accent'
                        : slot.available
                        ? 'bg-card-muted/70 text-text-main border-border-subtle hover:bg-card-muted'
                        : 'opacity-40 bg-card-muted/30 cursor-not-allowed border-transparent text-text-muted'
                    }`}
                  >
                    <div className="font-bold">{slot.day}</div>
                    <div className="text-[11px] opacity-80">{slot.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Topics Checklist */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-accent" /> 3. Topics you want covered
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {tutor.topicsList.map((topic) => {
                  const isChecked = selectedTopics.has(topic);
                  return (
                    <label
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-card-muted text-text-main font-medium'
                          : 'text-text-secondary hover:bg-card-muted/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-accent focus:ring-accent"
                      />
                      <span>{topic}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
              <PillButton variant="secondary" onClick={handleClose}>
                Cancel
              </PillButton>
              <PillButton
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedSlot}
              >
                Send Request
              </PillButton>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-text-main mb-2">
              Request Sent!
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
              Your request for <span className="font-bold text-text-main">{selectedSkill}</span> with <span className="font-bold text-text-main">{tutor.name}</span> is currently <span className="font-bold text-accent">pending</span>.
            </p>

            <div className="p-4 rounded-2xl bg-card-muted/60 border border-border-subtle text-xs text-text-secondary max-w-sm mx-auto mb-6 text-left space-y-1.5">
              <div>• You will be notified once {tutor.name} accepts.</div>
              <div>• Chat and session materials unlock automatically upon acceptance.</div>
            </div>

            <PillButton variant="primary" onClick={handleClose}>
              Done & Return to Tutors
            </PillButton>
          </div>
        )}
      </div>
    </div>
  );
}
