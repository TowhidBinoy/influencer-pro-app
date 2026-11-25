'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Clock, 
  Trash2,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

const INITIAL_METRICS = [
  {
    title: 'Total Active KOCs',
    value: '1,248',
    badge: '+15%',
    badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Active Videos',
    value: '389',
    badge: '+42%',
    badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Pending Reviews',
    value: '27',
    badge: 'Action Required',
    badgeStyle: 'text-[#FF4D73] bg-[#FF4D73]/10 border-[#FF4D73]/30',
  },
  {
    title: 'Published Reels This Month',
    value: '12,492',
    badge: '+22%',
    badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

const RAW_SUBMISSIONS = [
  {
    id: 'SUB-9021',
    koc: 'Ethan Wong',
    platform: 'Instagram',
    sourceReel: 'https://instagram.com/reel/Et24F9901',
    publishedReel: 'https://instagram.com/reel/Et24F9901',
    date: 'Jun 18, 2026 • 10:24 AM',
    status: 'Submitted',
    views: '24.5K',
    engagement: '8.4%',
  },
  {
    id: 'SUB-9022',
    koc: 'Chloe Tan',
    platform: 'Facebook',
    sourceReel: 'https://facebook.com/watch/Ch382910',
    publishedReel: 'https://facebook.com/watch/Ch382910',
    date: 'Jan 20, 2026 • 09:12 AM',
    status: 'Posted',
    views: '88.1K',
    engagement: '11.2%',
  },
  {
    id: 'SUB-9023',
    koc: 'Liam Chen',
    platform: 'Instagram',
    sourceReel: 'https://instagram.com/reel/Li20B4412',
    publishedReel: 'https://instagram.com/reel/Li20B4412',
    date: 'Feb 15, 2026 • 04:05 PM',
    status: 'Deleted',
    views: '1.2K',
    engagement: '1.0%',
  },
  {
    id: 'SUB-9024',
    koc: 'Maya Patel',
    platform: 'Facebook',
    sourceReel: 'https://facebook.com/watch/My201988',
    publishedReel: 'https://facebook.com/watch/My201988',
    date: 'Mar 10, 2026 • 11:30 AM',
    status: 'Submitted',
    views: '45.0K',
    engagement: '9.1%',
  },
  {
    id: 'SUB-9025',
    koc: 'Oliver Smith',
    platform: 'Instagram',
    sourceReel: 'https://instagram.com/reel/Ol22D7710',
    publishedReel: 'https://instagram.com/reel/Ol22D7710',
    date: 'Apr 25, 2026 • 02:18 PM',
    status: 'Posted',
    views: '112.4K',
    engagement: '14.8%',
  },
  {
    id: 'SUB-9026',
    koc: 'Sofia Liu',
    platform: 'Facebook',
    sourceReel: 'https://facebook.com/watch/So291028',
    publishedReel: 'https://facebook.com/watch/So291028',
    date: 'May 30, 2026 • 08:40 AM',
    status: 'Deleted',
    views: '0',
    engagement: '0%',
  },
  {
    id: 'SUB-9027',
    koc: 'Sarah Jenkins',
    platform: 'Instagram',
    sourceReel: 'https://instagram.com/reel/Sa19F0021',
    publishedReel: 'https://instagram.com/reel/Sa19F0021',
    date: 'Jan 19, 2026 • 06:02 PM',
    status: 'Posted',
    views: '63.7K',
    engagement: '7.9%',
  },
];

export default function DynamicAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Dropdown states
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const platformRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (platformRef.current && !platformRef.current.contains(event.target)) {
        setIsPlatformOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic filter logic
  const filteredSubmissions = useMemo(() => {
    return RAW_SUBMISSIONS.filter((row) => {
      const matchSearch = row.koc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlatform = selectedPlatform === 'All Platforms' || row.platform === selectedPlatform;
      const matchStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      return matchSearch && matchPlatform && matchStatus;
    });
  }, [searchTerm, selectedPlatform, selectedStatus]);

  return (
    <div className="space-y-6 select-none font-sans text-slate-200">
      
      {/* 1. Header with Pulse Dot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">Admin Dashboard</h1>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Live Sync
          </span>
        </div>
      </div>

      {/* 2. KPI Metrics Grid with Hover Lift & Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INITIAL_METRICS.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-[#110D20] border border-[#211A35] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#8B31FF]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/15 transition-all" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{kpi.title}</p>
            <div className="mt-4 flex items-baseline justify-between gap-2 z-10">
              <span className="text-3xl font-black text-white tracking-tight group-hover:text-purple-100 transition-colors">
                {kpi.value}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border shadow-sm ${kpi.badgeStyle}`}>
                {kpi.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activity Log & Reframing Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Log */}
        <div className="lg:col-span-2 bg-[#110D20] border border-[#211A35] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1833] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Admin Activity Log</h2>
            </div>
            <span className="text-[10px] text-purple-400 font-semibold cursor-pointer hover:underline">Real-Time</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-start gap-2.5 hover:text-slate-200 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B31FF] mt-1.5 shrink-0" />
              <span>
                Marcus assigned Frame <span className="text-white font-medium bg-[#1A142E] px-1.5 py-0.5 rounded border border-[#2B1F4A]">&quot;Vlog Border #3&quot;</span> to Team Delta
              </span>
            </li>
            <li className="flex items-start gap-2.5 hover:text-slate-200 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D73] mt-1.5 shrink-0" />
              <span>Deleted 3 inactive KOC users from system repository</span>
            </li>
          </ul>
        </div>

        {/* Reframing Queue */}
        <div className="bg-[#110D20] border border-[#211A35] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-[#1F1833] pb-3">Reframing Queue</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Active Render Tasks</span>
                <span className="text-purple-400 font-mono font-bold">78% Load</span>
              </div>
              <div className="w-full bg-[#18112C] h-2.5 rounded-full overflow-hidden border border-[#2A1F45] relative">
                <div 
                  className="bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#C77DFF] h-full rounded-full transition-all duration-1000 relative" 
                  style={{ width: '78%' }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-mono">Status: 4 workers idle, 14 frames rendering.</p>
        </div>
      </div>

      {/* 4. KOC Submissions Section */}
      <div className="bg-[#110D20] border border-[#211A35] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">KOC Submissions</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A132C] text-purple-300 border border-purple-500/20">
              {filteredSubmissions.length} Results
            </span>
          </div>
        </div>

        {/* Filters Area with Custom Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by KOC name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Platform Custom Dropdown */}
          <div className="relative" ref={platformRef}>
            <button
              type="button"
              onClick={() => { setIsPlatformOpen(!isPlatformOpen); setIsStatusOpen(false); }}
              className="w-full flex items-center justify-between bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 transition-all cursor-pointer"
            >
              <span>{selectedPlatform}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isPlatformOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isPlatformOpen && (
              <div className="absolute top-[110%] left-0 right-0 z-50 bg-[#140E26] border border-[#2F2150] rounded-xl py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {['All Platforms', 'Instagram', 'Facebook'].map((item) => (
                  <div
                    key={item}
                    onClick={() => { setSelectedPlatform(item); setIsPlatformOpen(false); }}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      selectedPlatform === item ? 'bg-[#8B31FF] text-white font-semibold' : 'text-slate-300 hover:bg-[#1E153A]'
                    }`}
                  >
                    <span>{item}</span>
                    {selectedPlatform === item && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Custom Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPlatformOpen(false); }}
              className="w-full flex items-center justify-between bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 transition-all cursor-pointer"
            >
              <span>{selectedStatus}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isStatusOpen && (
              <div className="absolute top-[110%] left-0 right-0 z-50 bg-[#140E26] border border-[#2F2150] rounded-xl py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {['All Status', 'Submitted', 'Posted', 'Deleted'].map((item) => (
                  <div
                    key={item}
                    onClick={() => { setSelectedStatus(item); setIsStatusOpen(false); }}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      selectedStatus === item ? 'bg-[#8B31FF] text-white font-semibold' : 'text-slate-300 hover:bg-[#1E153A]'
                    }`}
                  >
                    <span>{item}</span>
                    {selectedStatus === item && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE VIEW: Cards List ================= */}
        <div className="block md:hidden space-y-3 pt-2">
          {filteredSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No matching submissions found.</p>
          ) : (
            filteredSubmissions.map((row) => (
              <div
                key={row.id}
                className="bg-[#150F29] border border-[#241A42] rounded-xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{row.koc}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{row.id}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      row.status === 'Submitted'
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : row.status === 'Posted'
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : 'text-[#FF4D73] bg-[#FF4D73]/10 border border-[#FF4D73]/20'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] pt-1 border-t border-[#20173D]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Platform:</span>
                    <span className="font-semibold text-slate-200">{row.platform}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-mono text-slate-400 text-[10px]">{row.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalItem(row)}
                  className="w-full py-2 rounded-lg bg-[#20153D] hover:bg-[#8B31FF] border border-[#302159] hover:border-[#8B31FF] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* ================= DESKTOP VIEW: Data Table ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#211A35]">
                <th className="pb-3 px-3">KOC Name</th>
                <th className="pb-3 px-3">Platform</th>
                <th className="pb-3 px-3">Source Reel</th>
                <th className="pb-3 px-3">Published Reel</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A132C]">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                    No submissions match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((row) => (
                  <tr key={row.id} className="hover:bg-[#18112C]/60 transition-colors group">
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {row.koc}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {row.platform === 'Instagram' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#E1306C] bg-[#E1306C]/10 border border-[#E1306C]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E1306C]" />
                          Instagram
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#1877F2] bg-[#1877F2]/10 border border-[#1877F2]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
                          Facebook
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <a
                        href={row.sourceReel}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 font-mono text-[11px] underline decoration-purple-500/30 hover:text-purple-100 flex items-center gap-1 group/link"
                      >
                        <span className="truncate max-w-[160px]">{row.sourceReel.replace('https://', '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="py-3.5 px-3">
                      <a
                        href={row.publishedReel}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 font-mono text-[11px] underline decoration-purple-500/30 hover:text-purple-100 flex items-center gap-1 group/link"
                      >
                        <span className="truncate max-w-[160px]">{row.publishedReel.replace('https://', '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">{row.date}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold transition-transform group-hover:scale-105 ${
                          row.status === 'Submitted'
                            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                            : row.status === 'Posted'
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-[#FF4D73] bg-[#FF4D73]/10 border border-[#FF4D73]/20'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setActiveModalItem(row)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1D1435] hover:bg-[#8B31FF] border border-[#2E2050] hover:border-[#8B31FF] text-white text-[11px] font-semibold transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE DETAIL VIEW MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#120D22] border border-[#2B1F4A] rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{activeModalItem.koc}&apos;s Submission</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Record ID: {activeModalItem.id}</p>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-7 h-7 rounded-lg bg-[#19122E] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border border-[#2B1F4A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1C1438]">
                <span className="text-slate-400">Platform</span>
                <span className="font-semibold text-white">{activeModalItem.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1438]">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-purple-400">{activeModalItem.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1438]">
                <span className="text-slate-400">Audience Views</span>
                <span className="font-mono text-emerald-400 font-bold">{activeModalItem.views}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1438]">
                <span className="text-slate-400">Engagement</span>
                <span className="font-mono text-purple-300 font-bold">{activeModalItem.engagement}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Source Link:</span>
                <a
                  href={activeModalItem.sourceReel}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 font-mono text-[11px] underline flex items-center gap-1"
                >
                  <span className="truncate">{activeModalItem.sourceReel}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModalItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#8B31FF] hover:bg-[#9D4EDD] text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}