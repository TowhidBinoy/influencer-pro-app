'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import GuideHelp from '../components/GuideHelp';
import BannerCarousel from '../components/BannerCarousel';
import { apiFetch } from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';
import { PLATFORM as PLATFORM_LABELS, CONTENT_TYPE as CONTENT_TYPE_LABELS, SUBMISSION_STATUS as STATUS_LABELS } from '../../lib/choices';

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
  1: { text: '#F59E0B', bg: 'bg-[#2A1E4A]', label: 'text-amber-400' }, // pending
  2: { text: '#00D2FF', bg: 'bg-[#10B981]', label: 'text-[#00D2FF]' }, // submitted (awaiting review)
  3: { text: '#10B981', bg: 'bg-[#10B981]', label: 'text-emerald-400' }, // approved
  4: { text: '#FF2A55', bg: 'bg-[#2A1E4A]', label: 'text-[#FF2A55]' }, // rejected
  5: { text: '#FF2A55', bg: 'bg-[#2A1E4A]', label: 'text-[#FF2A55]' }, // missed
};

export default function TodayDashboard() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [memberUuid, setMemberUuid] = useState(null);
  const [tasks, setTasks] = useState([]); // Task rows for today, one per active member-job
  const [selectedTask, setSelectedTask] = useState(null);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [banners, setBanners] = useState([]); // BANNER_LOCATION 1 = Home Banner
  const [highlightBanners, setHighlightBanners] = useState([]); // BANNER_LOCATION 3 = Post of the Day

  const loadToday = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.TASKS_TODAY(uuid));
      const list = Array.isArray(data) ? data : [];
      setTasks(list);
      setSelectedTask((prev) => list.find((t) => t.uuid === prev?.uuid) || list[0] || null);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBanners = useCallback(async () => {
    try {
      const [home, highlight] = await Promise.all([
        apiFetch(`${ENDPOINTS.MEMBER.BANNERS_PUBLIC}?location=1`),
        apiFetch(`${ENDPOINTS.MEMBER.BANNERS_PUBLIC}?location=3`),
      ]);
      setBanners(Array.isArray(home) ? home : []);
      setHighlightBanners(Array.isArray(highlight) ? highlight : []);
    } catch {
      setBanners([]); // promotional only — fail silently, never blocks the dashboard
      setHighlightBanners([]);
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
      try {
        parsedUser = JSON.parse(cachedUserStr);
        setUserData(parsedUser);
      } catch { /* ignore */ }
    }

    const uuid = parsedUser?.uuid;
    if (!uuid) { router.push('/login'); return; }
    setMemberUuid(uuid);
    loadToday(uuid);
    loadBanners();
  }, [router, loadToday, loadBanners]);

  const displayName = userData?.full_name || userData?.username || 'Influencer';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayRole = userData?.role === 'ADMIN' ? 'Admin Portal' : 'Pro Influencer';

  const tone = STATUS_TONE[selectedTask?.status] || STATUS_TONE[1];

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

        <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1230] border-2 border-[#8B31FF] flex items-center justify-center text-lg font-bold text-white shadow-inner">
            {displayInitial}
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">WELCOME BACK,</p>
            <h2 className="text-xl font-bold text-white leading-tight capitalize">{displayName}</h2>
            <p className="text-xs text-[#B13CFF] font-medium mt-0.5 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#B13CFF]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>{displayRole}</span>
            </p>
          </div>
        </div>

        <GuideHelp location={1} label="Tips for this screen" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadToday(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        <BannerCarousel banners={banners} height="h-28" />

        <div>
          <h2 className="text-lg font-bold tracking-wider text-white uppercase">TODAY&apos;S TASK</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            {isLoading ? 'Loading your active jobs...' : tasks.length === 0 ? "You don't have any active jobs yet." : 'Choose a job to view its task for today.'}
          </p>
        </div>

        <GuideHelp location={2} label="Tips for today's mission" />

        {!isLoading && tasks.length > 0 && (
          <>
            <div className="relative z-30">
              <div
                onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF] rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group active:scale-[0.99]"
              >
                <div>
                  <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase mb-1">SELECT JOB</p>
                  <p className="text-sm font-bold text-white group-hover:text-[#B13CFF] transition-colors">
                    {selectedTask?.job_title || 'Select a Job'}
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-300 ${isJobDropdownOpen ? 'rotate-180 text-[#B13CFF]' : 'text-slate-400'}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {isJobDropdownOpen && (
                <div className="absolute top-[108%] left-0 right-0 bg-[#120D22]/98 border border-[#2B1F4A] rounded-[22px] p-2 shadow-2xl z-50 backdrop-blur-xl space-y-1">
                  {tasks.map((task) => {
                    const isSelected = selectedTask?.uuid === task.uuid;
                    return (
                      <div
                        key={task.uuid}
                        onClick={() => { setSelectedTask(task); setIsJobDropdownOpen(false); }}
                        className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                          isSelected ? 'bg-[#1C1438] border border-[#762CFF]/60 text-white shadow-md' : 'hover:bg-[#18112E] text-slate-300 hover:text-white'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{task.job_title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{task.org}</p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 bg-[#B13CFF] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4 space-y-3 relative shadow-md">
              <span className={`absolute top-3.5 right-3.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${tone.label} bg-black/30 border-current/30`}>
                {STATUS_LABELS[selectedTask?.status] || 'Pending'}
              </span>

              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">TODAY&apos;S TASK</p>

              <div
                onClick={() => router.push(`/more/job-board/job-overview?task_uuid=${selectedTask?.uuid}&member_job_uuid=${selectedTask?.member_job_uuid}`)}
                className="flex items-center justify-between cursor-pointer bg-[#18112E] border border-[#2B1F4A] hover:border-[#8B31FF]/60 rounded-xl p-3.5 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#221742] flex items-center justify-center text-[#B13CFF] group-hover:scale-105 transition-transform">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{selectedTask?.quantity || 1}x {CONTENT_TYPE_LABELS[selectedTask?.content_type] || 'Post'}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{PLATFORM_LABELS[selectedTask?.platform] || ''}</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 group-hover:text-white transition-colors"><polyline points="9 18 15 12 9 6" /></svg>
              </div>

              {selectedTask?.status === 1 || selectedTask?.status === 2 ? (
                <Link
                  href={`/submit-proof?task_uuid=${selectedTask?.uuid}`}
                  style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
                  className="relative group overflow-hidden w-full text-center block text-white font-bold py-3.5 rounded-xl text-xs tracking-wider shadow-lg shadow-[#762CFF]/30 hover:shadow-[#B13CFF]/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    <span>{selectedTask?.status === 2 ? 'Update Proof' : "Submit Today's Proof"}</span>
                  </span>
                </Link>
              ) : (
                <div className="w-full text-center py-3.5 rounded-xl text-xs font-bold bg-[#18112E] border border-[#2B1F4A] text-slate-400">
                  {selectedTask?.status === 5 ? 'Submission window closed for this day.' : 'This task has been reviewed.'}
                </div>
              )}
            </div>
          </>
        )}

        {/* Featured Campaign Banner */}
        <Link
          href="/campaign"
          className="bg-[#120C21] border border-[#231A3D] hover:border-[#FF2E93] rounded-[22px] p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#241126] border border-[#FF2E93]/40 flex items-center justify-center text-[#FF2E93] shrink-0 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#FF2E93] tracking-widest uppercase">MISSED DAYS</p>
              <h3 className="text-sm font-bold text-white mt-0.5">Check your posting history</h3>
              <p className="text-[11px] text-slate-400 font-normal group-hover:text-white transition-colors">View details →</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#1F1538] border border-[#32235A] group-hover:bg-[#FF2E93] group-hover:border-[#FF2E93] flex items-center justify-center text-white transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </Link>

        {/* Post of the Day (BANNER_LOCATION 3) */}
        {highlightBanners.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-[#161F38] flex items-center justify-center text-[#63C7FF]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
              </div>
              <p className="text-[10px] font-semibold text-[#63C7FF] tracking-wider uppercase">
                TODAY&apos;S HIGHLIGHT
              </p>
            </div>
            <BannerCarousel banners={highlightBanners} height="h-32" />
          </div>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
