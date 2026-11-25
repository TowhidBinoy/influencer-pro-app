'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';

function formatError(err) {
  if (err?.error) return err.error;
  if (err?.detail) return err.detail;
  if (err?.details && typeof err.details === 'string') return err.details;
  if (err?.details && typeof err.details === 'object') {
    const firstKey = Object.keys(err.details)[0];
    const val = err.details[firstKey];
    return Array.isArray(val) ? val[0] : val;
  }
  return 'Something went wrong. Please try again.';
}

const TYPE_ICON = { 1: '💼', 2: '📋', 3: '📤', 4: '✅', 5: '❌' };

function formatWhen(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

/**
 * Admin's own notification feed (doc/API.md §35, /notifications/) — scoped
 * to request.user server-side, so this is a different feed than the member
 * bell even though it's the same endpoint. Admins get TASK_SUBMITTED.
 */
export default function AdminNotificationsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async (unreadOnly) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const qs = unreadOnly ? '?unread=1&page_size=50' : '?page_size=50';
      const data = await apiFetch(`${ENDPOINTS.ADMIN.NOTIFICATIONS}${qs}`);
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setItems(rows);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(filter === 'unread'); }, [loadNotifications, filter]);

  const markOneRead = async (uuid) => {
    setItems((prev) => prev.map((n) => (n.uuid === uuid ? { ...n, is_read: true } : n)));
    try {
      await apiFetch(ENDPOINTS.ADMIN.NOTIFICATION_READ(uuid), { method: 'PATCH' });
    } catch {
      // best-effort; local state already updated
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiFetch(ENDPOINTS.ADMIN.NOTIFICATIONS_READ_ALL, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Notifications</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Job, task and submission activity across the platform.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="text-xs font-bold text-[#B13CFF] hover:text-[#D4A8FF] transition-colors cursor-pointer disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-1 flex items-center gap-1 w-fit">
        {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.key ? 'bg-[#8B31FF] text-white shadow-md shadow-[#8B31FF]/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <span>{loadError}</span>
          <button onClick={() => loadNotifications(filter === 'unread')} className="underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-2 flex-1">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading notifications...</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        ) : (
          items.map((n) => (
            <button
              key={n.uuid}
              onClick={() => !n.is_read && markOneRead(n.uuid)}
              className={`w-full text-left border rounded-2xl p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                n.is_read ? 'bg-[#18112E] border-[#261A45]' : 'bg-[#1D1438] border-[#762CFF]/50 shadow-md shadow-[#762CFF]/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#241744] border border-[#2B1F4A] flex items-center justify-center text-sm shrink-0">
                {TYPE_ICON[n.notification_type] || '🔔'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white truncate">{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#B13CFF] shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-500 mt-1">{formatWhen(n.created)}</p>
              </div>
            </button>
          ))
        )}
      </div>

    </div>
  );
}
