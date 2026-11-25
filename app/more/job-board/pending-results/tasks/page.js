'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../../components/BottomNav';
import NotificationBell from '../../../../components/NotificationBell';
import { apiFetch } from '../../../../../lib/api';
import { ENDPOINTS } from '../../../../../lib/endpoints';
import { PLATFORM as PLATFORM_LABELS, CONTENT_TYPE as CONTENT_TYPE_LABELS } from '../../../../../lib/choices';

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

const EMPTY_FORM = { views: '', likes: '', comments: '', shares: '' };

function PendingResultTasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberJobUuid = searchParams.get('member_job_uuid');

  const [memberUuid, setMemberUuid] = useState(null);
  const [org, setOrg] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeUuid, setActiveUuid] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadTasks = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.JOB_PENDING_RESULTS(uuid, memberJobUuid));
      setOrg(data?.org || '');
      setJobTitle(data?.job_title || '');
      const rows = Array.isArray(data?.tasks) ? data.tasks : [];
      setTasks(rows);
      setActiveUuid(rows[0]?.uuid || null);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [memberJobUuid]);

  useEffect(() => {
    const cachedUserStr = localStorage.getItem('imp_user');
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    if (!memberJobUuid) { router.push('/more/job-board/pending-results'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadTasks(uuid);
  }, [router, memberJobUuid, loadTasks]);

  const openTask = (uuid) => {
    setActiveUuid(uuid);
    setForm(EMPTY_FORM);
    setScreenshot(null);
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasAnyField = ['views', 'likes', 'comments', 'shares'].some((k) => form[k] !== '') || screenshot;
    if (!hasAnyField) {
      setSubmitError('Enter at least one metric or upload a screenshot.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const isMultipart = !!screenshot;
      let body;
      if (isMultipart) {
        const fd = new FormData();
        ['views', 'likes', 'comments', 'shares'].forEach((k) => {
          if (form[k] !== '') fd.append(k, form[k]);
        });
        fd.append('metrics_screenshot', screenshot);
        body = fd;
      } else {
        const payload = {};
        ['views', 'likes', 'comments', 'shares'].forEach((k) => {
          if (form[k] !== '') payload[k] = Number(form[k]);
        });
        body = JSON.stringify(payload);
      }

      await apiFetch(ENDPOINTS.MEMBER.TASK_RESULT(memberUuid, activeUuid), {
        method: 'POST',
        body,
      });

      const remaining = tasks.filter((t) => t.uuid !== activeUuid);
      setTasks(remaining);
      openTask(remaining[0]?.uuid || null);
    } catch (err) {
      setSubmitError(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">

      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      <header className="flex items-center justify-between px-5 pt-6 pb-2 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#762CFF]/30"
            style={{ background: 'linear-gradient(135deg, #B13CFF 0%, #762CFF 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>

        <NotificationBell />
      </header>

      <main className="z-10 space-y-3.5 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/more/job-board/pending-results')}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase truncate">{jobTitle || 'Complete Results'}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">{org}</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadTasks(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
            <span className="text-sm font-black text-white">{tasks.length}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl space-y-1">
            <p className="text-xs font-bold text-emerald-400">All done!</p>
            <p className="text-[11px] text-slate-400">Every day for this job has a result submitted.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isActive = task.uuid === activeUuid;
              return (
                <div
                  key={task.uuid}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isActive ? 'bg-[#191133] border-[#762CFF]/60' : 'bg-[#120D22] border-[#231A3D]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openTask(task.uuid)}
                    className="w-full flex items-center justify-between gap-2 p-3.5 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1D1438] border border-[#2B1F4A] flex items-center justify-center text-[10px] font-black text-[#B13CFF] shrink-0">
                        {task.day_number}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">Day {task.day_number}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {CONTENT_TYPE_LABELS[task.content_type] || 'Post'} · {PLATFORM_LABELS[task.platform] || ''}
                        </span>
                      </div>
                    </div>
                    <span className={`text-slate-400 text-xs transition-transform duration-200 ${isActive ? 'rotate-90 text-[#B13CFF]' : ''}`}>›</span>
                  </button>

                  {isActive && (
                    <form onSubmit={handleSubmit} className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-[#231A3D]">
                      {submitError && (
                        <div className="p-2.5 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-[11px] font-semibold rounded-xl">
                          {submitError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { key: 'views', label: 'Views' },
                          { key: 'likes', label: 'Likes' },
                          { key: 'comments', label: 'Comments' },
                          { key: 'shares', label: 'Shares' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{f.label}</label>
                            <input
                              type="number"
                              min="0"
                              value={form[f.key]}
                              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                              placeholder="0"
                              className="w-full bg-[#18112E] border border-[#281B45] focus:border-[#762CFF] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Story View Screenshot</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2A1B4E] file:text-white hover:file:bg-[#762CFF] cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                        className="w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-70"
                      >
                        {isSubmitting ? 'Saving...' : 'Save & Next'}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function PendingResultTasksPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xs">Loading...</div>}>
      <PendingResultTasksContent />
    </Suspense>
  );
}
