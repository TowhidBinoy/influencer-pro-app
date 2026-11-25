'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { JOB_RECURRENCE as RECURRENCE_LABELS } from '../../../../lib/choices';

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

const ACTIVE_STATUS = 2;

export default function SelectJobPage() {
  const router = useRouter();
  const [memberUuid, setMemberUuid] = useState(null);
  const [jobs, setJobs] = useState([]); // active MemberJob rows, has_frames only
  const [tasksByMemberJob, setTasksByMemberJob] = useState({}); // member_job_uuid -> task
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadJobs = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [myJobsRes, tasksRes] = await Promise.allSettled([
        apiFetch(`${ENDPOINTS.MEMBER.MY_JOBS(uuid)}?page_size=100`),
        apiFetch(ENDPOINTS.MEMBER.TASKS_TODAY(uuid)),
      ]);

      if (myJobsRes.status === 'fulfilled') {
        const rows = Array.isArray(myJobsRes.value?.results) ? myJobsRes.value.results : [];
        setJobs(rows.filter((j) => j.status === ACTIVE_STATUS && j.has_frames));
      } else {
        setLoadError(formatError(myJobsRes.reason));
      }

      if (tasksRes.status === 'fulfilled') {
        const rows = Array.isArray(tasksRes.value) ? tasksRes.value : [];
        const map = {};
        rows.forEach((t) => { map[t.member_job_uuid] = t; });
        setTasksByMemberJob(map);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    const cachedUserStr = localStorage.getItem('imp_user');
    if (!token) { router.push('/login'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadJobs(uuid);
  }, [router, loadJobs]);

  const handleSelectJob = (memberJob) => {
    const task = tasksByMemberJob[memberJob.uuid];
    const qs = new URLSearchParams({
      member_job_uuid: memberJob.uuid,
      ...(task?.uuid ? { task_uuid: task.uuid } : {}),
    });
    router.push(`/more/frame-editor/import?${qs.toString()}`);
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-wider text-white">INFLUENCER PRO</span>
        </div>
        <NotificationBell />
      </header>

      <main className="z-10 space-y-3.5 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">FRAME EDITOR</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-6 font-normal">Choose the job you are creating content for.</p>
        </div>

        <div className="p-3.5 bg-[#2A1B0E]/60 border border-amber-800/40 rounded-2xl flex items-start gap-2">
          <span className="text-amber-400 text-sm">💡</span>
          <div>
            <p className="text-[11px] font-bold text-amber-400">FRAMES ARE JOB-SPECIFIC</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Only frames assigned to the selected job will be shown.</p>
          </div>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadJobs(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl space-y-1">
            <p className="text-xs text-white font-bold">No frames ready yet</p>
            <p className="text-[11px] text-slate-400">None of your active jobs have a frame assigned. Check back once your campaign frame is ready.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.uuid} className="bg-[#120D22] border border-[#231A3D] rounded-[22px] p-4 space-y-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center text-[#B13CFF] shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{job.org}</p>
                    <p className="text-[10px] text-slate-400 truncate">{job.job_title}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 bg-[#18112E] border border-[#2B1F4A] px-2.5 py-1 rounded-full">
                    {RECURRENCE_LABELS[job.recurrence] || 'Daily'} posting
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    FRAME READY <span>✓</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectJob(job)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#762CFF] to-[#B13CFF] hover:from-[#8836FF] hover:to-[#BD4EFF] text-white text-xs font-bold shadow-md shadow-[#762CFF]/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Select Job ➔
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && jobs.length > 0 && (
          <p className="text-center text-[10px] text-slate-500 pt-1">You can change your selected job before importing a video.</p>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
