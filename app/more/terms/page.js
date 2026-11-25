'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import { TERMS_CATEGORY as CATEGORY_LABELS } from '../../../lib/choices';

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

export default function TermsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState({}); // { [category]: content }
  const [activeCategory, setActiveCategory] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadTerms = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.TERMS}?page_size=50`);
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      const byCategory = {};
      rows.forEach((row) => { byCategory[row.category] = row.content; });
      setTerms(byCategory);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('imp_access_token');
    if (!token) { router.push('/login'); return; }
    loadTerms();
  }, [router, loadTerms]);

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
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">TERMS & CONDITIONS</h1>
          </div>
        </div>

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={loadTerms} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl p-1 flex items-center justify-between">
          {Object.entries(CATEGORY_LABELS).map(([v, label]) => {
            const category = Number(v);
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  isActive ? 'bg-[#8B31FF] text-white shadow-md shadow-[#8B31FF]/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading terms...</p>
          </div>
        ) : (
          <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md">
            {terms[activeCategory] ? (
              <div
                className="text-xs text-slate-300 leading-relaxed [&_a]:text-[#B13CFF] [&_a]:underline [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: terms[activeCategory] }}
              />
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No terms published for this category yet.</p>
            )}
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
