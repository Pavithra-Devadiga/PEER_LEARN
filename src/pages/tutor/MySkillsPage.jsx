import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { Plus, Star, BookOpen, Trash2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function MySkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newSkillFee, setNewSkillFee] = useState(99);
  const [feeEdits, setFeeEdits] = useState({});
  const [savingFee, setSavingFee] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiRequest('/api/tutor/skills');
      if (Array.isArray(data)) {
        setSkills(data);
        setSelectedSkill((prev) => {
          if (!prev) return data[0] || null;
          return data.find((s) => s.id === prev.id) || data[0] || null;
        });
      }
    } catch (err) {
      showToast(err.message || 'Could not load teaching skills.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const added = await apiRequest('/api/tutor/skills', {
        method: 'POST',
        body: JSON.stringify({
          name: newSkillName,
          level: newSkillLevel,
          hourlyFeeInr: Number(newSkillFee),
        }),
      });
      setSkills((prev) => [...prev, added]);
      setSelectedSkill(added);
      setNewSkillName('');
      setNewSkillFee(99);
      setShowAddModal(false);
      showToast(`Added "${added.name}" (₹${added.hourlyFeeInr}/hr) to your teaching skills!`, 'success');
    } catch (err) {
      const msg = err.message || 'Could not add skill.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  const handleSaveFee = async (skill) => {
    const val = Number(feeEdits[skill.id] ?? skill.hourlyFeeInr ?? 99);
    if (Number.isNaN(val) || val < 0 || val > 2000) {
      showToast('Fee must be between ₹0 and ₹2000.', 'error');
      return;
    }
    setSavingFee(true);
    try {
      const res = await apiRequest(`/api/tutor/skills/${skill.id}/fee`, {
        method: 'PATCH',
        body: JSON.stringify({ hourlyFeeInr: val }),
      });
      const updatedFee = res?.hourlyFeeInr ?? val;
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, hourlyFeeInr: updatedFee } : s))
      );
      setSelectedSkill((prev) =>
        prev && prev.id === skill.id ? { ...prev, hourlyFeeInr: updatedFee } : prev
      );
      showToast(`Updated hourly fee to ₹${updatedFee}/hr.`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not update session fee.', 'error');
    } finally {
      setSavingFee(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await apiRequest(`/api/tutor/skills/${skill.id}`, { method: 'DELETE' });
      const updated = skills.filter((s) => s.id !== skill.id);
      setSkills(updated);
      if (selectedSkill?.id === skill.id) {
        setSelectedSkill(updated[0] || null);
      }
      showToast(`Removed "${skill.name}".`, 'info');
    } catch (err) {
      showToast(err.message || 'Could not remove skill.', 'error');
    }
  };

  const currentChecklist = selectedSkill?.checklist || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            My Teaching Skills
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage skills you teach. Anyone can become a tutor by adding skills—no approval needed!
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={Plus}
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
        >
          Add New Skill
        </PillButton>
      </div>

      {/* Main Layout: Skills List & Topic Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Skills List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Your Active Skills ({skills.length})
          </h2>

          {skills.length === 0 ? (
            <Card className="p-6 text-center text-xs text-text-muted">
              No teaching skills added yet. Click "Add New Skill" to start tutoring!
            </Card>
          ) : (
            skills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;
              return (
                <Card
                  key={skill.id}
                  padding="p-4"
                  onClick={() => setSelectedSkill(skill)}
                  className={`transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-accent border-accent/40 bg-accent-muted/20'
                      : 'hover:bg-card-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-text-main">{skill.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent-muted text-accent">
                        ₹{skill.hourlyFeeInr ?? 99}/hr
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                        {skill.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted mt-3">
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {skill.rating}
                    </span>
                    <span>{skill.sessionsTaught} taught</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSkill(skill);
                      }}
                      className="p-1 text-text-muted hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right: Shared Topic Checklist Preview */}
        <div className="md:col-span-2">
          {selectedSkill ? (
            <Card padding="p-4 sm:p-6" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <h3 className="text-lg font-bold text-text-main">
                      {selectedSkill.name} — Shared Curriculum Checklist
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Universal student-tutor roadmap. Tutors check off items in live sessions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-card-muted px-2.5 py-1 rounded-full border border-border-subtle">
                    <span className="text-[11px] font-bold text-text-muted">₹</span>
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={feeEdits[selectedSkill.id] ?? selectedSkill.hourlyFeeInr ?? 99}
                      onChange={(e) =>
                        setFeeEdits((prev) => ({ ...prev, [selectedSkill.id]: e.target.value }))
                      }
                      aria-label="Hourly session fee in INR"
                      className="w-14 bg-transparent text-xs font-extrabold text-text-main focus:outline-none"
                    />
                    <span className="text-[11px] text-text-muted">/hr</span>
                    <button
                      type="button"
                      disabled={savingFee}
                      onClick={() => handleSaveFee(selectedSkill)}
                      className="text-[11px] font-bold text-accent hover:underline ml-1"
                    >
                      Save
                    </button>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-muted text-accent">
                    Read-only Standard
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentChecklist.map((topic, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card-muted/50 border border-border-subtle/80 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-card border border-border-subtle flex items-center justify-center font-bold text-text-muted text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-text-main">{topic}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-text-muted text-sm">
              Select or add a skill to inspect its topic checklist.
            </Card>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-main mb-4">Add a Teaching Skill</h2>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Skill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Your Proficiency Level
                </label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Session Fee (INR ₹ / hour)
                </label>
                <input
                  type="number"
                  min={0}
                  max={2000}
                  value={newSkillFee}
                  onChange={(e) => setNewSkillFee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium"
                  required
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Recommended student-friendly pricing: ₹49 – ₹199 per 1-hour session (or ₹0 for free).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <PillButton variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </PillButton>
                <PillButton type="submit" variant="primary">
                  Confirm & List
                </PillButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
