'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  ChevronDown,
  ExternalLink,
  Loader2,
  Play,
} from 'lucide-react';

const METRIC_STATS = [
  {
    title: 'All Video Sources',
    value: '184',
    badge: '+8 this week',
    badgeStyle: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  },
  {
    title: 'Completed Renders',
    value: '142',
    badge: '94% Success',
    badgeStyle: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    title: 'In Reframer Queue',
    value: '3',
    badge: 'Estimated 2m',
    badgeStyle: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  },
  {
    title: 'Published Submissions',
    value: '89',
    badge: '+12% Reach',
    badgeStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

const INITIAL_VIDEOS = [
  {
    id: 'vid_init_1',
    title: 'Cosplay Gaming Reel #2',
    createdAt: 'Jan 20, 2026',
    platform: 'IG Link',
    url: 'https://instagram.com/reel/Cx391u2K98',
    frame: 'Vlog Neon Purple',
    status: 'PUBLISHED',
    statusStyle: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'vid_init_2',
    title: 'MRS Promotional Reel',
    createdAt: 'Jan 19, 2026',
    platform: 'FB Link',
    url: 'https://facebook.com/watch/video9901',
    frame: 'VHS Retro 90s',
    status: 'PROCESSING',
    statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'vid_init_3',
    title: 'How to level up fast in RPG',
    createdAt: 'Jan 15, 2026',
    platform: 'IG Link',
    url: 'https://instagram.com/reel/Li20B4412',
    frame: 'Clean Cinematic',
    status: 'COMPLETED',
    statusStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop',
  },
];

const TABS = ['All', 'Draft', 'Processing', 'Completed', 'Published'];

export default function VideoManagementPage() {
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [activeTab, setActiveTab] = useState('All');
  const [reelLink, setReelLink] = useState('https://www.instagram.com/reel/Cx391u2K98/');
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [progress, setProgress] = useState(45);

  const timerRef = useRef(null);
  const completionTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  const detectedSource = useMemo(() => {
    if (!reelLink) return null;
    const lower = reelLink.toLowerCase();
    if (lower.includes('instagram.com')) return 'Instagram Reel Source';
    if (lower.includes('facebook.com')) return 'Facebook Reel Source';
    if (lower.includes('tiktok.com')) return 'TikTok Video Source';
    return null;
  }, [reelLink]);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'All') return videos;
    return videos.filter((v) => v.status.toLowerCase() === activeTab.toLowerCase());
  }, [videos, activeTab]);

  const handleRetrieveSource = () => {
    if (!reelLink.trim() || isRetrieving) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);

    setIsRetrieving(true);
    setProgress(10);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 95;
        }
        return prev + 20;
      });
    }, 200);

    completionTimerRef.current = setTimeout(() => {
      setProgress(100);
      setIsRetrieving(false);

      const uniqueTimestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const uniqueId = `vid_${uniqueTimestamp}_${randomSuffix}`;

      setVideos((prevVideos) => {
        const newEntry = {
          id: uniqueId,
          title: `Imported Reel #${prevVideos.length + 1}`,
          createdAt: 'Just now',
          platform: reelLink.toLowerCase().includes('facebook') ? 'FB Link' : 'IG Link',
          url: reelLink,
          frame: 'Vlog Neon Purple',
          status: 'PROCESSING',
          statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop',
        };
        return [newEntry, ...prevVideos];
      });
    }, 1100);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-20 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Video Management
          </h1>
        </div>

        <Link
          href="/admin/videos/submissions"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Subtitle */}
      <div>
        <h2 className="text-base font-bold text-white tracking-wide">
          Video Reframer System
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Import videos from social links, crop to vertical format, and export vertical outputs instantly.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_STATS.map((metric, idx) => (
          <div
            key={idx}
            className="bg-[#110D20] border border-[#211A35] hover:border-[#8B31FF]/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 group"
          >
            <p className="text-[11px] font-medium text-slate-400">{metric.title}</p>
            <div className="mt-4 flex items-baseline justify-between gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{metric.value}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${metric.badgeStyle}`}>
                {metric.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left: Videos Table */}
        <div className="xl:col-span-8 bg-[#110D20] border border-[#211A35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1635] pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#8B31FF] text-white shadow-md shadow-purple-600/30'
                      : 'bg-[#16102B] text-slate-400 hover:text-white border border-[#261E3E]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 self-end sm:self-auto">
              <span>Sort by:</span>
              <span className="font-bold text-white flex items-center gap-1">
                Date Created <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {filteredVideos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No videos in this tab.</p>
            ) : (
              filteredVideos.map((video, idx) => (
                <div key={`${video.id}-${idx}`} className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{video.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Created {video.createdAt}</p>
                      <p className="text-[10px] text-purple-300 font-semibold mt-1">Frame: {video.frame}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#20173D]">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${video.statusStyle}`}>
                      {video.status}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <Link href={`/admin/videos/editor?id=${video.id}`} className="text-purple-400 hover:text-purple-300">
                        Edit
                      </Link>
                      <a href={video.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                        Get
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#211A35]">
                  <th className="pb-3 px-3 font-semibold">VIDEO</th>
                  <th className="pb-3 px-3 font-semibold">SOURCE LINK</th>
                  <th className="pb-3 px-3 font-semibold">FRAME</th>
                  <th className="pb-3 px-3 font-semibold text-center">STATUS</th>
                  <th className="pb-3 px-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A132C]">
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 text-xs">
                      No video sources found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((video, idx) => (
                    <tr key={`${video.id}-${idx}`} className="hover:bg-[#18112C]/60 transition-colors group">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-12 rounded-xl overflow-hidden bg-black shrink-0 relative border border-[#2B1F4A] group-hover:border-purple-500/40 transition-colors">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[160px]">
                              {video.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              Created {video.createdAt}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-purple-300 hover:text-purple-200 font-semibold text-[11px] group/link"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{video.platform}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 font-medium">
                        {video.frame}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${video.statusStyle}`}>
                          {video.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-3 text-xs font-semibold">
                          <Link
                            href={`/admin/videos/editor?id=${video.id}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            Edit
                          </Link>
                          <Link
                            href="/admin/videos/submissions"
                            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            Get
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Importer */}
        <div className="xl:col-span-4 bg-[#110D20] border border-[#211A35] rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Import Video Source</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Supported links: Instagram Reels, Facebook Reels</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PASTE REEL LINK
            </label>
            <input
              type="text"
              value={reelLink}
              onChange={(e) => setReelLink(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner font-mono text-[11px]"
            />
            {detectedSource && (
              <p className="text-[11px] text-[#00F5D4] font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span>Auto-detected: {detectedSource}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRetrieveSource}
            disabled={isRetrieving || !reelLink.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isRetrieving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching Video Stream...</span>
              </>
            ) : (
              <span>Retrieve Video Source</span>
            )}
          </button>

          <div className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-bold">Retrieving Video File...</span>
              <span className="text-purple-400 font-mono font-bold">{progress}%</span>
            </div>
            
            <div className="w-full bg-[#1F1538] h-2 rounded-full overflow-hidden border border-[#2E2050] relative">
              <div
                className="bg-gradient-to-r from-[#7B2CBF] to-[#8B31FF] h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Accessing safe cloud APIs to cache source frames securely.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}