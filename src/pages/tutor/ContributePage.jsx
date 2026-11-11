import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { MaterialAttachmentViewer } from '../../components/primitives/MaterialAttachmentViewer';
import {
  Plus,
  Trash2,
  Sparkles,
  Pencil,
  X,
  Upload,
  Paperclip,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiRequest, formatFileSize } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const ACCEPTED_FILE_TYPES =
  '.pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function AttachmentDropzone({
  file,
  onSelectFile,
  existingAttachment,
  removeExisting,
  onToggleRemoveExisting,
}) {
  const inputRef = useRef(null);
  const { showToast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    if (!file || !file.type?.startsWith('image/')) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const validateAndPick = (picked) => {
    if (!picked) return;
    if (picked.size > MAX_UPLOAD_BYTES) {
      showToast('File is too large. Maximum size is 10MB.', 'error');
      return;
    }
    onSelectFile(picked);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
        Attach Document or Image (optional, max 10MB)
      </label>

      {existingAttachment && !file && (
        <div
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs ${
            removeExisting
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-500'
              : 'bg-card-muted border-border-subtle text-text-main'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span className={`truncate font-semibold ${removeExisting ? 'line-through' : ''}`}>
              {existingAttachment.name}
            </span>
            <span className="text-text-muted shrink-0">
              ({formatFileSize(existingAttachment.size)})
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleRemoveExisting}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-card border border-border-subtle hover:border-accent shrink-0"
          >
            {removeExisting ? 'Keep File' : 'Remove'}
          </button>
        </div>
      )}

      {file ? (
        <div className="p-3 rounded-2xl bg-accent-muted/50 border border-accent/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Upload preview"
                className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                <Paperclip className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-main truncate">{file.name}</p>
              <p className="text-[11px] text-text-muted">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label="Remove selected file"
            className="p-1.5 rounded-full hover:bg-card text-text-muted hover:text-rose-500 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            validateAndPick(e.dataTransfer?.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-colors ${
            dragOver
              ? 'border-accent bg-accent-muted/40'
              : 'border-border-subtle bg-card-muted/40 hover:border-accent/60 hover:bg-card-muted/70'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={(e) => validateAndPick(e.target.files?.[0])}
            className="hidden"
          />
          <Upload className="w-5 h-5 text-accent mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-text-main">
            Click to upload or drag &amp; drop a file
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            PDF, PNG/JPG/WEBP/GIF images, TXT/MD/CSV, Word, PowerPoint, or Excel
          </p>
        </div>
      )}
    </div>
  );
}

export function ContributePage() {
  const { showToast } = useToast();
  const [tutorSkills, setTutorSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [activeTab, setActiveTab] = useState('review');
  const [reviewItems, setReviewItems] = useState([]);
  const [contributions, setContributions] = useState([]);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Cheatsheet');
  const [newContent, setNewContent] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Quiz Question fields
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [topicTag, setTopicTag] = useState('');
  const [explanation, setExplanation] = useState('');

  // Edit contribution modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Cheatsheet');
  const [editContent, setEditContent] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Open & Verify Quality Inspection Modal state
  const [inspectContext, setInspectContext] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const loadContributions = useCallback(
    async (skillName) => {
      try {
        const qs = skillName ? `?skill=${encodeURIComponent(skillName)}` : '';
        const data = await apiRequest(`/api/tutor/contributions${qs}`);
        if (data) {
          if (!skillName && data.selectedSkill) setSelectedSkill(data.selectedSkill);
          setReviewItems(data.aiSeeded || []);
          setContributions(data.myContributions || []);
        }
      } catch (err) {
        showToast(err.message || 'Could not load study materials.', 'error');
      }
    },
    [showToast]
  );

  useEffect(() => {
    apiRequest('/api/tutor/skills')
      .then((skills) => {
        if (Array.isArray(skills)) {
          setTutorSkills(skills);
          const first = skills[0]?.name || '';
          setSelectedSkill(first);
          loadContributions(first);
        } else {
          loadContributions('');
        }
      })
      .catch(() => loadContributions(''));
  }, [loadContributions]);

  const handleSelectSkill = (skillName) => {
    setSelectedSkill(skillName);
    loadContributions(skillName);
  };

  const resetAddForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewFile(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setTopicTag('');
    setExplanation('');
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (newType !== 'Quiz Question' && !newContent.trim() && !newFile) {
      showToast('Please enter summary notes or attach a document/image.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let created;
      if (newType === 'Quiz Question') {
        created = await apiRequest('/api/tutor/contributions', {
          method: 'POST',
          body: JSON.stringify({
            skill: selectedSkill,
            type: 'Quiz Question',
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctIndex: Number(correctIndex),
            topicTag,
            explanation,
          }),
        });
      } else if (newFile) {
        const formData = new FormData();
        formData.append('skill', selectedSkill);
        formData.append('title', newTitle);
        formData.append('type', newType);
        formData.append('content', newContent);
        formData.append('file', newFile);
        created = await apiRequest('/api/tutor/contributions', {
          method: 'POST',
          body: formData,
        });
      } else {
        created = await apiRequest('/api/tutor/contributions', {
          method: 'POST',
          body: JSON.stringify({
            skill: selectedSkill,
            title: newTitle,
            type: newType,
            content: newContent,
          }),
        });
      }

      setContributions((prev) => [created, ...prev]);
      setShowAddModal(false);
      resetAddForm();
      showToast(
        newType === 'Quiz Question'
          ? 'Quiz question added to the student practice bank!'
          : newFile
          ? 'Material and file uploaded to PostgreSQL!'
          : 'Study contribution published!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Could not publish contribution.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditType(item.type || 'Notes');
    setEditContent(item.content || '');
    setEditFile(null);
    setRemoveExistingAttachment(false);
  };

  const handleUpdateContribution = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setUpdating(true);
    try {
      let updated;
      if (editFile || removeExistingAttachment) {
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('type', editType);
        formData.append('content', editContent);
        formData.append('removeAttachment', String(removeExistingAttachment));
        if (editFile) {
          formData.append('file', editFile);
        }
        updated = await apiRequest(`/api/tutor/contributions/${editingItem.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        updated = await apiRequest(`/api/tutor/contributions/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: editTitle,
            type: editType,
            content: editContent,
          }),
        });
      }

      setContributions((prev) =>
        prev.map((item) => (item.id === editingItem.id ? updated : item))
      );
      setEditingItem(null);
      showToast('Contribution updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not update contribution.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      const updated = await apiRequest(`/api/tutor/contributions/${id}/verify`, { method: 'POST' });
      setReviewItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setInspectContext((prev) =>
        prev && prev.item.id === id ? { ...prev, item: updated } : prev
      );
      showToast('Material quality approved & verified!', 'success');
    } catch (err) {
      showToast(err.message || 'Could not verify material.', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/api/tutor/contributions/${id}`, { method: 'DELETE' });
      setContributions((prev) => prev.filter((c) => c.id !== id));
      showToast('Contribution deleted.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not delete contribution.', 'error');
    }
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
            Upload notes, PDFs, slides, and images, or open &amp; verify community materials for skills you teach
            {tutorSkills.length > 0 ? ` (${tutorSkills.map((s) => s.name).join(', ')})` : ''}.
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Teaching Skill:
          </span>
          {tutorSkills.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSkill(s.name)}
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

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              activeTab === 'review'
                ? 'bg-card-muted text-text-main border border-border-subtle'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Review &amp; Verify ({reviewItems.length})
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

      {/* Tab 1: Review & Verify Quality */}
      {activeTab === 'review' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-accent-muted/40 border border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-text-main">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>
                Open any AI-seeded guide or peer submission for{' '}
                <span className="font-bold">{selectedSkill || 'your skills'}</span> to inspect its notes,
                documents, or images before approving its quality.
              </span>
            </div>
          </div>

          {reviewItems.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-muted">
              No materials pending review for {selectedSkill || 'this skill'}. Click "New Contribution" to upload your own notes, PDFs, or diagrams!
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewItems.map((item) => (
                <Card key={item.id} padding="p-5" className="flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
                        {item.type} ({item.isAiSeeded ? 'AI Seeded' : item.authorName || 'Peer'})
                      </span>
                      <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                        {item.verifiedByMe && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified by you
                          </span>
                        )}
                        <span>• {item.verifiedCount} verified</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-text-main">{item.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {item.content}
                    </p>

                    {item.attachment && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card-muted border border-border-subtle text-[11px] font-semibold text-text-main max-w-full">
                        <Paperclip className="w-3 h-3 text-accent shrink-0" />
                        <span className="truncate">{item.attachment.name}</span>
                        <span className="text-text-muted shrink-0">
                          ({formatFileSize(item.attachment.size)})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border-subtle/50 flex justify-end gap-2">
                    <PillButton
                      variant={item.verifiedByMe ? 'secondary' : 'primary'}
                      size="sm"
                      icon={Eye}
                      onClick={() => setInspectContext({ item, canVerify: true })}
                    >
                      {item.verifiedByMe ? 'Open Material' : 'Open & Verify'}
                    </PillButton>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: My Contributions */
        <div className="space-y-3">
          {contributions.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-muted">
              You haven't published any study contributions yet.
            </Card>
          ) : (
            contributions.map((item) => (
              <Card key={item.id} padding="p-4" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-text-main">{item.title}</h3>
                    {item.attachment && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-muted text-accent text-[11px] font-semibold max-w-xs">
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.attachment.name}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Skill: {item.skill} • {item.upvotes} upvotes &amp; bookmarks • Status: {item.status}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setInspectContext({ item, canVerify: false })}
                    aria-label="Open contribution preview"
                    title="Open & Preview"
                    className="p-2 rounded-full text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    aria-label="Edit contribution"
                    title="Edit"
                    className="p-2 rounded-full text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete contribution"
                    title="Delete"
                    className="p-2 rounded-full text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Open & Verify Quality Modal */}
      {inspectContext && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setInspectContext(null)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border-card p-6 sm:p-8 relative max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectContext(null)}
              aria-label="Close review modal"
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-2.5 pr-10">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-muted text-accent">
                {inspectContext.item.type}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {inspectContext.item.skill} •{' '}
                {inspectContext.item.isAiSeeded
                  ? 'AI Seeded'
                  : `By ${inspectContext.item.authorName || 'Tutor'}`}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                • {inspectContext.item.verifiedCount} verified
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main mb-4 pr-8">
              {inspectContext.item.title}
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 py-3 border-y border-border-subtle/70">
              <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {inspectContext.item.content}
              </div>
              <MaterialAttachmentViewer attachment={inspectContext.item.attachment} />
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              {inspectContext.canVerify ? (
                inspectContext.item.verifiedByMe ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    Quality Verified by You
                  </span>
                ) : (
                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    disabled={verifyingId === inspectContext.item.id}
                    onClick={() => handleVerify(inspectContext.item.id)}
                  >
                    {verifyingId === inspectContext.item.id
                      ? 'Approving...'
                      : 'Approve & Verify Quality'}
                  </PillButton>
                )
              ) : (
                <span className="text-xs text-text-muted">
                  Previewing your published contribution
                </span>
              )}

              <PillButton variant="secondary" size="sm" onClick={() => setInspectContext(null)}>
                Close
              </PillButton>
            </div>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-text-main mb-4 pr-8">
              Add Material for {selectedSkill || 'Students'}
            </h2>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                >
                  <option value="Cheatsheet">Cheatsheet</option>
                  <option value="Notes">Notes</option>
                  <option value="Document / PDF">Document / PDF</option>
                  <option value="Diagram / Image">Diagram / Image</option>
                  <option value="Quiz Question">Quiz Question</option>
                </select>
              </div>

              {newType === 'Quiz Question' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Question Prompt
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. What is the time complexity of binary search on a sorted array?"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium resize-none text-text-main"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Option A
                      </label>
                      <input
                        type="text"
                        placeholder="Option A"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Option B
                      </label>
                      <input
                        type="text"
                        placeholder="Option B"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Option C
                      </label>
                      <input
                        type="text"
                        placeholder="Option C"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Option D
                      </label>
                      <input
                        type="text"
                        placeholder="Option D"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                        Correct Answer
                      </label>
                      <select
                        value={correctIndex}
                        onChange={(e) => setCorrectIndex(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                        Topic Tag (optional)
                      </label>
                      <input
                        type="text"
                        placeholder={selectedSkill || 'e.g. Recursion'}
                        value={topicTag}
                        onChange={(e) => setTopicTag(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Explanation (shown after answer)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain why the correct answer holds..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium resize-none text-text-main"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Content Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SQL Joins Visual Cheatsheet"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                      required
                    />
                  </div>

                  <AttachmentDropzone file={newFile} onSelectFile={setNewFile} />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Notes / Markdown Summary {newFile ? '(optional)' : ''}
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write concise explanations, code blocks, or describe the uploaded document/image..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium resize-none text-text-main"
                      required={!newFile}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <PillButton
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </PillButton>
                <PillButton type="submit" variant="primary" disabled={submitting}>
                  {submitting ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : newType === 'Quiz Question' ? (
                    'Add Quiz Question'
                  ) : (
                    'Publish Contribution'
                  )}
                </PillButton>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Contribution Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              aria-label="Close edit modal"
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-text-main mb-4 pr-8">Edit Contribution</h2>
            <form onSubmit={handleUpdateContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium text-text-main"
                >
                  <option value="Cheatsheet">Cheatsheet</option>
                  <option value="Notes">Notes</option>
                  <option value="Document / PDF">Document / PDF</option>
                  <option value="Diagram / Image">Diagram / Image</option>
                  <option value="Quiz Question">Quiz Question</option>
                </select>
              </div>

              {editType !== 'Quiz Question' && (
                <AttachmentDropzone
                  file={editFile}
                  onSelectFile={setEditFile}
                  existingAttachment={editingItem.attachment}
                  removeExisting={removeExistingAttachment}
                  onToggleRemoveExisting={() => setRemoveExistingAttachment((p) => !p)}
                />
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Content Summary
                </label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-muted border border-border-subtle text-xs font-medium resize-none text-text-main"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <PillButton variant="secondary" type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </PillButton>
                <PillButton type="submit" variant="primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </PillButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
