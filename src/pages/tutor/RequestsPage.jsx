import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { Badge } from '../../components/primitives/Badge';
import { Clock, Check, X, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useModeTheme } from '../../context/ModeThemeContext';
import { useToast } from '../../context/ToastContext';

export function RequestsPage() {
  const { refreshBadges } = useModeTheme();
  const { showToast } = useToast();
  const [slotGroups, setSlotGroups] = useState([]);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await apiRequest('/api/tutor/requests');
      if (Array.isArray(data)) setSlotGroups(data);
    } catch (err) {
      showToast(err.message || 'Could not load session requests.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAcceptRequest = async (slotTime, reqId, studentName) => {
    try {
      const res = await apiRequest(`/api/tutor/requests/${reqId}/accept`, { method: 'POST' });
      await fetchRequests();
      refreshBadges();
      const extraMsg = res?.rejectedCount > 0
        ? ` ${res.rejectedCount} conflicting request(s) for this slot were automatically rejected with reason "Slot was taken".`
        : '';
      const notice = `Accepted ${studentName}'s booking for ${slotTime}!${extraMsg}`;
      setActionNotice(notice);
      showToast(notice, 'success');
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      const msg = err.message || 'Could not accept request.';
      setActionNotice(msg);
      showToast(msg, 'error');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRejectRequest = async (slotTime, reqId, studentName) => {
    try {
      await apiRequest(`/api/tutor/requests/${reqId}/reject`, { method: 'POST' });
      await fetchRequests();
      refreshBadges();
      const notice = `Rejected request from ${studentName}.`;
      setActionNotice(notice);
      showToast(notice, 'info');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      const msg = err.message || 'Could not reject request.';
      setActionNotice(msg);
      showToast(msg, 'error');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const totalPending = slotGroups.reduce((acc, g) => acc + g.requests.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
          Incoming Session Requests
          {totalPending > 0 && <Badge variant="accent">{totalPending}</Badge>}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Requests are grouped by requested time slot. Accepting one booking cleanly auto-rejects conflicting slot requests.
        </p>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-accent-muted border border-accent/30 text-accent font-semibold text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Slots Stack */}
      {slotGroups.length === 0 ? (
        <Card className="p-12 text-center text-text-muted text-sm">
          No pending session requests at this time.
        </Card>
      ) : (
        slotGroups.map((group) => (
          <div key={group.slotId || group.slotTime} className="space-y-3">
            {/* Slot Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2">
              <div className="flex items-center gap-2 font-bold text-sm text-text-main">
                <Clock className="w-4 h-4 text-accent" />
                <span>{group.slotTime}</span>
                <span className="text-xs text-text-muted font-normal">
                  ({group.requests.length} student{group.requests.length === 1 ? '' : 's'} requested this slot)
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-card-muted text-text-secondary border border-border-subtle">
                {group.skill}
              </span>
            </div>

            {/* Request Cards for this Slot */}
            <div className="space-y-3">
              {group.requests.map((req) => (
                <Card key={req.id} padding="p-5" className="border-border-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={req.avatar}
                        alt={req.studentName}
                        className="w-12 h-12 rounded-full object-cover border border-border-subtle mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-main">
                            {req.studentName}
                          </h3>
                          <span className="text-[11px] text-text-muted font-medium">
                            • {req.requestedAt}
                          </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span className="bg-card-muted px-2 py-0.5 rounded-lg border border-border-subtle">
                            {req.stats.completed} sessions completed
                          </span>
                          <span className="bg-card-muted px-2 py-0.5 rounded-lg border border-border-subtle">
                            Quiz score: {req.stats.quizScore}
                          </span>
                          <span className="bg-accent-muted text-accent font-bold px-2.5 py-0.5 rounded-lg border border-accent/20">
                            ₹{req.feeInr ?? 99}/hr
                          </span>
                        </div>

                        {/* Topics student asked for */}
                        {req.topics?.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                              Requested topics:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {req.topics.map((t) => (
                                <span
                                  key={t}
                                  className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-accent-muted text-accent"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {req.message && (
                          <p className="text-xs text-text-secondary italic pt-1">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center sm:shrink-0">
                      <PillButton
                        variant="secondary"
                        size="sm"
                        icon={X}
                        onClick={() =>
                          handleRejectRequest(group.slotTime, req.id, req.studentName)
                        }
                      >
                        Reject
                      </PillButton>

                      <PillButton
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() =>
                          handleAcceptRequest(group.slotTime, req.id, req.studentName)
                        }
                      >
                        Accept
                      </PillButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
