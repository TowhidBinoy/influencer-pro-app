'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  UploadCloud, 
  X, 
  ArrowRight, 
  Video, 
  Save,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const DEFAULT_PREVIEW = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop';

function CreateFrameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const bgInputRef = useRef(null);
  const overlayInputRef = useRef(null);

  const [frameName, setFrameName] = useState('Spring Campaign Neon Border Setup');
  
  // Background Image State
  const [bgImage, setBgImage] = useState(DEFAULT_PREVIEW);
  const [bgFileMeta, setBgFileMeta] = useState({
    name: 'spring_neon_background.png',
    resolution: '1080 × 1920',
    size: '2.4 MB'
  });

  // Overlay Frame State
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayMeta, setOverlayMeta] = useState(null);

  // Tag States
  const [userGroups, setUserGroups] = useState(['Group Alpha', 'Group Beta']);
  const [individualKOCs, setIndividualKOCs] = useState(['Eliska Jones', 'Chloe Tan']);
  const [groupInput, setGroupInput] = useState('');
  const [kocInput, setKocInput] = useState('');

  // Load if editing
  useEffect(() => {
    if (editId) {
      const stored = localStorage.getItem('postdesk_custom_frames');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const current = list.find((f) => f.id === editId);
          if (current) {
            setFrameName(current.title);
            if (current.bgImage) setBgImage(current.bgImage);
            if (current.overlayImage) setOverlayImage(current.overlayImage);
            if (current.meta) setBgFileMeta(current.meta);
          }
        } catch { /* ignore */ }
      }
    }
  }, [editId]);

  // Handle Background Upload
  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setBgImage(previewUrl);
      setBgFileMeta({
        name: file.name,
        resolution: `${img.width} × ${img.height}`,
        size: `${sizeInMB} MB`
      });
    };
  };

  // Handle Overlay Upload
  const handleOverlayUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setOverlayImage(previewUrl);
      setOverlayMeta({
        name: file.name,
        resolution: `${img.width} × ${img.height}`,
        size: `${sizeInMB} MB`
      });
    };
  };

  const removeGroup = (item) => setUserGroups((prev) => prev.filter((g) => g !== item));
  const removeKOC = (item) => setIndividualKOCs((prev) => prev.filter((k) => k !== item));

  const handleAddGroup = (e) => {
    if (e.key === 'Enter' && groupInput.trim()) {
      e.preventDefault();
      if (!userGroups.includes(groupInput.trim())) setUserGroups([...userGroups, groupInput.trim()]);
      setGroupInput('');
    }
  };

  const handleAddKOC = (e) => {
    if (e.key === 'Enter' && kocInput.trim()) {
      e.preventDefault();
      if (!individualKOCs.includes(kocInput.trim())) setIndividualKOCs([...individualKOCs, kocInput.trim()]);
      setKocInput('');
    }
  };

  // Save Setup
  const handleSave = (createAnother = false) => {
    if (!frameName.trim()) return;

    const newFrame = {
      id: editId || `frame_${Date.now()}`,
      title: frameName.trim(),
      assignedTo: userGroups.length > 0 ? `${userGroups[0]} (${userGroups.length * 7} KOCs)` : 'Unassigned',
      createdAt: 'Just now',
      bgImage: bgImage,
      overlayImage: overlayImage,
      meta: bgFileMeta,
    };

    const existing = localStorage.getItem('postdesk_custom_frames');
    let frameList = existing ? JSON.parse(existing) : [];

    if (editId) {
      frameList = frameList.map((f) => (f.id === editId ? newFrame : f));
    } else {
      frameList = [newFrame, ...frameList];
    }

    localStorage.setItem('postdesk_custom_frames', JSON.stringify(frameList));

    if (createAnother) {
      setFrameName('');
      setBgImage(null);
      setOverlayImage(null);
      setUserGroups([]);
      setIndividualKOCs([]);
    } else {
      router.push('/admin/frames');
    }
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-20 animate-in fade-in duration-300">
      
      {/* 1. Header with Breadcrumb */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500 font-medium tracking-wide">
          <span>Frame Management</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-300">{editId ? 'Edit Frame Setup' : 'Create Frame Setup'}</span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href="/admin/frames"
            className="p-1 -ml-1 text-white hover:text-[#8B31FF] transition-colors rounded-lg flex items-center gap-1.5 group cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {editId ? 'Edit Frame Setup' : 'Create Frame Setup'}
            </h1>
          </Link>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left Workspace: Form Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Frame Setup Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure your media assets and view the structural hierarchy.</p>
            </div>

            {/* Frame Setup Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Frame Setup Name <span className="text-[#FF4D73]">*</span>
              </label>
              <input
                type="text"
                required
                value={frameName}
                onChange={(e) => setFrameName(e.target.value)}
                placeholder="Enter setup title..."
                className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Background Layer Section */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300 block">
                Background Layer <span className="text-[#FF4D73]">*</span>
              </label>

              <input
                type="file"
                id="bg-upload-file-input"
                ref={bgInputRef}
                onChange={handleBgUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              {bgImage ? (
                <div className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-16 h-16 rounded-xl bg-black border border-purple-500/40 overflow-hidden shrink-0 relative shadow-inner">
                      <img 
                        src={bgImage} 
                        alt="Background Layer" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="overflow-hidden truncate">
                      <p className="text-xs font-bold text-white truncate">{bgFileMeta.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        PNG • {bgFileMeta.resolution} • {bgFileMeta.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label
                      htmlFor="bg-upload-file-input"
                      className="px-3.5 py-1.5 bg-[#251A45] hover:bg-[#342461] border border-[#3E2973] text-purple-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Change Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setBgImage(null)}
                      className="px-3.5 py-1.5 bg-[#2B1425] hover:bg-[#3D1A33] border border-[#522144] text-[#FF4D73] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label 
                  htmlFor="bg-upload-file-input"
                  className="border-2 border-dashed border-[#2F2250] hover:border-purple-500/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#150F28] group block"
                >
                  <UploadCloud className="w-7 h-7 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-white">Click to upload custom background image</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">PNG, JPG or WebP (Recommended: 1080 × 1920)</p>
                </label>
              )}
            </div>

            {/* Overlay Frame Layer (Alpha PNG) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300 block">
                Overlay Frame Layer (Alpha PNG)
              </label>

              {/* Native Input Connected by ID */}
              <input
                type="file"
                id="overlay-upload-file-input"
                ref={overlayInputRef}
                onChange={handleOverlayUpload}
                accept="image/png"
                className="hidden"
              />

              {overlayImage ? (
                <div className="p-4 rounded-2xl bg-[#16102B] border border-[#261E3E] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-16 h-16 rounded-xl bg-black border border-cyan-500/40 overflow-hidden shrink-0 relative shadow-inner flex items-center justify-center">
                      <img 
                        src={overlayImage} 
                        alt="Overlay Layer" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="overflow-hidden truncate">
                      <p className="text-xs font-bold text-white truncate">{overlayMeta?.name || 'custom_overlay.png'}</p>
                      <p className="text-[10px] text-cyan-400 mt-0.5 font-mono">
                        PNG (Transparent) • {overlayMeta?.resolution || '1080 × 1920'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label
                      htmlFor="overlay-upload-file-input"
                      className="px-3.5 py-1.5 bg-[#251A45] hover:bg-[#342461] border border-[#3E2973] text-purple-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Change Frame
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOverlayImage(null);
                        setOverlayMeta(null);
                      }}
                      className="px-3.5 py-1.5 bg-[#2B1425] hover:bg-[#3D1A33] border border-[#522144] text-[#FF4D73] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label 
                  htmlFor="overlay-upload-file-input"
                  className="border-2 border-dashed border-[#2B1F4A] hover:border-purple-500/60 rounded-2xl p-8 text-center space-y-2 transition-colors cursor-pointer bg-[#140E26]/50 group block"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#1D1438] border border-purple-500/20 group-hover:scale-110 text-purple-400 flex items-center justify-center mx-auto transition-transform shadow-lg shadow-purple-900/30">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Upload Overlay Frame</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag and drop or <span className="text-purple-400 font-semibold underline">click to browse</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Supports PNG with transparency (Recommended: 1080 × 1920)
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Visual Layer Stacking Order */}
            <div className="bg-[#150F29] border border-[#261D42] rounded-2xl p-4 space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                VISUAL LAYER STACKING ORDER
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-xl bg-[#221742] border border-purple-500/30 text-purple-200">
                  Top: Overlay Frame
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="px-3 py-1 rounded-xl bg-[#1C1438] border border-[#2B1F4A] text-slate-300">
                  Middle: KOC Video
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="px-3 py-1 rounded-xl bg-[#1C1438] border border-[#2B1F4A] text-slate-400">
                  Base: Background
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Workspace: Frame Live Preview & Assignment (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Frame Preview Card */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300">Frame Preview</h3>
            
            <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-6 flex items-center justify-center shadow-2xl relative overflow-hidden">
              
              {/* Phone Device Mockup */}
              <div className="w-[200px] h-[350px] sm:w-[220px] sm:h-[390px] rounded-[32px] border-2 border-[#8B31FF]/60 p-2 relative shadow-2xl shadow-purple-900/40 bg-[#07050E] flex flex-col justify-between overflow-hidden">
                
                {/* 1. Base Background Image Layer */}
                {bgImage ? (
                  <img 
                    src={bgImage} 
                    alt="Background Layer" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#120D22] flex items-center justify-center text-slate-600 text-xs font-mono">
                    No Background
                  </div>
                )}

                {/* 2. Middle KOC Video Zone with Neon Stroke */}
                <div className="absolute inset-4 border-2 border-dashed border-cyan-400/80 rounded-2xl pointer-events-none z-20 shadow-[0_0_20px_rgba(0,245,212,0.4)] flex flex-col items-center justify-center">
                  <div className="px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-center space-y-1 animate-pulse">
                    <Video className="w-5 h-5 text-purple-400 mx-auto" />
                    <span className="text-[10px] font-bold text-white tracking-wide block">KOC Video Zone</span>
                  </div>
                </div>

                {/* 3. Top Overlay Frame Layer */}
                {overlayImage && (
                  <img 
                    src={overlayImage} 
                    alt="Overlay Frame Layer" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
                  />
                )}

                {/* Ambient Top Speaker Line */}
                <div className="w-12 h-1 bg-white/40 rounded-full mx-auto relative z-40" />
              </div>

            </div>
          </div>

          {/* Assign Frame Setup */}
          <div className="bg-[#110D20] border border-[#211A35] rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Assign Frame Setup</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Assigned KOCs will see this frame when processing videos</p>
            </div>

            {/* Groups */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assign to User Groups
              </label>

              <div className="min-h-[46px] p-2 bg-[#16102B] border border-[#261E3E] rounded-xl flex flex-wrap items-center gap-2">
                {userGroups.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#261A45] border border-purple-500/30 text-purple-200"
                  >
                    <span>{group}</span>
                    <button
                      type="button"
                      onClick={() => removeGroup(group)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Search and add groups..."
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  onKeyDown={handleAddGroup}
                  className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none flex-1 min-w-[140px] px-1"
                />
              </div>
            </div>

            {/* KOCs */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assign to Individual KOCs
              </label>

              <div className="min-h-[46px] p-2 bg-[#16102B] border border-[#261E3E] rounded-xl flex flex-wrap items-center gap-2">
                {individualKOCs.map((koc) => (
                  <span
                    key={koc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#261A45] border border-purple-500/30 text-purple-200"
                  >
                    <span>{koc}</span>
                    <button
                      type="button"
                      onClick={() => removeKOC(koc)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Search individual influencers..."
                  value={kocInput}
                  onChange={(e) => setKocInput(e.target.value)}
                  onKeyDown={handleAddKOC}
                  className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none flex-1 min-w-[160px] px-1"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Bottom Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1F1833]">
        <Link
          href="/admin/frames"
          className="w-full sm:w-auto text-center px-7 py-3 rounded-xl border border-[#2B1F4A] hover:bg-[#18112E] hover:border-[#3D2C68] text-slate-300 text-xs font-semibold transition-all cursor-pointer"
        >
          Cancel
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#19122E] hover:bg-[#231A3D] border border-[#2D1F4D] text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Save & Create Another
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Frame Setup</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default function CreateFramePage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Loading workspace...</div>}>
      <CreateFrameContent />
    </Suspense>
  );
}