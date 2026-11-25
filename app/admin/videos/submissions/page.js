'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  Video,
  Layers,
  Sparkles,
  Loader2,
  X,
  Send
} from 'lucide-react';

const VIDEO_OPTIONS = [
  { id: '1', title: 'Cosplay Gaming Reel #2', status: 'Completed', size: '24.5 MB' },
  { id: '2', title: 'Reaction Edit Output', status: 'Completed', size: '18.2 MB' },
  { id: '3', title: 'How to level up fast in RPG', status: 'Completed', size: '31.0 MB' },
  { id: '4', title: 'Cyberpunk Drone Chase 4K', status: 'Completed', size: '42.8 MB' },
];

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub_1',
    platform: 'Instagram',
    link: 'instagram.com/reel/Ch38A9...',
    fullUrl: 'https://instagram.com/reel/Ch38A9v2',
    date: 'Submitted Jan 18, 2026',
    videoName: 'Video: Cosplay Gaming Reel #2',
    status: 'APPROVED',
    statusStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    reviewerNotes: 'Video safe-margins look excellent. Metrics are synced and recorded.',
  },
  {
    id: 'sub_2',
    platform: 'Facebook',
    link: 'facebook.com/watch/reel/Fx...',
    fullUrl: 'https://facebook.com/watch/reel/Fx9910',
    date: 'Submitted Jan 19, 2026',
    videoName: 'Video: Promotional Reaction Edit',
    status: 'PENDING REVIEW',
    statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    reviewerNotes: null,
  },
  {
    id: 'sub_3',
    platform: 'Instagram',
    link: 'instagram.com/reel/9xLAx2...',
    fullUrl: 'https://instagram.com/reel/9xLAx290',
    date: 'Submitted Jan 14, 2026',
    videoName: 'Video: Draft Reframing #1',
    status: 'REJECTED',
    statusStyle: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    correctionRequired: 'Border is slightly misaligned on left edge (needs X focus adjustment). Please re-render and resubmit.',
  },
];

export default function ReelSubmissionsPage() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_OPTIONS[0]);
  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram Reels');
  const [publishedUrl, setPublishedUrl] = useState('https://www.instagram.com/reel/DCx8A9v2/');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeReviewModal, setActiveReviewModal] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVideoDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Submit Link Proof
  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!publishedUrl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const isIg = selectedPlatform === 'Instagram Reels';
      const cleanDisplay = publishedUrl.replace(/https?:\/\/(www\.)?/, '');
      const truncated = cleanDisplay.length > 26 ? `${cleanDisplay.substring(0, 26)}...` : cleanDisplay;

      const newSubmission = {
        id: `sub_${Date.now()}`,
        platform: isIg ? 'Instagram' : 'Facebook',
        link: truncated,
        fullUrl: publishedUrl.startsWith('http') ? publishedUrl : `https://${publishedUrl}`,
        date: 'Submitted Just now',
        videoName: `Video: ${selectedVideo.title}`,
        status: 'PENDING REVIEW',
        statusStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        reviewerNotes: null,
      };

      setSubmissions((prev) => [newSubmission, ...prev]);
      setIsSubmitting(false);
      setPublishedUrl('');
    }, 700);
  };

  // Simulate Download
  const handleDownload = (id) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-20 animate-in fade-in duration-300">
      
      {/* 1. Header with Breadcrumb */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500 font-medium tracking-wide">
          <span>Video Management</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-300">Reel Submissions</span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href="/admin/videos"
            className="p-1 -ml-1 text-white hover:text-[#8B31FF] transition-colors rounded-lg flex items-center gap-1.5 group cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Reel Submissions
            </h1>
          </Link>
        </div>
      </div>

      {/* 2. Workspace Two-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left Column: Form & Available Downloads (6 Cols) */}
        <div className="xl:col-span-6 space-y-6">
          
          {/* Submit Card */}
          <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Submit Published Reel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Link proof of your vertical post to begin verification.</p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              
              {/* Custom Animated Dropdown */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  SELECT RENDERED VERTICAL VIDEO
                </label>

                <button
                  type="button"
                  onClick={() => setIsVideoDropdownOpen(!isVideoDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/60 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer shadow-inner group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Video className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{selectedVideo.title}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold shrink-0">
                      {selectedVideo.status}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isVideoDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
                </button>

                {/* Dropdown Menu Modal */}
                {isVideoDropdownOpen && (
                  <div className="absolute top-[105%] left-0 right-0 z-50 bg-[#140E26] border border-[#2F2150] rounded-2xl py-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {VIDEO_OPTIONS.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsVideoDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          selectedVideo.id === video.id
                            ? 'bg-[#8B31FF] text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-[#1E153A]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{video.title}</span>
                          <span className="text-[10px] opacity-70">({video.size})</span>
                        </div>
                        {selectedVideo.id === video.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  PUBLISHING PLATFORM
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Instagram Reels', 'Facebook Reels'].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setSelectedPlatform(platform)}
                      className={`py-2.5 px-3 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPlatform === platform
                          ? 'bg-[#22163E] border border-[#8B31FF] text-white shadow-md shadow-purple-900/30 ring-1 ring-[#8B31FF]/50'
                          : 'bg-[#16102B] text-slate-400 hover:text-white border border-[#261E3E] hover:border-slate-700'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Published Reel URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  PUBLISHED REEL URL
                </label>
                <input
                  type="text"
                  required
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                  placeholder={selectedPlatform === 'Instagram Reels' ? 'https://www.instagram.com/reel/...' : 'https://www.facebook.com/watch/reel/...'}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner font-mono text-[11px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !publishedUrl.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-black shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying and submitting proof...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Link Proof</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Available Downloads */}
          <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white tracking-wide">Available Downloads</h3>

            <div className="space-y-2.5">
              {VIDEO_OPTIONS.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] flex items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{item.size}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(item.id)}
                    disabled={downloadingId === item.id}
                    className="px-4 py-2 bg-[#251A45] hover:bg-[#8B31FF] border border-[#3E2973] hover:border-[#8B31FF] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-70"
                  >
                    {downloadingId === item.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Security Policy Alert */}
            <div className="p-4 rounded-2xl bg-[#200F1C] border border-[#521C38] flex items-start gap-3 text-[11px] text-slate-300">
              <AlertTriangle className="w-4 h-4 text-[#FF4D73] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-white">Security Policy: </span>
                Temporary source streams and cropped storage renders are auto-deleted 24 hours after a successful download to comply with video safety.
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: My Active Submissions (6 Cols) */}
        <div className="xl:col-span-6 bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-[#1E1730] pb-4">
            <h2 className="text-base font-bold text-white tracking-wide">My Active Submissions</h2>
            
            {/* Open Link / Review View Button */}
            <button
              type="button"
              onClick={() => setActiveReviewModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1A1230] border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-900/30 hover:border-purple-400/50 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Open Link (Review View)
            </button>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-3 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10 group"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={sub.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-white hover:text-purple-300 font-mono text-xs font-bold transition-colors truncate max-w-[280px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="truncate">{sub.link}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${sub.statusStyle}`}>
                    {sub.status}
                  </span>
                </div>

                {/* Meta Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{sub.date}</span>
                  <span className="text-slate-400 font-medium">{sub.videoName}</span>
                </div>

                {/* Reviewer Note (If Approved) */}
                {sub.reviewerNotes && (
                  <div className="p-3 rounded-xl bg-[#101F22] border border-emerald-500/20 text-[11px] text-slate-300 leading-relaxed">
                    <span className="font-bold text-emerald-400">Reviewer Notes: </span>
                    {sub.reviewerNotes}
                  </div>
                )}

                {/* Correction Required (If Rejected) */}
                {sub.correctionRequired && (
                  <div className="p-3 rounded-xl bg-[#25101C] border border-rose-500/20 text-[11px] text-slate-300 leading-relaxed">
                    <span className="font-bold text-[#FF4D73]">Correction Required: </span>
                    {sub.correctionRequired}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Interactive Review View Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Active Submissions Queue</h3>
                <p className="text-[10px] text-slate-400">Live inspection of all influencer submissions</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewModal(false)}
                className="w-8 h-8 rounded-xl bg-[#19122E] text-slate-400 hover:text-white flex items-center justify-center border border-[#2B1F4A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {submissions.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#16102B] border border-[#261E3E] flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-white">{item.videoName}</p>
                    <p className="text-[10px] text-purple-300 font-mono truncate max-w-[240px]">{item.fullUrl}</p>
                  </div>
                  <a
                    href={item.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-[#251A45] hover:bg-[#8B31FF] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveReviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#19122E] hover:bg-[#251B40] text-slate-300 text-xs font-semibold border border-[#2B1F4A] cursor-pointer transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}