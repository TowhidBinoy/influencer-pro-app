'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import NotificationBell from '../../components/NotificationBell';
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

const RULES_LOCATION = 5; // GUIDE_LOCATION: 5 = RULES

export default function RulesAndHowItWorksPage() {
  const router = useRouter();
  const [activeGuide, setActiveGuide] = useState(null);
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadGuides = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.GUIDES}?location=${RULES_LOCATION}&page_size=50`);
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      rows.sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
      setGuides(rows);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    loadGuides();
  }, [router, loadGuides]);

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
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">POSTING RULES</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-6 font-normal">Follow these rules to keep your job on track.</p>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={loadGuides} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading rules...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">No rules have been published yet.</p>
          </div>
        ) : (
          <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-[#1D1438] border border-[#2B1F4A] flex items-center justify-center text-[#B13CFF] shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
              </div>
              <p className="text-[10px] font-bold text-[#B13CFF] uppercase tracking-wider">HOW IT WORKS</p>
            </div>

            <div className="space-y-2">
              {guides.map((guide, idx) => {
                const isExpanded = activeGuide === guide.uuid;
                return (
                  <div
                    key={guide.uuid}
                    onClick={() => setActiveGuide(isExpanded ? null : guide.uuid)}
                    className={`border rounded-[18px] p-3 transition-all cursor-pointer ${
                      isExpanded ? 'bg-[#191133] border-[#762CFF] shadow-md shadow-[#762CFF]/20' : 'bg-[#18112E] border-[#261A45] hover:border-[#382860]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 transition-transform ${
                          isExpanded ? 'bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] scale-110 shadow-md shadow-[#762CFF]/40' : 'bg-[#241744] text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide leading-tight truncate">
                          {guide.title || `Rule ${idx + 1}`}
                        </h4>
                      </div>
                      <span className={`text-slate-400 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#B13CFF]' : ''}`}>›</span>
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-2.5 pt-2.5 border-t border-[#2B1F4A] text-[11px] text-slate-300 pl-10 pr-2 leading-relaxed [&_a]:text-[#B13CFF] [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: guide.content }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[22px] p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs">⚠️</span>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">REMEMBER</p>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300 pl-1 pt-0.5">
            <div className="flex items-center gap-2"><span>📅</span><span>Post on time</span></div>
            <div className="flex items-center gap-2"><span>🔗</span><span>Keep your affiliate link in bio</span></div>
          </div>
        </div>

        <Link
          href="/more/terms"
          className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF]/60 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <span className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors">Terms & Conditions</span>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
        </Link>

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
