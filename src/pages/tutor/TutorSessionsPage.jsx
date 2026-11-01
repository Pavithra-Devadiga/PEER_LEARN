import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { Badge } from '../../components/primitives/Badge';
import { placeholderData } from '../../data/placeholderData';
import { Clock, Send, CheckCircle2, ChevronDown, Plus, Star, MessageSquare } from 'lucide-react';

export function TutorSessionsPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [sessions, setSessions] = useState(placeholderData.sessions);
  const [expandedSessionId, setExpandedSessionId] = useState('sess-102');
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const tutorSessions = sessions.filter((s) => s.role === 'tutor' || s.tutorName === 'Hannah');

  const filteredSessions = tutorSessions.filter((s) => {
    if (activeTab === 'Upcoming') return s.status === 'Upcoming';
    if (activeTab === 'Completed') return s.status === 'Completed';
    if (activeTab === 'Cancelled') return s.status === 'Cancelled';
    return true;
  });

  const handleToggleTopic = (sessionId, topicName) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            topics: s.topics.map((t) =>
              t.name === topicName ? { ...t, done: !t.done } : t
            ),
          };
        }
        return s;
      })
    );
  };

  const handleAddTopic = (sessionId) => {
    if (!newTopicInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            topics: [...s.topics, { name: newTopicInput.trim(), done: false }],
          };
        }
        return s;
      })
    );
    setNewTopicInput('');
  };

  const handleSendMessage = (sessionId) => {
    if (!newMessage.trim()) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              { sender: 'Hannah', text: newMessage, time: 'Just now', isSelf: true },
            ],
          };
        }
        return s;
      })
    );
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
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
      <div className="flex gap-2 border-b border-border-subtle/80 pb-3">
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => {
          const isActive = activeTab === tab;
          const count = tutorSessions.filter((s) => s.status === tab).length;
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
                      <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                        {session.title}
                        <Badge variant="green">{session.status}</Badge>
                      </h3>
                      <p className="text-xs text-text-muted">
                        Student: <span className="font-semibold text-text-main">{session.studentName}</span> • {session.datetime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                        {session.topics.map((t, idx) => (
                          <label
                            key={idx}
                            onClick={() => handleToggleTopic(session.id, t.name)}
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
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(session.id)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-card border border-border-subtle text-xs"
                          />
                          <button
                            onClick={() => handleAddTopic(session.id)}
                            className="p-1.5 px-3 rounded-xl bg-card-muted border border-border-subtle text-xs font-bold hover:bg-card text-text-main"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Completed Feedback */}
                      {session.status === 'Completed' && (
                        <div className="p-4 rounded-2xl bg-card-muted/70 border border-border-subtle text-xs">
                          <span className="text-xs font-bold text-text-main block mb-1">
                            Student Rating & Review (Read-only)
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {session.rating}.0
                          </div>
                          <p className="text-text-secondary italic">"{session.ratingComment}"</p>
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
                        {session.messages.map((m, idx) => (
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
                        ))}
                      </div>

                      <div className="p-2 border-t border-border-subtle bg-card flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Reply to student..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(session.id)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-card-muted border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <button
                          onClick={() => handleSendMessage(session.id)}
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
