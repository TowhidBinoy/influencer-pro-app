'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';

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

export default function PendingResultsPage() {
  const router = useRouter();
  const [memberUuid, setMemberUuid] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadJobs = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.JOBS_PENDING_RESULTS(uuid));
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedUserStr = localStorage.getItem('imp_user');
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadJobs(uuid);
  }, [router, loadJobs]);

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

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">Complete Results</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">
            Jobs that still need a performance result submitted.
          </p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadJobs(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
              <p className="text-xs text-slate-400">Loading...</p>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <button
                key={job.uuid}
                onClick={() => router.push(`/more/job-board/pending-results/tasks?member_job_uuid=${job.uuid}`)}
                className="w-full text-left bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF]/60 rounded-[24px] p-4.5 shadow-md flex items-center justify-between gap-3 transition-all cursor-pointer"
              >
                <div className="min-w-0">
                  <h3 className="text-xs font-black tracking-wide text-white leading-snug truncate">{job.job_title}</h3>
                  <p className="text-[10px] text-[#B991FF] mt-0.5">{job.org}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {job.pending_result_count} pending
                  </span>
                  <span className="text-slate-500 text-sm font-semibold">›</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
              <p className="text-xs text-slate-400">You&apos;re all caught up — no pending results.</p>
            </div>
          )}
        </div>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
