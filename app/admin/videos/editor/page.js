'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  Crop, 
  Move, 
  ChevronDown, 
  Zap, 
  CheckCircle2
} from 'lucide-react';

const TEMPLATE_OPTIONS = [
  'Vlog Neon Purple Border Setup',
  'Retro VHS Border Setup',
  'Clean Minimal Cinematic',
  'Cyberpunk Glitch Neon',
];

function VideoEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id');

  // 1. Playback States - Default isPlaying false (No auto-play)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(17);
  const totalDuration = 30;

  // Aspect Ratio & Cropping
  const [aspectRatio, setAspectRatio] = useState('9:16 Vertical');
  const [isRepositionActive, setIsRepositionActive] = useState(true);
  const [trimStart, setTrimStart] = useState('00:02.140');
  const [trimEnd, setTrimEnd] = useState('00:18.500');
  const [xOffset, setXOffset] = useState('+24px');
  const [yOffset, setYOffset] = useState('-12px');

  // Template & Custom Dropdown State
  const [selectedTemplate, setSelectedTemplate] = useState('Vlog Neon Purple Border Setup');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Overlay Captions & Processing - Initial static 82%
  const [captionText, setCaptionText] = useState('⚡ EPIC CLUTCH PLAY!');
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderProgress, setRenderProgress] = useState(82);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Playback timer (Only runs when isPlaying is clicked to true)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= totalDuration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Triggered Rendering Process - Runs smoothly to 100%
  const handleProcessVideo = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setRenderProgress(0);

    const intv = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intv);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Convert string offset to CSS Translate
  const getTranslateStyle = () => {
    const numericX = parseFloat(xOffset.replace(/[^0-9.-]/g, '')) || 0;
    const numericY = parseFloat(yOffset.replace(/[^0-9.-]/g, '')) || 0;
    return `translate(${numericX}px, ${numericY}px) scale(${isRepositionActive ? 1.15 : 1.05})`;
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-20 animate-in fade-in duration-300">
      
      {/* Breadcrumb Header */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500 font-medium tracking-wide">
          <span>Video Management</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-300">Video Editor</span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href="/admin/videos"
            className="p-1 -ml-1 text-white hover:text-[#8B31FF] transition-colors rounded-lg flex items-center gap-1.5 group cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Video Editor
            </h1>
          </Link>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left: Preview Player (7 Cols) */}
        <div className="xl:col-span-7 bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between shadow-2xl relative min-h-[640px]">
          <h2 className="text-sm font-bold text-white tracking-wide mb-3 self-center">
            Preview
          </h2>

          {/* Dynamic Mockup Frame */}
          <div 
            className={`relative rounded-[36px] p-2.5 bg-[#080512] border-2 border-[#8B31FF]/60 shadow-[0_0_40px_rgba(139,49,255,0.25)] flex flex-col justify-between overflow-hidden transition-all duration-500 ${
              aspectRatio === '1:1 Square' 
                ? 'w-[320px] sm:w-[380px] h-[320px] sm:h-[380px]' 
                : aspectRatio === 'Custom Zone'
                ? 'w-[280px] sm:w-[320px] h-[420px] sm:h-[460px]'
                : 'w-[250px] sm:w-[280px] h-[460px] sm:h-[500px]'
            }`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[30px] bg-black">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
                alt="Video Footage Preview"
                className="w-full h-full object-cover transition-transform duration-300 pointer-events-none"
                style={{ transform: getTranslateStyle() }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
            </div>

            <div className="absolute inset-1.5 border border-purple-500/50 rounded-[28px] pointer-events-none shadow-[inset_0_0_15px_rgba(139,49,255,0.3)] z-10" />
            <div className="w-12 h-1 bg-white/40 rounded-full mx-auto relative z-20" />

            <div className="relative z-20 mb-3 flex flex-col items-center gap-1.5 px-3">
              {captionText && (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#341E56]/90 border border-purple-400/40 text-white font-black text-[11px] shadow-lg flex items-center gap-1.5 tracking-wide backdrop-blur-md">
                  <span>{captionText}</span>
                </div>
              )}
              
              <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                <span>MRS Promotional Reel</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setIsRepositionActive(false)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                !isRepositionActive
                  ? 'bg-[#8B31FF] text-white border-[#8B31FF] shadow-lg shadow-purple-600/30'
                  : 'bg-[#18112C] text-slate-300 border-[#2B1F4A] hover:bg-[#23183E]'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRepositionActive(true)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isRepositionActive
                  ? 'bg-[#8B31FF] text-white border-[#8B31FF] shadow-lg shadow-purple-600/30'
                  : 'bg-[#18112C] text-slate-300 border-[#2B1F4A] hover:bg-[#23183E]'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Reposition</span>
            </button>
          </div>

          {/* Timeline Bar (Manual Play/Pause Control) */}
          <div className="w-full mt-5 pt-4 border-t border-[#1F1833] space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">0:{currentTime < 10 ? `0${currentTime}` : currentTime}</span>
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(Math.floor(clickPos * totalDuration));
                }}
                className="flex-1 bg-[#1C1438] h-1.5 rounded-full overflow-hidden relative cursor-pointer"
              >
                <div 
                  className="bg-gradient-to-r from-purple-500 to-[#8B31FF] h-full rounded-full transition-all duration-200"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400">0:{totalDuration}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 text-white hover:text-purple-300 font-bold transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
                <span className="text-[10px] text-slate-500 font-normal ml-1">
                  {isPlaying ? 'Loop Preview Active' : 'Preview Paused'}
                </span>
              </button>

              <span className="text-[10px] text-slate-500 font-mono">Format: 9:16 vertical</span>
            </div>
          </div>
        </div>

        {/* Right: Reframing Controls (5 Cols) */}
        <div className="xl:col-span-5 bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
          <h2 className="text-base font-bold text-white tracking-wide">
            Reframing Controls
          </h2>

          {/* Aspect Ratio Crop */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ASPECT RATIO CROP
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['9:16 Vertical', '1:1 Square', 'Custom Zone'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-[#8B31FF] text-white shadow-md shadow-purple-600/30'
                      : 'bg-[#16102B] text-slate-400 hover:text-white border border-[#261E3E]'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Video Trim Timings */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              VIDEO TRIM TIMINGS
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Start Point</span>
                <input
                  type="text"
                  value={trimStart}
                  onChange={(e) => setTrimStart(e.target.value)}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">End Point</span>
                <input
                  type="text"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(e.target.value)}
                  className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reposition Focus */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              REPOSITION FOCUS
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-1.5 bg-[#16102B] border border-[#261E3E] rounded-xl px-3 py-2.5 flex-nowrap">
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">X Offset:</span>
                <input
                  type="text"
                  value={xOffset}
                  onChange={(e) => setXOffset(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-bold focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center justify-between gap-1.5 bg-[#16102B] border border-[#261E3E] rounded-xl px-3 py-2.5 flex-nowrap">
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">Y Offset:</span>
                <input
                  type="text"
                  value={yOffset}
                  onChange={(e) => setYOffset(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-bold focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Frame Setup Template Dropdown */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              FRAME SETUP TEMPLATE
            </label>
            
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/60 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer shadow-inner"
            >
              <span className="font-semibold text-slate-200">{selectedTemplate}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-[105%] left-0 right-0 z-50 bg-[#140E26] border border-[#2F2150] rounded-xl py-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {TEMPLATE_OPTIONS.map((tmpl) => (
                  <div
                    key={tmpl}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      selectedTemplate === tmpl
                        ? 'bg-[#8B31FF] text-white font-bold shadow-md'
                        : 'text-slate-300 hover:bg-[#1E153A]'
                    }`}
                  >
                    <span>{tmpl}</span>
                    {selectedTemplate === tmpl && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Overlay & Captions */}
          <div className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TEXT OVERLAY & CAPTIONS
            </label>
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="e.g. ⚡ EPIC CLUTCH PLAY!"
              className="w-full bg-[#1A1230] border border-[#2E204E] focus:border-[#8B31FF] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-medium"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span>Text Color</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                <span className="font-mono text-white">#FFFFFF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Background</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#341E56] border border-purple-400" />
                <span className="font-mono text-white">#341E56</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Position</span>
                <span className="text-purple-300 font-bold">Bottom Anchor ▾</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setTrimStart('00:02.140');
                setTrimEnd('00:18.500');
                setXOffset('+24px');
                setYOffset('-12px');
              }}
              className="py-3 rounded-xl bg-[#18112C] hover:bg-[#23183E] border border-[#2B1F4A] text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Regenerate Preview
            </button>
            <button
              type="button"
              onClick={handleProcessVideo}
              disabled={isProcessing}
              className="py-3 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer transition-all disabled:opacity-60 text-center"
            >
              {isProcessing ? 'Rendering tracks...' : 'Process Video'}
            </button>
          </div>

          {/* Progress Bar (Loads smoothly to 100% when processed) */}
          <div className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {renderProgress === 100 ? 'Rendering completed successfully!' : 'Reframing Engine rendering tracks...'}
              </span>
              <span className="text-emerald-400 font-mono font-bold">{renderProgress}% Done</span>
            </div>
            
            <div className="w-full bg-[#1F1538] h-2 rounded-full overflow-hidden border border-[#2E2050] relative">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${renderProgress}%` }}
              >
                {isProcessing && <div className="absolute inset-0 bg-white/25 animate-pulse" />}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function VideoEditorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Loading editor...</div>}>
      <VideoEditorContent />
    </Suspense>
  );
}