'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import GuideHelp from '../components/GuideHelp';
import { apiFetch } from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';
import { PAYOUT_STATUS as PAYOUT_STATUS_LABELS } from '../../lib/choices';

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

function monthLabel(periodKey) {
  if (!periodKey) return '';
  const [y, m] = periodKey.split('-').map(Number);
  if (!y || !m) return periodKey;
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long' });
}

export default function EarningsPage() {
  const router = useRouter();

  const [memberUuid, setMemberUuid] = useState(null);
  const [earnings, setEarnings] = useState(null); // §32 response
  const [payouts, setPayouts] = useState([]); // §35 payout history
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [earningsResult, payoutsResult] = await Promise.allSettled([
        apiFetch(ENDPOINTS.MEMBER.EARNINGS(uuid)),
        apiFetch(`${ENDPOINTS.MEMBER.PAYOUTS(uuid)}?page_size=12`),
      ]);

      if (earningsResult.status === 'fulfilled') {
        setEarnings(earningsResult.value);
      } else {
        setLoadError(formatError(earningsResult.reason));
      }
      if (payoutsResult.status === 'fulfilled') {
        setPayouts(Array.isArray(payoutsResult.value?.results) ? payoutsResult.value.results : []);
      }
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
    loadData(uuid);
  }, [router, loadData]);

  const basePay = Number(earnings?.base_pay || 0);
  const deduction = Number(earnings?.deduction || 0);
  const total = Number(earnings?.total || 0);
  const monthName = monthLabel(earnings?.period_key);

  const daysLeft = earnings?.to_date
    ? Math.max(0, Math.ceil((new Date(earnings.to_date) - new Date()) / 86400000))
    : null;

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

        <GuideHelp location={3} label="Tips for earnings" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadData(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading earnings...</p>
          </div>
        ) : earnings ? (
          <>
            {/* This Month's Earnings */}
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">THIS MONTH&apos;S EARNINGS</p>

              <div className="mt-2 flex items-baseline gap-1.5">
                <h2 className="text-2xl font-bold text-white tracking-wide">{formatAmount(total)}</h2>
                <span className="text-xs font-medium text-slate-400">estimated total</span>
              </div>

              {daysLeft !== null && (
                <p className="text-[10px] text-slate-400 mt-1 font-normal">
                  {daysLeft} days left in {monthName}
                </p>
              )}
            </div>

            {/* Posted / Missed Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#120D22] border border-[#231A3D] rounded-[20px] p-3.5 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] font-semibold text-[#10B981] uppercase tracking-wider">POSTED COUNT</p>
                  <h3 className="text-lg font-bold text-white mt-0.5">{earnings.posted_count ?? 0}</h3>
                  <p className="text-[9px] text-slate-400 font-normal">Tasks Approved</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-xs">✓</div>
              </div>

              <Link
                href="/campaign"
                className="bg-[#120D22] border border-[#231A3D] hover:border-[#FF2A55] rounded-[20px] p-3.5 flex items-center justify-between shadow-md group transition-all"
              >
                <div>
                  <p className="text-[9px] font-semibold text-[#FF2A55] uppercase tracking-wider">MISSED COUNT</p>
                  <h3 className="text-lg font-bold text-white mt-0.5">{earnings.missed_count ?? 0}</h3>
                  <p className="text-[9px] text-slate-400 font-normal group-hover:text-white transition-colors">View Missed →</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-[#FF2A55] font-bold text-xs">✕</div>
              </Link>
            </div>

            {/* Breakdown */}
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-2.5">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase mb-1">EARNINGS BREAKDOWN</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Base Pay</span>
                <span className="text-[#10B981] font-semibold">{formatAmount(basePay)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Deduction (Missed {earnings.missed_count ?? 0} days)</span>
                <span className="text-[#FF2A55] font-semibold">- {formatAmount(deduction)}</span>
              </div>

              <div className="pt-3 border-t border-[#231A3D] flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">ESTIMATED TOTAL</span>
                <span className="text-2xl font-bold text-[#B13CFF] tracking-tight">{formatAmount(total)}</span>
              </div>
            </div>

            {/* Per-job breakdown */}
            {Array.isArray(earnings.jobs) && earnings.jobs.length > 0 && (
              <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
                <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase mb-1">BY JOB</p>
                {earnings.jobs.map((job) => (
                  <div key={job.member_job_uuid} className="flex items-center justify-between text-xs pb-2.5 border-b border-[#1C1438] last:border-0 last:pb-0">
                    <div>
                      <p className="text-white font-semibold">{job.job_title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{job.org} · {job.posted_count} posted, {job.missed_count} missed</p>
                    </div>
                    <span className="text-[#10B981] font-semibold">{formatAmount(job.total)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment History */}
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase mb-1">PAYMENT HISTORY</p>

              {payouts.length === 0 ? (
                <p className="text-xs text-slate-400">No payouts yet.</p>
              ) : (
                payouts.map((p) => (
                  <div key={p.uuid} className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold">{monthLabel(p.period_key)} {p.period_key?.split('-')[0]}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{formatAmount(p.amount)}</span>
                      <span className={`font-semibold text-[11px] ${p.status === 2 ? 'text-[#10B981]' : 'text-amber-400'}`}>
                        {PAYOUT_STATUS_LABELS[p.status] || ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* How You Earn */}
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4 shadow-md">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase flex items-center gap-1.5 mb-3">
                <span>💡</span> HOW YOU EARN
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs font-bold text-white">Post daily</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-normal">Earn base pay</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Get approved</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-normal">Count toward payout</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Avoid misses</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-normal">No deductions</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">No earnings data available yet.</p>
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
