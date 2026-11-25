'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';

export default function MoreMenuPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const cachedUserStr = localStorage.getItem('imp_user');
    const token = localStorage.getItem('imp_access_token');

    if (!token) {
      router.push('/');
      return;
    }

    if (cachedUserStr) {
      try {
        setUserData(JSON.parse(cachedUserStr));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, [router]);

  // Handle Complete Session Logout
  const handleLogout = () => {
    localStorage.removeItem('imp_access_token');
    localStorage.removeItem('imp_refresh_token');
    localStorage.removeItem('imp_user');
    router.push('/');
  };

  const displayName = userData?.name || userData?.username || 'Influencer';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayRole = userData?.role === 'ADMIN' ? 'Admin Portal' : 'Pro Influencer';

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden relative font-sans antialiased select-none">
      
      {/* Background Glow Effect */}
      <div 
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[110px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      {/* 1. TRANSPARENT TOP APP HEADER */}
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

        {/* Top Right Notifications Badge */}
        <NotificationBell />
      </header>

      {/* 2. SCROLLABLE INNER CONTENT */}
      <main className="z-10 space-y-4 mt-1 mb-0 overflow-y-auto min-h-0 flex-1 scrollbar-hide px-5 pb-28">
        
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase">MORE</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Tools, jobs and account settings</p>
        </div>

        {/* User Profile Overview Card */}
        <Link
          href="/more/profile"
          className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF] rounded-[22px] p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group block"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1A1230] border-2 border-[#8B31FF] flex items-center justify-center text-base font-bold text-white shadow-inner">
              {displayInitial}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#B13CFF] transition-colors capitalize">
                {displayName}
              </h3>
              <p className="text-xs text-[#B13CFF] font-medium mt-0.5 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>{displayRole}</span>
              </p>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
        </Link>

        {/* SECTION 1: ACCOUNT */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase pl-1">ACCOUNT</p>

          {/* Grid 2-Column Options */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Bank Details */}
            <Link 
              href="/more/bank-details"
              className="bg-[#120D22] border border-[#231A3D] hover:border-[#10B981]/60 rounded-[20px] p-3.5 flex flex-col justify-between cursor-pointer transition-all shadow-md group min-h-[105px]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0E201B] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#10B981] transition-colors">Bank Details</h4>
                <p className="text-[9px] text-slate-400 mt-0.5 font-normal">Manage payout accounts</p>
              </div>
            </Link>

            {/* Affiliate Link */}
            <Link 
              href="/more/affiliate-links"
              className="bg-[#120D22] border border-[#231A3D] hover:border-[#00D2FF]/60 rounded-[20px] p-3.5 flex flex-col justify-between cursor-pointer transition-all shadow-md group min-h-[105px]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0B1E2E] border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">Affiliate Link</h4>
                <p className="text-[9px] text-slate-400 mt-0.5 font-normal">View & copy your link</p>
              </div>
            </Link>
          </div>

          {/* Job Board Full Row */}
          <Link 
            href="/more/job-board"
            className="bg-[#120D22] border border-[#231A3D] hover:border-[#F59E0B]/60 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#261B0E] border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">Job Board</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Find and manage available campaigns</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
          </Link>
        </div>

        {/* SECTION 2: CONTENT TOOLS */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-[#B13CFF] tracking-wider uppercase pl-1">CONTENT TOOLS</p>

          {/* Frame Editor */}
          <Link 
            href="/more/frame-editor"
            className="bg-[#120D22] border border-[#231A3D] hover:border-[#B13CFF]/70 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#211033] border border-[#B13CFF]/40 flex items-center justify-center text-[#B13CFF] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors">Frame Editor</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Add official brand frames to video</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
          </Link>

          {/* Rules & How It Works */}
          <Link 
            href="/more/rules"
            className="bg-[#120D22] border border-[#231A3D] hover:border-[#FF2A85]/70 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2D0D1E] border border-[#FF2A85]/40 flex items-center justify-center text-[#FF2A85] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#FF2A85] transition-colors">Rules & How It Works</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Posting rules, job flow & payment terms</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
          </Link>

          {/* Terms & Conditions */}
          <Link
            href="/more/terms"
            className="bg-[#120D22] border border-[#231A3D] hover:border-[#8B31FF]/70 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#8B31FF]/40 flex items-center justify-center text-[#B13CFF] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#B13CFF] transition-colors">Terms & Conditions</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Earnings, leaderboard & job terms</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
          </Link>

          {/* Notifications Row */}
          <Link
            href="/notifications"
            className="bg-[#120D22] border border-[#231A3D] hover:border-[#EAB308]/70 rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#26200A] border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] group-hover:scale-105 transition-transform shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#EAB308] transition-colors">Notifications</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Job updates and important system notices</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-semibold">›</span>
          </Link>
        </div>

        {/* Log Out Button */}
        <div className="pt-2 text-center">
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-[#FF2A55] hover:opacity-80 cursor-pointer flex items-center justify-center gap-1.5 mx-auto transition-opacity"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>

      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <footer className="shrink-0 z-20">
        <BottomNav />
      </footer>

    </div>
  );
}