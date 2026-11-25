'use client';

import { useEffect, useRef, useState } from 'react';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseMonthKey(key) {
  const [y, m] = (key || '').split('-').map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
}

function formatLabel(key) {
  const parsed = parseMonthKey(key);
  if (!parsed) return 'Select month';
  return `${MONTH_SHORT[parsed.month - 1]} ${parsed.year}`;
}

/**
 * Themed replacement for <input type="month">, whose native popover
 * ignores the app's dark theme. Value/onChange both use "YYYY-MM" to stay
 * a drop-in swap for the earnings page's month filter.
 */
export default function MonthPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const parsed = parseMonthKey(value) || (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  })();
  const [viewYear, setViewYear] = useState(parsed.year);

  useEffect(() => {
    if (isOpen) setViewYear(parsed.year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const pickMonth = (monthIndex1) => {
    onChange(`${viewYear}-${String(monthIndex1).padStart(2, '0')}`);
    setIsOpen(false);
  };

  const isSelected = (monthIndex1) => parsed.year === viewYear && parsed.month === monthIndex1;
  const isCurrent = (monthIndex1) => {
    const now = new Date();
    return viewYear === now.getFullYear() && monthIndex1 === now.getMonth() + 1;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-[#18112E] border border-[#2B1F4A] hover:border-[#762CFF] focus:border-[#762CFF] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#B13CFF] shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="whitespace-nowrap">{formatLabel(value)}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-56 rounded-2xl border border-[#2B1F4A] bg-[#140E28] shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#231A3D]">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Previous year"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs font-bold text-white">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Next year"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-2.5">
            {MONTH_SHORT.map((label, idx) => {
              const monthIndex1 = idx + 1;
              const selected = isSelected(monthIndex1);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => pickMonth(monthIndex1)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#762CFF] text-white shadow-md shadow-[#762CFF]/30'
                      : isCurrent(monthIndex1)
                      ? 'border border-[#762CFF]/60 text-[#B13CFF] hover:bg-white/5'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
