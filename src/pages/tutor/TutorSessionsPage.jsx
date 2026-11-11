import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { Badge } from '../../components/primitives/Badge';
import { Clock, Send, ChevronDown, Star, MessageSquare, Video, ExternalLink, Link2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

function isSafeHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
}

export function TutorSessionsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [meetingEdits, setMeetingEdits] = useState({});
  const [savingMeetingId, setSavingMeetingId] = useState(null);
  const hasInitializedExpandRef = useRef(false);

  const fetchSessions = useCallback(async (silent = false) => {
    try {
      const data = await apiRequest('/api/sessions/tutor');
      if (Array.isArray(data)) {
        setSessions(data);
        if (!hasInitializedExpandRef.current) {
          hasInitializedExpandRef.current = true;
          setExpandedSessionId(data.find((s) => s.status === 'Upcoming')?.id || data[0]?.id || null);
        }
      }
    } catch (err) {
      if (!silent) {
        showToast(err.message || 'Could not load teaching sessions.', 'error');
      }
    }
  }, [showToast]);

  useEffect(() => {
    fetchSessions(false);
    const intervalId = window.setInterval(() => {
      fetchSessions(true);
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, [fetchSessions]);

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'Upcoming') return s.status === 'Upcoming';
    if (activeTab === 'Completed') return s.status === 'Completed';
    if (activeTab === 'Cancelled') return s.status === 'Cancelled';
    return true;
  });

  const handleToggleTopic = async (session, topicId) => {
    try {
      const updatedTopic = await apiRequest(`/api/sessions/${session.rawId}/topics/${topicId}/toggle`, {
        method: 'PATCH',
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id
            ? {
                ...s,
                topics: s.topics.map((t) => (t.id === topicId ? updatedTopic : t)),
              }
            : s
        )
      );
    } catch (err) {
      showToast(err.message || 'Could not update topic status.', 'error');
    }
  };

  const handleAddTopic = async (session) => {
    if (!newTopicInput.trim()) return;
    const name = newTopicInput.trim();
    setNewTopicInput('');
    try {
      const created = await apiRequest(`/api/sessions/${session.rawId}/topics`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, topics: [...s.topics, created] } : s
        )
      );
      showToast('Added impromptu topic.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not add topic.', 'error');
    }
  };

  const handleSendMessage = async (session) => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      const savedMsg = await apiRequest(`/api/sessions/${session.rawId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, messages: [...s.messages, savedMsg] } : s
        )
      );
    } catch (err) {
      showToast(err.message || 'Could not send message.', 'error');
    }
  };

  const handleCompleteSession = async (session) => {
    try {
      await apiRequest(`/api/sessions/${session.rawId}/complete`, { method: 'PATCH' });
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'Completed' } : s))
      );
      showToast('Session marked as completed!', 'success');
    } catch (err) {
      showToast(err.message || 'Could not complete session.', 'error');
    }
  };

  const handleSaveMeetingUrl = async (session) => {
    const rawUrl = (meetingEdits[session.id] ?? session.meetingUrl ?? '').trim();
    if (!isSafeHttpUrl(rawUrl)) {
      showToast('Please enter a valid http:// or https:// meeting URL.', 'error');
      return;
    }
    setSavingMeetingId(session.id);
    try {
      const res = await apiRequest(`/api/sessions/${session.rawId}/meeting-url`, {
        method: 'PATCH',
        body: JSON.stringify({ meetingUrl: rawUrl }),
      });
      const updatedUrl = res?.meetingUrl || rawUrl;
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, meetingUrl: updatedUrl } : s))
      );
      setMeetingEdits((prev) => ({ ...prev, [session.id]: updatedUrl }));
      showToast('Meeting link updated for this session.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not save meeting URL.', 'error');
    } finally {
      setSavingMeetingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Teaching Sessions
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Tick off topics live during your sessions, communicate with students, and inspect feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-border-subtle/80 pb-3">
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => {
          const isActive = activeTab === tab;
          const count = sessions.filter((s) => s.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary hover:text-text-main border border-border-subtle'
              }`}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-card-muted text-text-muted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card className="p-12 text-center text-text-muted text-sm">
            No {activeTab.toLowerCase()} teaching sessions.
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <Card key={session.id} padding="p-5 sm:p-6" className="space-y-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent-muted text-accent flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-main flex flex-wrap items-center gap-2">
                        {session.title}
                        <Badge variant="green">{session.status}</Badge>
                        {session.feeInr !== undefined && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-card-muted text-text-main border border-border-subtle">
                            ₹{session.feeInr}/hr
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-text-muted">
                        Student: <span className="font-semibold text-text-main">{session.studentName}</span> • {session.datetime}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {session.status === 'Upcoming' && isSafeHttpUrl(session.meetingUrl) && (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card-muted border border-border-subtle text-text-main hover:border-accent hover:text-accent text-xs font-bold transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 text-accent" />
                        <span>Join Meeting</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </a>
                    )}

                    {session.status === 'Upcoming' && (
                      <PillButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteSession(session)}
                      >
                        Mark Complete
                      </PillButton>
                    )}

                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    >
                      {isExpanded ? 'Collapse' : 'Interactive Session View'}
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </PillButton>
                  </div>
                </div>

                {/* Expanded Session Layout */}
                {isExpanded && (
                  <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    {/* Left: Tickable Topic Checklist */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Live Topic Checklist (Click to tick)
                        </h4>
                        <span className="text-[11px] text-accent font-semibold">
                          {session.topics.filter((t) => t.done).length}/{session.topics.length} completed
                        </span>
                      </div>

                      <div className="space-y-2 bg-card-muted/50 p-4 rounded-2xl border border-border-subtle">
                        {session.topics.map((t) => (
                          <label
                            key={t.id}
                            onClick={() => handleToggleTopic(session, t.id)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => {}}
                                className="rounded text-accent focus:ring-accent w-4 h-4"
                              />
                              <span
                                className={t.done ? 'line-through text-text-muted font-medium' : 'text-text-main font-semibold'}
                              >
                                {t.name}
                              </span>
                            </div>
                            {t.askedByStudent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-muted text-accent font-semibold">
                                Student asked for this
                              </span>
                            )}
                          </label>
                        ))}

                        {/* Add extra topic during session */}
                        <div className="pt-2 flex gap-1.5 border-t border-border-subtle/50">
                          <input
                            type="text"
                            placeholder="Add impromptu topic..."
                            value={newTopicInput}
                            onChange={(e) => setNewTopicInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(session)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-card border border-border-subtle text-xs"
                          />
                          <button
                            onClick={() => handleAddTopic(session)}
                            className="p-1.5 px-3 rounded-xl bg-card-muted border border-border-subtle text-xs font-bold hover:bg-card text-text-main"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Tutor inline Meeting Link editor for Upcoming sessions */}
                      {session.status === 'Upcoming' && (
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-card-muted/60 border border-border-subtle space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5 text-accent" /> Video Meeting Link
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="url"
                              placeholder="https://meet.jit.si/peerlearn-..."
                              value={meetingEdits[session.id] ?? session.meetingUrl ?? ''}
                              onChange={(e) =>
                                setMeetingEdits((prev) => ({ ...prev, [session.id]: e.target.value }))
                              }
                              className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-card border border-border-subtle text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            <PillButton
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={savingMeetingId === session.id}
                              onClick={() => handleSaveMeetingUrl(session)}
                            >
                              {savingMeetingId === session.id ? 'Saving...' : 'Save Link'}
                            </PillButton>
                          </div>
                        </div>
                      )}

                      {/* Completed Feedback & Post-Class Quiz Status */}
                      {session.status === 'Completed' && (
                        <div className="space-y-3">
                          {session.rating && (
                            <div className="p-4 rounded-2xl bg-card-muted/70 border border-border-subtle text-xs">
                              <span className="text-xs font-bold text-text-main block mb-1">
                                Student Rating &amp; Review (Read-only)
                              </span>
                              <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {session.rating}.0
                              </div>
                              {session.ratingComment && (
                                <p className="text-text-secondary italic">"{session.ratingComment}"</p>
                              )}
                            </div>
                          )}

                          <div className="p-4 rounded-2xl bg-card-muted/60 border border-border-subtle text-xs space-y-1.5">
                            <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-accent" />
                              Post-Class Topic Quiz Status
                            </span>
                            {session.postClassQuizAttempt ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {session.studentName} scored {session.postClassQuizAttempt.score}/{session.postClassQuizAttempt.totalQuestions} ({session.postClassQuizAttempt.percentage}%)
                                </p>
                                {session.postClassQuizAttempt.missedTopics?.length > 0 && (
                                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    Needs review: {session.postClassQuizAttempt.missedTopics.join(', ')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-text-muted">
                                Waiting for {session.studentName} to attempt the post-class topic quiz.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Built-in Chat */}
                    <div className="flex flex-col h-72 bg-card-muted/40 rounded-2xl border border-border-subtle overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-border-subtle bg-card-muted/80 flex items-center gap-2 text-xs font-bold text-text-main">
                        <MessageSquare className="w-3.5 h-3.5 text-accent" />
                        <span>Chat with {session.studentName}</span>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                        {session.messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-text-muted text-center px-4">
                            No messages yet. Say hello to {session.studentName}!
                          </div>
                        ) : (
                          session.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                                  m.isSelf
                                    ? 'bg-accent text-white rounded-br-none'
                                    : 'bg-card text-text-main border border-border-subtle rounded-bl-none shadow-sm'
                                }`}
                              >
                                {m.text}
                              </div>
                              <span className="text-[10px] text-text-muted px-1 mt-0.5">
                                {m.time}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-border-subtle bg-card flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Reply to student..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(session)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-card-muted border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <button
                          onClick={() => handleSendMessage(session)}
                          className="p-2 rounded-xl bg-accent text-white hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
