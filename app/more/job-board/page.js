'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';
import NotificationBell from '../../components/NotificationBell';
import GuideHelp from '../../components/GuideHelp';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { PAYMENT_PERIOD as PAYMENT_PERIOD_LABELS, MEMBER_JOB_STATUS as MEMBER_JOB_STATUS_LABELS } from '../../../lib/choices';

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

const TABS = ['My Job', 'Available', 'Completed'];

export default function JobBoardPage() {
  const router = useRouter();
  const [memberUuid, setMemberUuid] = useState(null);
  const [activeTab, setActiveTab] = useState('My Job');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [myJobs, setMyJobs] = useState([]); // MemberJob rows, all statuses
  const [availableJobs, setAvailableJobs] = useState([]); // Job rows, open to apply
  const [pendingResultsCount, setPendingResultsCount] = useState(0);

  const loadData = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [myJobsResult, availableResult, pendingResultsResult] = await Promise.allSettled([
        apiFetch(`${ENDPOINTS.MEMBER.MY_JOBS(uuid)}?page_size=100`),
        apiFetch(`${ENDPOINTS.MEMBER.AVAILABLE_JOBS(uuid)}?page_size=100`),
        apiFetch(ENDPOINTS.MEMBER.JOBS_PENDING_RESULTS(uuid)),
      ]);

      if (myJobsResult.status === 'fulfilled') {
        setMyJobs(Array.isArray(myJobsResult.value?.results) ? myJobsResult.value.results : []);
      }
      if (availableResult.status === 'fulfilled') {
        setAvailableJobs(Array.isArray(availableResult.value?.results) ? availableResult.value.results : []);
      }
      if (pendingResultsResult.status === 'fulfilled') {
        const rows = Array.isArray(pendingResultsResult.value) ? pendingResultsResult.value : [];
        setPendingResultsCount(rows.reduce((sum, job) => sum + (job.pending_result_count || 0), 0));
      }
      if (myJobsResult.status === 'rejected' && availableResult.status === 'rejected') {
        setLoadError(formatError(myJobsResult.reason));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedUserStr = localStorage.getItem('imp_user');
    const token = localStorage.getItem('imp_access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    let parsedUser = null;
    if (cachedUserStr) {
      try { parsedUser = JSON.parse(cachedUserStr); } catch { /* ignore */ }
    }

    const uuid = parsedUser?.uuid;
    if (!uuid) {
      router.push('/login');
      return;
    }
    setMemberUuid(uuid);
    loadData(uuid);
  }, [router, loadData]);

  // My Job tab: everything not yet completed/rejected (applied or active)
  const activeMyJobs = myJobs.filter((j) => j.status === 1 || j.status === 2);
  // Completed tab: completed or rejected
  const completedJobs = myJobs.filter((j) => j.status === 3 || j.status === 4);
  // Available jobs the member hasn't already applied to / isn't on
  const appliedJobUuids = new Set(myJobs.map((j) => j.job_uuid));
  const openJobs = availableJobs.filter((j) => !appliedJobUuids.has(j.uuid));

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
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">Job Board</h1>
          </div>
        </div>

        <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-1 flex items-center justify-between">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  isActive ? 'bg-[#8B31FF] text-white shadow-md shadow-[#8B31FF]/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {pendingResultsCount > 0 && (
          <Link
            href="/more/job-board/pending-results"
            className="flex items-center justify-between gap-3 bg-amber-950/40 border border-amber-800/60 hover:border-amber-500/60 rounded-2xl p-3.5 transition-all cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-amber-300 block">Results still needed</span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">{pendingResultsCount} day{pendingResultsCount === 1 ? '' : 's'} waiting for a performance result</span>
            </div>
            <span className="text-amber-400 text-sm font-semibold shrink-0">›</span>
          </Link>
        )}

        <GuideHelp location={7} label="Tips for the job board" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadData(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {isLoading ? (
            <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
              <p className="text-xs text-slate-400">Loading jobs...</p>
            </div>
          ) : activeTab === 'My Job' ? (
            activeMyJobs.length > 0 ? activeMyJobs.map((job) => (
              <JobCard
                key={job.uuid}
                title={job.job_title}
                company={job.org}
                payment={formatAmount(job.payment_amount)}
                period={PAYMENT_PERIOD_LABELS[job.payment_period] || ''}
                statusLabel={MEMBER_JOB_STATUS_LABELS[job.status]}
                buttonText="View Job"
                onAction={() => router.push(`/more/job-board/job-overview?member_job_uuid=${job.uuid}&job_uuid=${job.job_uuid}&org_uuid=${job.org_uuid}`)}
              />
            )) : <EmptyState text="You haven't applied to any jobs yet." />
          ) : activeTab === 'Available' ? (
            openJobs.length > 0 ? openJobs.map((job) => (
              <JobCard
                key={job.uuid}
                title={job.title}
                company={job.org}
                payment={formatAmount(job.payment_amount)}
                period={PAYMENT_PERIOD_LABELS[job.payment_period] || ''}
                buttonText="View & Apply"
                onAction={() => router.push(`/more/job-board/view-job?job_uuid=${job.uuid}&org_uuid=${job.org_uuid}`)}
              />
            )) : <EmptyState text="No open jobs right now. Check back soon." />
          ) : (
            completedJobs.length > 0 ? completedJobs.map((job) => (
              <JobCard
                key={job.uuid}
                title={job.job_title}
                company={job.org}
                payment={formatAmount(job.payment_amount)}
                period={PAYMENT_PERIOD_LABELS[job.payment_period] || ''}
                statusLabel={MEMBER_JOB_STATUS_LABELS[job.status]}
              />
            )) : <EmptyState text="No completed jobs yet." />
          )}
        </div>

        {activeTab === 'My Job' && (
          <InfoCard icon="💡" title="HOW YOUR JOB WORKS" text="Complete your daily tasks, submit your proof, and get paid according to the job terms." />
        )}
        {activeTab === 'Available' && (
          <InfoCard icon="💡" title="BEFORE YOU APPLY" text="Make sure you can commit to the daily posting schedule before applying for this job." />
        )}
        {activeTab === 'Completed' && (
          <InfoCard icon="📁" title="JOB HISTORY" text="Jobs you've finished or that were closed out are shown here." />
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}

function JobCard({ title, company, payment, period, statusLabel, buttonText, onAction }) {
  return (
    <div className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF]/60 rounded-[24px] p-4.5 shadow-md space-y-3 transition-all">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#D6249F]/20 p-2"
          style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-black tracking-wide text-white leading-snug">{title}</h3>
          <p className="text-[10px] text-[#B991FF] mt-0.5">{company}</p>
        </div>
        {statusLabel && (
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 self-start">
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between pt-1">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Payment</span>
          <div className="text-base font-extrabold text-white">
            {payment} <span className="text-xs font-semibold text-slate-300">/ {period}</span>
          </div>
        </div>

        {buttonText && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-[#8B31FF]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="bg-[#120D22] border border-[#231A3D] rounded-[22px] p-4 shadow-md space-y-1.5 mt-4">
      <p className="text-[10px] font-bold text-[#B991FF] tracking-wider uppercase flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </p>
      <p className="text-[11px] text-slate-300 font-normal leading-relaxed">{text}</p>
    </div>
  );
}
