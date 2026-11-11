import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, BookOpen, ListChecks, AlertCircle, MessageSquare } from 'lucide-react';
import { PillButton } from './PillButton';
import { apiRequest } from '../../lib/api';
import { useModeTheme } from '../../context/ModeThemeContext';
import { useToast } from '../../context/ToastContext';

export function RequestSessionModal({ tutor, isOpen, onClose }) {
  const { refreshBadges } = useModeTheme();
  const { showToast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && tutor) {
      const initialSkill = tutor.skillsTaught?.[0] || '';
      const initialTopics =
        (initialSkill && tutor.topicsBySkill?.[initialSkill]) || tutor.topicsList || [];
      setSelectedSkill(initialSkill);
      const firstAvail = tutor.availabilitySlots?.find((s) => s.available);
      setSelectedSlot(firstAvail?.id || null);
      setSelectedTopics(new Set(initialTopics[0] ? [initialTopics[0]] : []));
      setMessage('');
      setStep(1);
      setErrorMsg('');
    }
  }, [isOpen, tutor]);

  if (!isOpen || !tutor) return null;

  const availableTopics =
    (selectedSkill && tutor.topicsBySkill?.[selectedSkill]) || tutor.topicsList || [];

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    const nextTopics = (skill && tutor.topicsBySkill?.[skill]) || tutor.topicsList || [];
    setSelectedTopics(new Set(nextTopics[0] ? [nextTopics[0]] : []));
  };

  const toggleTopic = (topic) => {
    const next = new Set(selectedTopics);
    if (next.has(topic)) {
      next.delete(topic);
    } else {
      next.add(topic);
    }
    setSelectedTopics(next);
  };

  const handleConfirm = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await apiRequest('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          tutorId: tutor.id,
          skillName: selectedSkill,
          slotId: selectedSlot,
          topics: Array.from(selectedTopics),
          message: message.trim(),
        }),
      });
      refreshBadges();
      showToast(`Session request sent to ${tutor.name}.`, 'success');
      setStep(2);
    } catch (err) {
      const msg = err.message || 'Could not send booking request.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card rounded-3xl shadow-2xl border border-border-card p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
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

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Skill Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> 1. Select Skill
              </label>
              <div className="flex flex-wrap gap-2">
                {(tutor.skillsTaught || []).map((skill) => {
                  const fee = tutor.feeBySkill?.[skill] ?? tutor.startingFeeInr ?? 99;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                        selectedSkill === skill
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-card-muted text-text-secondary border-border-subtle hover:bg-card-hover'
                      }`}
                    >
                      {skill} • ₹{fee}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Slot Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" /> 2. Pick a free slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(tutor.availabilitySlots || []).map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
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
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-accent" /> 3. Topics you want covered ({selectedSkill || 'General'})
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {availableTopics.map((topic) => {
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

            {/* 4. Optional Note to Tutor */}
            <div className="mb-6">
              <label
                htmlFor="request-note-tutor"
                className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent" /> 4. Note to tutor (optional)
              </label>
              <textarea
                id="request-note-tutor"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Share what you want to focus on or your current comfort level in ${selectedSkill || 'this topic'}...`}
                className="w-full p-3 rounded-2xl bg-card-muted/70 border border-border-subtle text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Session Fee Strip & Footer */}
            <div className="mb-4 px-4 py-2.5 rounded-2xl bg-accent-muted/40 border border-accent/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-text-secondary">
                Session Fee ({selectedSkill || '1 hr'})
              </span>
              <span className="font-extrabold text-accent text-sm">
                ₹{(selectedSkill && tutor.feeBySkill?.[selectedSkill]) ?? tutor.startingFeeInr ?? 99}{' '}
                <span className="text-[11px] font-medium text-text-muted">/ 1 hr session</span>
              </span>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
              <PillButton variant="secondary" onClick={handleClose}>
                Cancel
              </PillButton>
              <PillButton
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedSlot || submitting}
              >
                {submitting ? 'Sending...' : 'Send Request'}
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
