import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { placeholderData } from '../../data/placeholderData';
import { Plus, Edit3, Trash2, Check, Sparkles, BookOpen, HelpCircle } from 'lucide-react';

export function ContributePage() {
  const tutorSkills = placeholderData.tutor.skillsTaught;
  const [selectedSkill, setSelectedSkill] = useState(tutorSkills[0].name);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'my-contributions'

  const [contributions, setContributions] = useState([
    {
      id: 'c-1',
      title: 'Python Memory Management & Garbage Collection',
      type: 'Notes',
      skill: 'Python',
      status: 'Published',
      upvotes: 18,
    },
    {
      id: 'c-2',
      title: 'Common Beginner Pitfalls with Mutable Default Args',
      type: 'Cheatsheet',
      skill: 'Python',
      status: 'Published',
      upvotes: 32,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Cheatsheet');
  const [newContent, setNewContent] = useState('');

  const handleAddContribution = (e) => {
    e.preventDefault();
    setContributions([
      ...contributions,
      {
        id: `c-${Date.now()}`,
        title: newTitle,
        type: newType,
        skill: selectedSkill,
        status: 'Published',
        upvotes: 1,
      },
    ]);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id) => {
    setContributions((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Contribute Learning Materials
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review AI-generated cheatsheets and contribute notes for skills you teach ({tutorSkills.map((s) => s.name).join(', ')}).
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          New Contribution
        </PillButton>
      </div>

      {/* Skill Filter & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Teaching Skill:
          </span>
          {tutorSkills.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedSkill(s.name)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedSkill === s.name
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary border border-border-subtle hover:bg-card-hover'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              activeTab === 'review'
                ? 'bg-card-muted text-text-main border border-border-subtle'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Review AI Content
          </button>
          <button
            onClick={() => setActiveTab('my-contributions')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              activeTab === 'my-contributions'
                ? 'bg-card-muted text-text-main border border-border-subtle'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            My Contributions ({contributions.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'review' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-accent-muted/40 border border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-text-main">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>
                These community materials for <span className="font-bold">{selectedSkill}</span> are AI-seeded. As a tutor, you can review and improve them!
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card padding="p-5" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
                  Cheatsheet (AI Seeded)
                </span>
                <span className="text-[11px] text-text-muted">Cached • 14 tutors verified</span>
              </div>
              <h3 className="text-sm font-bold text-text-main">
                {selectedSkill}: Variable Unpacking & Extended Slicing
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Step-by-step memory model showing how list pointers are manipulated in Python 3.12.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <PillButton variant="secondary" size="sm">
                  Suggest Edit
                </PillButton>
                <PillButton variant="primary" size="sm">
                  ✓ Verify Quality
                </PillButton>
              </div>
            </Card>

            <Card padding="p-5" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                  Quiz Questions (AI Seeded)
                </span>
                <span className="text-[11px] text-text-muted">8 Questions</span>
              </div>
              <h3 className="text-sm font-bold text-text-main">
                {selectedSkill}: Scope & Local Variable Binding Checks
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Covers tricky LEGB rule questions with multi-choice answers and explanations.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <PillButton variant="secondary" size="sm">
                  Suggest Edit
                </PillButton>
                <PillButton variant="primary" size="sm">
                  ✓ Verify Quality
                </PillButton>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* My Contributions */
        <div className="space-y-3">
          {contributions.map((item) => (
            <Card key={item.id} padding="p-4" className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-text-main">{item.title}</h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Skill: {item.skill} • {item.upvotes} student bookmarks • Status: {item.status}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-full text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-main mb-4">
              Add Material for {selectedSkill}
            </h2>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Content Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master List Slicing in 5 minutes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium"
                >
                  <option value="Cheatsheet">Cheatsheet</option>
                  <option value="Notes">Notes</option>
                  <option value="Quiz Question">Quiz Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Notes / Markdown Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Write concise explanations, code blocks, or mnemonics..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <PillButton variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </PillButton>
                <PillButton type="submit" variant="primary">
                  Publish Contribution
                </PillButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
