'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNotificationBell from '../components/admin/AdminNotificationBell';
import { 
  LayoutDashboard, 
  Layers, 
  Video, 
  LogOut, 
  Search, 
  Menu, 
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const KOC_MENU = [
  { name: 'Dashboard', path: '/koc', icon: LayoutDashboard },
  { name: 'Frame Management', path: '/admin/frames?role=koc', icon: Layers },
  { name: 'Video Management', path: '/admin/videos?role=koc', icon: Video },
];

const KOC_METRICS = [
  { title: 'Total Videos Processed', value: '142', badge: '+12%', badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { title: 'Videos Pending', value: '3', badge: 'On track', badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { title: 'Published Reels', value: '89', badge: '+8%', badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { title: 'Downloads This Month', value: '2,401', badge: '-2%', badgeStyle: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];

const ASSIGNED_FRAMES = [
  { id: 'f1', title: 'Neon Border', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'f2', title: 'Tech Grid', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop' },
  { id: 'f3', title: 'Film Grain', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'f4', title: 'Minimal Glow', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop' },
  { id: 'f5', title: 'Retro Sunset', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop' },
  { id: 'f6', title: 'Cyber Pulse', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'f7', title: 'Vaporwave Grid', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop' },
];

const RECENT_ACTIVITIES = [
  { title: 'Cosplay Gaming Reel #2', status: 'COMPLETED', statusStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', source: 'TikTok', date: 'Jan 20, 2026' },
  { title: 'Epic K-Drama reaction edit', status: 'PROCESSING', statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30', source: 'Instagram', date: 'Jan 19, 2026' },
  { title: 'Strategy Guide: Boss Fights', status: 'PUBLISHED', statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30', source: 'Instagram', date: 'May 30, 2026' },
  { title: 'How to level up fast in RPG', status: 'PUBLISHED', statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30', source: 'YouTube', date: 'Jan 15, 2026' },
  { title: 'Top 10 Beginner Tips for New Players', status: 'PUBLISHED', statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30', source: 'TikTok', date: 'Feb 2, 2026' },
  { title: 'The Ultimate Guide to Crafting', status: 'PUBLISHED', statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30', source: 'TikTok', date: 'Mar 12, 2026' },
  { title: 'Secrets to Finding Rare Items', status: 'PUBLISHED', statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30', source: 'YouTube', date: 'Apr 22, 2026' },
];

const ACTIVE_SUBMISSIONS = [
  { url: 'instagram.com/reel/Cx391...', full: 'https://www.instagram.com', status: 'APPROVED', statusStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', date: 'Submitted on Jan 18, 2026' },
  { url: 'facebook.com/watch/reel/...', full: 'https://www.facebook.com', status: 'PENDING', statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30', date: 'Submitted on Jan 19, 2026' },
];

export default function KOCDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#07050E] text-slate-100 flex flex-row font-sans antialiased overflow-hidden select-none">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
        />
      )}

      {/* ================= 1. SIDEBAR ================= */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-[101] bg-[#0A0714] border-r border-[#1F1833]
          transition-all duration-300 flex flex-col justify-between shrink-0 h-full
          ${isMobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1F1833] shrink-0">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => router.push('/koc')}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-[#8B31FF]/30 shrink-0"
                style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' }}
              >
                <span className="text-white font-black text-sm">✦</span>
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-extrabold text-sm tracking-wide text-white block">PostDesk</span>
                  <span className="text-[8px] font-bold text-purple-400/80 tracking-widest uppercase block whitespace-nowrap">
                    INFLUENCER MANAGEMENT
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {KOC_MENU.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/koc';

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#8B31FF] text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#161126]'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'}`} />
                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span className="truncate tracking-wide">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Bar: Eliska */}
        <div className="p-3 border-t border-[#1F1833] shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#110D20] border border-[#231A3D]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center shrink-0">
                E
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="overflow-hidden truncate">
                  <p className="text-xs font-semibold text-white leading-none truncate">
                    Eliska
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate font-mono">
                    KOC Account
                  </p>
                </div>
              )}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <Link
                href="/admin"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-[#1B142F] shrink-0 cursor-pointer"
                title="Switch to Admin"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ================= 2. MAIN VIEWPORT ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#07050E]">
        
        {/* Top Header */}
        <header className="h-16 bg-[#0A0714]/90 backdrop-blur-md border-b border-[#1F1833] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#140E26] text-slate-300 hover:text-white border border-[#231A3D]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl bg-[#140E26] text-slate-300 hover:text-white border border-[#231A3D] cursor-pointer hover:border-[#8B31FF] transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Search Bar */}
            <div className="relative w-48 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-[#110D20] border border-[#231A3D] focus:border-[#8B31FF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminNotificationBell />
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-[#8B31FF]/15 border border-[#8B31FF]/30 text-[10px] font-bold text-purple-300 tracking-wider uppercase hover:bg-[#8B31FF]/25 transition-colors cursor-pointer"
            >
              KOC PORTAL
            </Link>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide space-y-6 pb-20">
          
          {/* Section 1: Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Hey Eliska, welcome back!
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor your processed videos and submit your active published links.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/videos/submissions?role=koc"
                className="px-4 py-2.5 rounded-xl border border-[#2B1F4A] hover:bg-[#18112E] hover:border-[#3D2C68] text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                Submit Reel Link
              </Link>
              <Link
                href="/admin/videos?role=koc"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>New Video</span>
              </Link>
            </div>
          </div>

          {/* Section 2: Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {KOC_METRICS.map((metric, i) => (
              <div key={i} className="bg-[#110D20] border border-[#211A35] hover:border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
                <span className="text-[11px] font-medium text-slate-400">{metric.title}</span>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white tracking-tight">{metric.value}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${metric.badgeStyle}`}>
                    {metric.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Assigned Frames (Aligned with 0 Margin Gap) */}
          <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">Assigned Frames</h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="w-7 h-7 rounded-lg bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="w-7 h-7 rounded-lg bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Slider */}
            <div 
              ref={carouselRef}
              className="flex items-center gap-4 overflow-x-auto pb-1 scroll-smooth w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {ASSIGNED_FRAMES.map((frame) => (
                <div 
                  key={frame.id} 
                  className="w-[215px] sm:w-[230px] min-w-[215px] sm:min-w-[230px] bg-[#16102B] border border-[#261E3E] rounded-2xl p-3.5 space-y-3 shadow-md hover:border-[#8B31FF]/60 transition-all duration-200 group shrink-0"
                >
                  <div className="w-full h-28 rounded-xl overflow-hidden bg-black border border-[#2F244E] relative">
                    <img 
                      src={frame.image} 
                      alt={frame.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Reticle Marks */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-purple-400" />
                    <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-purple-400" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-purple-400" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-purple-400" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white tracking-wide truncate">
                      {frame.title}
                    </h4>
                    <Link
                      href={`/admin/videos/editor?frame=${encodeURIComponent(frame.title)}&role=koc`}
                      className="w-full py-2 bg-gradient-to-r from-[#8B31FF] to-[#9D4EDD] hover:from-[#9D4EDD] hover:to-[#B13CFF] text-white text-[11px] font-bold rounded-xl shadow-md shadow-purple-900/30 transition-all flex items-center justify-center cursor-pointer hover:scale-[1.01]"
                    >
                      Use Frame
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Split Layout (Activity Table + Submissions) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
            
            {/* Recent Video Activity */}
            <div className="xl:col-span-8 bg-[#110D20] border border-[#211A35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl w-full">
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Video Activity</h3>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#211A35]">
                      <th className="pb-3 px-3 font-semibold">VIDEO TITLE</th>
                      <th className="pb-3 px-3 font-semibold text-center">STATUS</th>
                      <th className="pb-3 px-3 font-semibold">SOURCE</th>
                      <th className="pb-3 px-3 font-semibold text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18112C]">
                    {RECENT_ACTIVITIES.map((act, idx) => (
                      <tr key={idx} className="hover:bg-[#16102B]/60 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-white">{act.title}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${act.statusStyle}`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 font-medium">{act.source}</td>
                        <td className="py-3.5 px-3 text-right text-slate-500 font-mono text-[11px]">{act.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Reel Submissions */}
            <div className="xl:col-span-4 bg-[#110D20] border border-[#211A35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl w-full">
              <h3 className="text-sm font-bold text-white tracking-wide">Active Reel Submissions</h3>

              <div className="space-y-3">
                {ACTIVE_SUBMISSIONS.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-2 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <a href={sub.full} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-white hover:text-purple-300 truncate">
                        {sub.url}
                      </a>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${sub.statusStyle}`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{sub.date}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/admin/videos/submissions?role=koc"
                className="w-full py-2.5 rounded-xl bg-[#18112C] hover:bg-[#23183E] border border-[#2B1F4A] text-purple-300 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
              >
                View All Submissions
              </Link>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}