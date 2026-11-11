import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { PillButton } from './PillButton';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function AvailabilityDrawer({ isOpen, onClose }) {
  const { showToast } = useToast();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const [activeSlots, setActiveSlots] = useState(new Set());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    apiRequest('/api/tutor/availability')
      .then((slots) => {
        if (active && Array.isArray(slots)) {
          setActiveSlots(new Set(slots));
        }
      })
      .catch((err) => {
        if (active) showToast(err.message || 'Could not load availability.', 'error');
      });
    return () => {
      active = false;
    };
  }, [isOpen, showToast]);

  if (!isOpen) return null;

  const toggleSlot = (key) => {
    const next = new Set(activeSlots);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setActiveSlots(next);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/tutor/availability', {
        method: 'PUT',
        body: JSON.stringify({ activeSlots: Array.from(activeSlots) }),
      });
      setSaved(true);
      showToast('Weekly availability saved!', 'success');
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 600);
    } catch (err) {
      showToast(err.message || 'Could not save availability.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card h-full shadow-2xl border-l border-border-subtle p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-main">Edit Weekly Availability</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Set recurring 1-hour slots for students to book sessions.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-card-muted text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-bold text-text-muted pb-2 border-b border-border-subtle/50">
              <span>Time</span>
              {days.slice(0, 5).map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {times.map((time) => (
              <div key={time} className="grid grid-cols-6 gap-1 sm:gap-2 items-center">
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-muted">{time}</span>
                {days.slice(0, 5).map((d) => {
                  const key = `${d}-${time}`;
                  const isAvailable = activeSlots.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSlot(key)}
                      className={`h-8 sm:h-9 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 flex items-center justify-center border ${
                        isAvailable
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-card-muted/60 text-text-muted border-border-subtle hover:bg-card-muted'
                      }`}
                    >
                      {isAvailable ? 'Free' : '—'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-card-muted/60 border border-border-subtle text-xs text-text-secondary">
            <span className="font-bold text-text-main">Weekly template rule:</span> Changes apply to upcoming matching dates. Conflicting requests will be checked automatically.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border-subtle flex items-center justify-end gap-3">
          <PillButton variant="secondary" onClick={onClose}>
            Cancel
          </PillButton>
          <PillButton variant="primary" onClick={handleSave} disabled={saving}>
            {saved ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Saved!
              </span>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save Availability'
            )}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
