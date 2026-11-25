'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';

/**
 * Renders nothing until guides exist for `location` (GUIDE_LOCATION,
 * lib/choices.js) — a collapsed "Tips" card that expands to show them.
 * Drop this on any member screen that doesn't already have its own full
 * guide page (Rules gets its own page: /more/rules).
 */
export default function GuideHelp({ location, label = 'Tips & Guides' }) {
  const [guides, setGuides] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null); // one guide's content shown at a time

  const loadGuides = useCallback(async () => {
    try {
      const data = await apiFetch(`${ENDPOINTS.MEMBER.GUIDES}?location=${location}&page_size=50`);
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      rows.sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
      setGuides(rows);
    } catch {
      setGuides([]); // help content only — never blocks the screen
    }
  }, [location]);

  useEffect(() => { loadGuides(); }, [loadGuides]);

  if (guides.length === 0) return null;

  return (
    <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-3.5 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1D1438] border border-[#2B1F4A] flex items-center justify-center text-[#B13CFF] shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-[#B13CFF] uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90 text-[#B13CFF]' : ''}`}>›</span>
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 space-y-2 border-t border-[#231A3D] pt-3">
          {guides.map((guide, idx) => {
            const isExpanded = guides.length === 1 || activeGuide === guide.uuid;
            return (
              <div
                key={guide.uuid}
                onClick={() => guides.length > 1 && setActiveGuide(isExpanded ? null : guide.uuid)}
                className={`border rounded-xl p-2.5 transition-all ${guides.length > 1 ? 'cursor-pointer' : ''} ${
                  isExpanded ? 'bg-[#191133] border-[#762CFF]/60' : 'bg-[#18112E] border-[#261A45] hover:border-[#382860]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-bold text-white truncate">{guide.title || `Tip ${idx + 1}`}</h4>
                  {guides.length > 1 && (
                    <span className={`text-slate-400 text-xs shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#B13CFF]' : ''}`}>›</span>
                  )}
                </div>
                {isExpanded && (
                  <div
                    className="mt-2 pt-2 border-t border-[#2B1F4A] text-[11px] text-slate-300 leading-relaxed [&_a]:text-[#B13CFF] [&_a]:underline [&_p]:mb-1.5"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
