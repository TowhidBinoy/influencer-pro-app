'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import GuideHelp from '../../components/GuideHelp';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { AFFILIATE_LINK_STATUS as LINK_STATUS_LABELS } from '../../../lib/choices';

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

const STATUS_TONE = {
  1: 'text-amber-400 bg-amber-950/80 border-amber-800/60',
  2: 'text-[#00D2FF] bg-[#0B1E2E] border-[#00D2FF]/40',
  3: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60',
  4: 'text-slate-400 bg-slate-900/80 border-slate-700',
};

export default function AffiliateLinksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUuid, setCopiedUuid] = useState(null);

  const [memberUuid, setMemberUuid] = useState(null);
  const [jobs, setJobs] = useState([]); // MemberJob rows with status = 2 ACTIVE
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadJobs = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.MY_JOBS(uuid)}?status=2&page_size=100`);
      setJobs(Array.isArray(data?.results) ? data.results : []);
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

  const handleCopy = (job) => {
    if (!job.affiliate_link) return;
    navigator.clipboard.writeText(job.affiliate_link);
    setCopiedUuid(job.uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  const filteredJobs = jobs.filter(
    (item) =>
      (item.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.org || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">My Affiliate Links</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-8 font-normal">
            Your affiliate links for each active job.
          </p>
        </div>

        <GuideHelp location={8} label="Tips for affiliate links" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadJobs(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or job..."
            className="w-full bg-[#120D22] border border-[#231A3D] focus:border-[#762CFF] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading affiliate links...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">No active jobs yet. Affiliate links appear once a job is approved.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredJobs.map((job) => {
              const hasLink = !!job.affiliate_link;
              return (
                <div key={job.uuid} className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1230] border-2 border-[#8B31FF] flex items-center justify-center text-xs font-bold text-white shadow-inner">
                        {(job.org || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{job.org}</h3>
                        <p className="text-[10px] text-slate-400">{job.job_title}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${STATUS_TONE[job.affiliate_link_status] || STATUS_TONE[1]}`}>
                      {LINK_STATUS_LABELS[job.affiliate_link_status] || 'Pending'}
                    </span>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">AFFILIATE LINK</p>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 bg-[#0E091D] border border-[#231A3D] rounded-xl px-3.5 py-2.5 text-xs font-mono truncate select-all ${
                        hasLink ? 'text-slate-300' : 'text-slate-500 italic'
                      }`}>
                        {hasLink ? job.affiliate_link : 'Not assigned yet'}
                      </div>
                      <button
                        onClick={() => handleCopy(job)}
                        disabled={!hasLink}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 shrink-0 ${
                          hasLink
                            ? copiedUuid === job.uuid
                              ? 'bg-emerald-500 text-black shadow-md'
                              : 'bg-[#762CFF] hover:bg-[#8B31FF] active:scale-95 text-white shadow-md shadow-[#762CFF]/30 cursor-pointer'
                            : 'bg-[#1E1735] text-slate-500 cursor-not-allowed border border-[#2B1F4A]'
                        }`}
                      >
                        {copiedUuid === job.uuid ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[22px] p-4 shadow-md space-y-1">
          <p className="text-[10px] font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
            <span>💡</span> TIP
          </p>
          <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
            Use the link assigned to the correct company/job. Your campaign manager sets this when your application is approved.
          </p>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-500 font-normal">
            Your affiliate links are private to your account.
          </p>
        </div>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
