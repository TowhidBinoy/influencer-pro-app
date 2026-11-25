'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import { apiFetch } from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';

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

export default function NotificationsPage() {
  const router = useRouter();
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
      const data = await apiFetch(`${ENDPOINTS.MEMBER.NOTIFICATIONS}${qs}`);
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setItems(rows);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    loadNotifications(filter === 'unread');
  }, [router, loadNotifications, filter]);

  const markOneRead = async (uuid) => {
    setItems((prev) => prev.map((n) => (n.uuid === uuid ? { ...n, is_read: true } : n)));
    try {
      await apiFetch(ENDPOINTS.MEMBER.NOTIFICATION_READ(uuid), { method: 'PATCH' });
    } catch {
      // best-effort; local state already updated
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiFetch(ENDPOINTS.MEMBER.NOTIFICATIONS_READ_ALL, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-35 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <header className="flex items-center justify-between px-5 pt-6 pb-2 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#762CFF]/30"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>
      </header>

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h1 className="text-xl font-bold tracking-wider text-white uppercase">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="text-[10px] font-bold text-[#B13CFF] hover:text-[#D4A8FF] transition-colors cursor-pointer disabled:opacity-50"
              >
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-1 flex items-center justify-between">
          {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
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

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading notifications...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center mx-auto text-slate-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-xs font-bold text-white">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Job updates and task status changes will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
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
            ))}
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
