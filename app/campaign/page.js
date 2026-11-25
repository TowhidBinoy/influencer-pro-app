'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import GuideHelp from '../components/GuideHelp';
import BannerCarousel from '../components/BannerCarousel';
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

export default function MissedCampaignPage() {
  const router = useRouter();

  const [memberUuid, setMemberUuid] = useState(null);
  const [missed, setMissed] = useState(null); // §33 response
  const [selectedDay, setSelectedDay] = useState(null); // day-of-month int
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [eventBanners, setEventBanners] = useState([]); // BANNER_LOCATION 2 = Event Banner

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const loadMissed = useCallback(async (uuid) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(ENDPOINTS.MEMBER.MISSED(uuid));
      setMissed(data);
      const firstDay = Array.isArray(data?.days) && data.days.length > 0
        ? new Date(data.days[0].period_key).getDate()
        : null;
      setSelectedDay(firstDay);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadEventBanners = useCallback(async () => {
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.BANNERS_PUBLIC}?location=2`);
      setEventBanners(Array.isArray(data) ? data : []);
    } catch {
      setEventBanners([]); // promotional only — fail silently
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
    loadMissed(uuid);
    loadEventBanners();
  }, [router, loadMissed, loadEventBanners]);

  const missedDays = Array.isArray(missed?.days) ? missed.days : [];
  const missedDaysOfMonth = new Set(missedDays.map((d) => new Date(d.period_key).getDate()));
  const selectedRecords = missedDays.filter((d) => new Date(d.period_key).getDate() === selectedDay);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const firstDayIndex = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const offset = (firstDayIndex + 6) % 7;
  const calendarGrid = [];
  for (let i = 0; i < offset; i++) calendarGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);

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

        <div>
          <h1 className="text-lg font-bold text-[#B13CFF] tracking-wider uppercase">Missed Days</h1>
        </div>

        <BannerCarousel banners={eventBanners} height="h-24" />

        <GuideHelp location={4} label="Tips about missed days" />

        {loadError && (
          <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button onClick={() => loadMissed(memberUuid)} className="underline shrink-0 cursor-pointer">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl">
            <p className="text-xs text-slate-400">Loading missed days...</p>
          </div>
        ) : (
          <>
            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">
                    {currentMonthName} {currentYear}
                  </p>
                  <h2 className="text-3xl font-bold text-[#FF2A55] mt-0.5 leading-none">{missed?.missed_count ?? 0}</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Missed Days</p>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-bold text-[#FF2A55] tracking-tight">-{formatAmount(missed?.deduction)}</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Total Deduction</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mt-5 mb-2">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[10px] font-medium text-slate-400">{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
                {calendarGrid.map((date, index) => {
                  if (date === null) return <div key={`empty-${index}`} />;

                  const isMissed = missedDaysOfMonth.has(date);
                  const isSelected = selectedDay === date;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(date)}
                      className={`flex items-center justify-center h-7 rounded-full transition-all cursor-pointer ${
                        isSelected && !isMissed ? 'ring-2 ring-[#B13CFF] font-bold text-white' : ''
                      }`}
                    >
                      {isMissed ? (
                        <span
                          className={`w-7 h-7 rounded-full bg-[#FF2A55] text-white font-bold flex items-center justify-center shadow-md transition-transform ${
                            isSelected ? 'scale-110 ring-2 ring-white shadow-[#FF2A55]/60' : 'opacity-90 hover:opacity-100'
                          }`}
                        >
                          {date}
                        </span>
                      ) : (
                        <span className={`text-xs ${isSelected ? 'text-[#B13CFF] font-bold' : 'text-slate-300 font-medium hover:text-white'}`}>
                          {date}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedRecords.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedRecords.map((r) => (
                    <div key={r.member_job_uuid + r.period_key} className="p-3 bg-[#18112E] border border-[#2B1F4A] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#FF2A55]"></span>
                          {new Date(r.period_key).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.org} · {r.job_title}</p>
                      </div>
                      <span className="text-xs font-bold text-[#FF2A55] bg-[#FF2A55]/10 px-2 py-1 rounded-lg border border-[#FF2A55]/20">
                        -{formatAmount(r.deduction)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : selectedDay ? (
                <div className="mt-4 p-2.5 bg-[#140E28] border border-[#231A3D] rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 font-normal">
                    {currentMonthName.slice(0, 3)} {selectedDay}, {currentYear} · <span className="text-emerald-400 font-semibold">No Missed Task</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">MISSED HISTORY</p>
                {missedDays.length > 3 && (
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-[10px] font-semibold text-[#B13CFF] hover:underline cursor-pointer"
                  >
                    {showAllHistory ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>

              {missedDays.length === 0 ? (
                <p className="text-xs text-slate-400">No missed days this month. Keep it up!</p>
              ) : (
                missedDays.slice(0, showAllHistory ? missedDays.length : 3).map((item) => {
                  const day = new Date(item.period_key).getDate();
                  const isSelected = selectedDay === day;
                  return (
                    <div
                      key={item.member_job_uuid + item.period_key}
                      onClick={() => setSelectedDay(day)}
                      className={`flex items-center justify-between text-xs p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected ? 'bg-[#1C1438] border border-[#FF2A55]/40 shadow-sm' : 'hover:bg-[#18112E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#FF2A55]' : 'bg-slate-500'}`}></div>
                        <span className="text-white font-semibold">
                          {new Date(item.period_key).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })} · {item.job_title}
                        </span>
                      </div>
                      <span className="text-[#FF2A55] font-semibold">-{formatAmount(item.deduction)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-[#120D22] border border-[#231A3D] rounded-[24px] p-4.5 shadow-md space-y-2">
              <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase">ABOUT MISSED DAYS</p>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Each missed posting day deducts from your monthly payment, based on the job's deduction rate.
              </p>
              <p className="text-[11px] text-slate-400 font-normal">
                Past months are already settled.
              </p>
            </div>
          </>
        )}

      </main>

      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}
