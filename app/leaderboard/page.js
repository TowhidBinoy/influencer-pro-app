'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import GuideHelp from '../components/GuideHelp';
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

function formatAmount(amount) {
  return `RM${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const cachedUserStr = localStorage.getItem('imp_user');
      const phoneNumber = cachedUserStr ? JSON.parse(cachedUserStr)?.phone_number : null;

      const results = await Promise.allSettled([
        apiFetch(ENDPOINTS.MEMBER.INFLUENCER_LEADERBOARD),
        phoneNumber ? apiFetch(ENDPOINTS.MEMBER.INFLUENCER_RANK(phoneNumber)) : Promise.resolve(null),
      ]);

      const [leaderboardRes, rankRes] = results;
      if (leaderboardRes.status === 'fulfilled') {
        setRows(Array.isArray(leaderboardRes.value) ? leaderboardRes.value : []);
      } else {
        setLoadError(formatError(leaderboardRes.reason));
      }
      if (rankRes.status === 'fulfilled' && rankRes.value) {
        setMyRank(rankRes.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    load();
  }, [router, load]);

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
      </header>

      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">

        <div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase">Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Ranked by total deposit amount this month.</p>
        </div>

        <GuideHelp location={6} label="Tips for the leaderboard" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={load} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {myRank && (
          <div className="bg-gradient-to-r from-[#2A1854] to-[#1D1438] border border-[#762CFF]/50 rounded-2xl p-4 shadow-md shadow-[#762CFF]/20">
            <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider mb-1.5">Your Rank</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-white">
                  {myRank.rank ? `#${myRank.rank}` : 'Unranked'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{myRank.reg_count} referred · {myRank.cvs_count} converted</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-mono font-bold text-sm">{formatAmount(myRank.deposit_amount)}</p>
                {myRank.next_rank && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatAmount(myRank.next_rank_amount)} to reach #{myRank.next_rank}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading leaderboard...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">No ranked influencers this month yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.member_uuid}
                className="bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg font-black text-[#B13CFF] w-8 text-center shrink-0">{RANK_MEDAL[r.rank] || `#${r.rank}`}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{r.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.phone_number}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-mono font-bold text-xs">{formatAmount(r.deposit_amount)}</p>
                  <p className="text-[9px] text-slate-500">{r.reg_count} reg · {r.cvs_count} conv</p>
                </div>
              </div>
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
