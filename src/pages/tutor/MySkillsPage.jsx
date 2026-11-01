import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { placeholderData } from '../../data/placeholderData';
import { Plus, Star, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';

export function MySkillsPage() {
  const [skills, setSkills] = useState(placeholderData.tutor.skillsTaught);
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('Data Structures');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  const sharedChecklists = {
    Python: [
      'Variables, Data Types & Operators',
      'Control Flow & Conditionals',
      'Functions & Local/Global Scope',
      'Lists, Tuples, Sets, Dictionaries',
      'Object-Oriented Programming (Classes & Inheritance)',
      'File Handling & Exception Handling',
      'Virtual Environments & Packages',
    ],
    Guitar: [
      'Tuning & Holding the Guitar',
      'Open Chords (E, A, D, G, C)',
      'Basic Strumming & Timing',
      'Barre Chords (F & B minor)',
      'Fingerpicking Basics',
      'Pentatonic Scale & Minor Blues',
    ],
    'React & Frontend': [
      'JSX Syntax & Rules',
      'Props vs State',
      'useEffect & Lifecycle Syncing',
      'Component Composition',
      'Custom Hooks & Context API',
      'Performance & Memoization',
    ],
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const newEntry = {
      name: newSkillName,
      level: newSkillLevel,
      rating: 5.0,
      sessionsTaught: 0,
      category: 'Computer Science',
    };
    setSkills([...skills, newEntry]);
    setSelectedSkill(newEntry);
    setShowAddModal(false);
  };

  const handleRemoveSkill = (skillName) => {
    const updated = skills.filter((s) => s.name !== skillName);
    setSkills(updated);
    if (selectedSkill?.name === skillName) {
      setSelectedSkill(updated[0] || null);
    }
  };

  const currentChecklist =
    sharedChecklists[selectedSkill?.name] || [
      'Core Fundamentals & Setup',
      'Intermediate Application & Practice',
      'Advanced Edge Cases & Debugging',
    ];

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
          onClick={() => setShowAddModal(true)}
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

          {skills.map((skill) => {
            const isSelected = selectedSkill?.name === skill.name;
            return (
              <Card
                key={skill.name}
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                    {skill.level}
                  </span>
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
                      handleRemoveSkill(skill.name);
                    }}
                    className="p-1 text-text-muted hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right: Shared Topic Checklist Preview */}
        <div className="md:col-span-2">
          {selectedSkill ? (
            <Card padding="p-6" className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
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

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-muted text-accent">
                  Read-only Standard
                </span>
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
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Skill Name
                </label>
                <input
                  type="text"
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

              <div className="flex justify-end gap-2 pt-4">
                <PillButton variant="secondary" onClick={() => setShowAddModal(false)}>
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
