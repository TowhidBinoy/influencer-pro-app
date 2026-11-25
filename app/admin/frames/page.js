'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Copy, Trash2, Edit3, AlertCircle } from 'lucide-react';

const DEFAULT_FRAMES = [
  {
    id: 'frame_1',
    title: 'Vlog Border Neon Purple',
    assignedTo: 'Group Alpha (14 KOCs)',
    createdAt: 'Jan 12, 2026',
    bgImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'frame_2',
    title: 'Retro VHS Border Setup',
    assignedTo: 'Chloe Tan, Eliska Jones',
    createdAt: 'Jan 15, 2026',
    bgImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'frame_3',
    title: 'Clean Minimal Cinematic',
    assignedTo: 'Group Beta (29 KOCs)',
    createdAt: 'Jan 18, 2026',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
  },
];

export default function FrameManagementPage() {
  const [frames, setFrames] = useState(DEFAULT_FRAMES);
  const [frameToDelete, setFrameToDelete] = useState(null);

  // Sync with dynamically uploaded setups
  useEffect(() => {
    const stored = localStorage.getItem('postdesk_custom_frames');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFrames(parsed);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleDuplicate = (frame) => {
    const duplicated = {
      ...frame,
      id: `frame_${Date.now()}`,
      title: `${frame.title} (Copy)`,
      createdAt: 'Today',
    };
    const updated = [duplicated, ...frames];
    setFrames(updated);
    localStorage.setItem('postdesk_custom_frames', JSON.stringify(updated));
  };

  const handleDeleteConfirm = () => {
    if (!frameToDelete) return;
    const updated = frames.filter((f) => f.id !== frameToDelete.id);
    setFrames(updated);
    localStorage.setItem('postdesk_custom_frames', JSON.stringify(updated));
    setFrameToDelete(null);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-16 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Frame Management
          </h1>
        </div>

        <Link
          href="/admin/frames/create"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Frame Setup</span>
        </Link>
      </div>

      <div>
        <h2 className="text-base font-bold text-white tracking-wide">
          Active Frame Setups
        </h2>
      </div>

      {/* Frame Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="bg-[#110D20] border border-[#211A35] hover:border-[#8B31FF]/60 rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/30 group flex flex-col justify-between relative overflow-hidden"
          >
            {/* Dynamic Real Image Render with Zoom Effect */}
            <div className="w-full h-44 sm:h-48 rounded-2xl relative overflow-hidden border border-[#2B1F4A] bg-[#0A0714] shadow-inner group-hover:border-purple-500/50 transition-colors">
              <img
                src={frame.bgImage || DEFAULT_FRAMES[0].bgImage}
                alt={frame.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Ambient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0716] via-transparent to-black/30 pointer-events-none" />

              {/* Corner Accents */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-purple-400/80 rounded-tl" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-purple-400/80 rounded-tr" />
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-purple-400/80 rounded-bl" />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-purple-400/80 rounded-br" />
            </div>

            {/* Metadata */}
            <div className="mt-4 space-y-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors truncate">
                {frame.title}
              </h3>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>Assigned to: <span className="text-slate-300">{frame.assignedTo}</span></p>
                <p className="text-slate-500 text-[10px]">Created {frame.createdAt}</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-[#1C1438] flex items-center gap-4 text-xs font-semibold">
              <Link
                href={`/admin/frames/create?id=${frame.id}`}
                className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Edit
              </Link>
              
              <button
                onClick={() => handleDuplicate(frame)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Duplicate
              </button>

              <button
                onClick={() => setFrameToDelete(frame)}
                className="text-[#FF4D73] hover:text-[#FF6B8B] transition-colors cursor-pointer ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {frameToDelete && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete Frame</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{frameToDelete.title}</span>?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setFrameToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-[#1B142F] border border-[#2B1F4A] text-slate-300 text-xs font-semibold hover:bg-[#251B40] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-[#FF4D73] hover:bg-[#FF335E] text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}