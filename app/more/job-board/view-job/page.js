'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { PLATFORM as PLATFORM_LABELS, CONTENT_TYPE as CONTENT_TYPE_LABELS, JOB_RECURRENCE as RECURRENCE_LABELS, PAYMENT_PERIOD as PAYMENT_PERIOD_LABELS } from '../../../../lib/choices';

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

function formatAmount(amount) {
  return `RM${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function ViewJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobUuid = searchParams.get('job_uuid');

  const [memberUuid, setMemberUuid] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isApplying, setIsApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState({ type: '', text: '' });

  const loadJob = useCallback(async (uuid, jUuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.AVAILABLE_JOB(uuid, jUuid));
      setJob(data);
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
    if (!jobUuid) { router.push('/more/job-board'); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(cachedUserStr || 'null'); } catch { /* ignore */ }
    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }

    setMemberUuid(uuid);
    loadJob(uuid, jobUuid);
  }, [router, jobUuid, loadJob]);

  const handleApply = async () => {
    if (!memberUuid || !jobUuid) return;
    setIsApplying(true);
    setApplyMsg({ type: '', text: '' });
    try {
      await apiFetch(ENDPOINTS.MEMBER.AVAILABLE_JOB_APPLY(memberUuid, jobUuid), { method: 'POST' });
      setApplyMsg({ type: 'success', text: 'Application submitted! We will notify you once reviewed.' });
      setTimeout(() => router.push('/more/job-board'), 1500);
    } catch (err) {
      setApplyMsg({ type: 'error', text: formatError(err) });
    } finally {
      setIsApplying(false);
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

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">Job Details</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">Everything you need before accepting this job.</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadJob(memberUuid, jobUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading job...</p>
          </div>
        ) : job ? (
          <>
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#B991FF] tracking-wider uppercase block">{job.org}</span>
                  <h2 className="text-base font-black text-white mt-0.5 tracking-wide">{job.title}</h2>
                </div>
                {job.is_live && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Live
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#231A3D]/60">
                <div>
                  <span className="text-[9px] font-medium text-slate-400 block uppercase">Duration</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    {formatDate(job.start_date)} — {job.end_date ? formatDate(job.end_date) : 'Ongoing'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-medium text-slate-400 block uppercase">Base payment</span>
                  <span className="text-xs font-black text-[#B13CFF] mt-0.5 block">
                    {formatAmount(job.payment_amount)} / {PAYMENT_PERIOD_LABELS[job.payment_period] || ''}
                  </span>
                </div>
              </div>

              {job.description && <p className="text-[10px] text-slate-400 font-normal pt-0.5">{job.description}</p>}
            </div>

            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-2.5">
              <h3 className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase">YOUR REQUIREMENTS</h3>
              {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                <ul className="space-y-2 pt-1">
                  {job.requirements.map((req) => (
                    <li key={req.uuid} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B13CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{req.quantity}x {CONTENT_TYPE_LABELS[req.content_type] || ''} on {PLATFORM_LABELS[req.platform] || ''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No specific requirements listed.</p>
              )}
              <p className="text-[9px] text-slate-500 font-normal pt-1">
                Posting cadence: {RECURRENCE_LABELS[job.recurrence] || '—'}. Missed requirements may affect payment.
              </p>
            </div>

            {job.deduction_per_miss && (
              <div className="bg-[#120D22] border border-[#231A3D] rounded-[22px] p-3.5 shadow-md flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Missed posting penalty</span>
                <span className="text-xs font-bold text-[#FF2A55]">-{formatAmount(job.deduction_per_miss)} / missed day</span>
              </div>
            )}

            {applyMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                applyMsg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400' : 'bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55]'
              }`}>
                <span>{applyMsg.type === 'success' ? '✓' : '⚠️'}</span>
                <p>{applyMsg.text}</p>
              </div>
            )}

            {job.is_applied ? (
              <div className="p-3.5 rounded-xl text-xs font-bold text-center bg-[#18112E] border border-[#2B1F4A] text-slate-300">
                You've already applied to this job.
              </div>
            ) : (
              <div className="pt-1">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-lg shadow-[#762CFF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center disabled:opacity-70"
                >
                  {isApplying ? 'Applying...' : 'Apply for This Job'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Job not found.</p>
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

export default function ViewJobPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xs">Loading job...</div>}>
      <ViewJobContent />
    </Suspense>
  );
}
