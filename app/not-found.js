'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-full min-h-screen bg-[#07050E] flex flex-col justify-between overflow-hidden relative font-sans antialiased p-6 select-none">
      
      {/* Soft Ambient Background Glow */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-40 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
      />

      {/* 1. TOP APP HEADER */}
      <header className="flex items-center justify-between pt-1 pb-3 z-10 shrink-0 border-b border-[#1A1230]/50 bg-transparent">
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

        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          404
        </span>
      </header>

      {/* 2. CENTER HERO SECTION */}
      <main className="z-10 flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto px-4 space-y-6 overflow-y-auto scrollbar-hide py-4">
        
        {/* Animated Floating & Glowing Icon */}
        <div className="relative flex items-center justify-center pt-2">
          <div className="absolute w-24 h-24 rounded-full bg-[#B13CFF]/20 blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-[24px] bg-[#120D22] border border-[#2B1F4A] hover:border-[#B13CFF]/60 flex items-center justify-center shadow-xl shadow-[#762CFF]/25 transition-transform duration-700 ease-in-out hover:scale-105 animate-[bounce_3s_infinite]">
            <svg 
              width="34" 
              height="34" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#B13CFF" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_8px_rgba(177,60,255,0.6)]"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* 404 Headline & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-white tracking-tight">404</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#B13CFF]">
            Page Not Found
          </p>
        </div>

        {/* Description Text */}
        <p className="text-xs text-slate-400 max-w-[270px] mx-auto font-normal leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons Section */}
        <div className="w-full max-w-[280px] space-y-2.5 pt-1">
          <Link
            href="/dashboard"
            style={{ background: 'linear-gradient(90deg, #762CFF 0%, #B13CFF 100%)' }}
            className="relative group overflow-hidden w-full text-center block text-white font-bold py-3.5 rounded-xl text-xs tracking-wider shadow-lg shadow-[#762CFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase cursor-pointer"
          >
            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700 pointer-events-none" />
            <span className="relative z-10">Back to Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-[#140E28] hover:bg-[#1C1438] border border-[#231A3D] hover:border-[#2B1F4A] text-slate-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            ← Go Back
          </button>
        </div>

      </main>

      {/* 3. FOOTER INFO */}
      <footer className="z-10 pb-1 text-center shrink-0">
        <p className="text-[10px] text-slate-600 font-medium">
          Influencer Pro · 2026
        </p>
      </footer>

    </div>
  );
}