import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { Badge } from '../../components/primitives/Badge';
import { placeholderData } from '../../data/placeholderData';
import { Send, Star, ChevronDown, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export function StudentSessionsPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [sessions, setSessions] = useState(placeholderData.sessions);
  const [expandedSessionId, setExpandedSessionId] = useState('sess-101');
  const [newMessage, setNewMessage] = useState('');
  const [ratedSessions, setRatedSessions] = useState({});

  const studentSessions = sessions.filter((s) => s.role === 'student' || s.studentName === 'Hannah');

  const filteredSessions = studentSessions.filter((s) => {
    if (activeTab === 'Pending') return s.status === 'Pending';
    if (activeTab === 'Upcoming') return s.status === 'Upcoming';
    if (activeTab === 'Completed') return s.status === 'Completed';
    if (activeTab === 'Cancelled') return s.status === 'Cancelled' || s.status === 'Rejected';
    return true;
  });

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

  const handleCancelSession = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'Cancelled' } : s))
    );
  };

  const handleWithdrawPending = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleRate = (sessionId, stars) => {
    setRatedSessions((prev) => ({ ...prev, [sessionId]: stars }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          My Sessions
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage your bookings, live chat with tutors, and track topic checklists.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-subtle/80 pb-3">
        {['Upcoming', 'Pending', 'Completed', 'Cancelled'].map((tab) => {
          const isActive = activeTab === tab;
          const count = studentSessions.filter((s) =>
            tab === 'Cancelled'
              ? s.status === 'Cancelled' || s.status === 'Rejected'
              : s.status === tab
          ).length;

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

      {/* Sessions Stack */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-3xl border border-border-subtle text-text-muted text-sm">
            No {activeTab.toLowerCase()} sessions found.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <Card key={session.id} padding="p-5 sm:p-6" className="space-y-4">
                {/* Row Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent-muted text-accent flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                        {session.title}
                        <Badge
                          variant={
                            session.status === 'Upcoming'
                              ? 'accent'
                              : session.status === 'Completed'
                              ? 'green'
                              : 'muted'
                          }
                        >
                          {session.status}
                        </Badge>
                      </h3>
                      <p className="text-xs text-text-muted">
                        With <span className="font-semibold text-text-main">{session.tutorName}</span> • {session.datetime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === 'Pending' && (
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleWithdrawPending(session.id)}
                      >
                        Withdraw Request
                      </PillButton>
                    )}

                    {session.status === 'Upcoming' && (
                      <PillButton
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:bg-rose-500/10"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancel
                      </PillButton>
                    )}

                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    >
                      {isExpanded ? 'Collapse' : 'Details & Chat'}
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </PillButton>
                  </div>
                </div>

                {/* Pending Slot hint */}
                {session.status === 'Pending' && session.pendingHint && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{session.pendingHint}</span>
                  </div>
                )}

                {/* Expanded Details: Topics checklist & Chat */}
                {isExpanded && (
                  <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    {/* Left: Read-only Topic Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Session Topic Checklist (Read-only)
                      </h4>
                      <div className="space-y-2 bg-card-muted/50 p-4 rounded-2xl border border-border-subtle">
                        {session.topics.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  t.done
                                    ? 'bg-emerald-500 text-white'
                                    : 'border border-border-subtle text-text-muted'
                                }`}
                              >
                                {t.done ? '✓' : ''}
                              </span>
                              <span
                                className={t.done ? 'line-through text-text-muted font-medium' : 'text-text-main font-semibold'}
                              >
                                {t.name}
                              </span>
                            </div>
                            {t.askedByStudent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-muted text-accent font-semibold">
                                You requested
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Completed Session Rating */}
                      {session.status === 'Completed' && (
                        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                          <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                            Rate your session with {session.tutorName}
                          </h5>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRate(session.id, star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    (ratedSessions[session.id] || session.rating) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-text-muted'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-text-muted ml-2">
                              {(ratedSessions[session.id] || session.rating) ? 'Rating recorded' : 'Tap to rate'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Integrated Chat Thread */}
                    <div className="flex flex-col h-72 bg-card-muted/40 rounded-2xl border border-border-subtle overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-border-subtle bg-card-muted/80 flex items-center gap-2 text-xs font-bold text-text-main">
                        <MessageSquare className="w-3.5 h-3.5 text-accent" />
                        <span>Chat with {session.tutorName}</span>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                        {session.messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-text-muted text-center px-4">
                            {session.status === 'Pending'
                              ? 'Chat will unlock once the tutor accepts your booking.'
                              : 'No messages yet. Send a message to start!'}
                          </div>
                        ) : (
                          session.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${
                                m.isSelf ? 'items-end' : 'items-start'
                              }`}
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

                      {session.status !== 'Pending' && (
                        <div className="p-2 border-t border-border-subtle bg-card flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(session.id)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-card-muted border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                          <button
                            onClick={() => handleSendMessage(session.id)}
                            className="p-2 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
