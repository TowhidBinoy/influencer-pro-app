'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// value/onChange use "YYYY-MM-DDTHH:mm" — the same shape <input type="datetime-local">
// produces, so this stays a drop-in wherever that was used (job start_date/end_date).
function parseValue(value) {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  const [y, m, d] = (datePart || '').split('-').map(Number);
  const [h, min] = (timePart || '00:00').split(':').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d, hour: h || 0, minute: min || 0 };
}

function formatLabel(value) {
  const parsed = parseValue(value);
  if (!parsed) return '';
  const dd = String(parsed.day).padStart(2, '0');
  const mm = String(parsed.month).padStart(2, '0');
  const hh = String(parsed.hour).padStart(2, '0');
  const mn = String(parsed.minute).padStart(2, '0');
  return `${dd}/${mm}/${parsed.year} ${hh}:${mn}`;
}

function daysInMonth(year, month1) {
  return new Date(year, month1, 0).getDate();
}

function firstWeekday(year, month1) {
  return new Date(year, month1 - 1, 1).getDay();
}

function buildValue(year, month, day, hour, minute) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/**
 * Themed replacement for <input type="datetime-local">, whose native
 * display format follows OS locale (mm/dd/yyyy here) rather than
 * dd/mm/yyyy, and whose popover only opens via a small icon click target.
 * Portaled to document.body and positioned via the trigger's bounding
 * rect, same as DatePicker — this is used inside modals that clip
 * overflow (max-h + overflow-y-auto).
 */
export default function DateTimePicker({ value, onChange, placeholder = 'dd/mm/yyyy --:--', minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const parsed = parseValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month || today.getMonth() + 1);
  const [hour, setHour] = useState(parsed?.hour ?? 0);
  const [minute, setMinute] = useState(parsed?.minute ?? 0);

  useEffect(() => {
    if (isOpen) {
      setViewYear(parsed?.year || today.getFullYear());
      setViewMonth(parsed?.month || today.getMonth() + 1);
      setHour(parsed?.hour ?? 0);
      setMinute(parsed?.minute ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateCoords();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const dateKey = (day) => `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isDisabled = (day) => {
    if (!minDate) return false;
    return dateKey(day) < minDate.slice(0, 10);
  };

  const pickDay = (day) => {
    if (isDisabled(day)) return;
    onChange(buildValue(viewYear, viewMonth, day, hour, minute));
  };

  const applyTime = (nextHour, nextMinute) => {
    setHour(nextHour);
    setMinute(nextMinute);
    if (parsed) onChange(buildValue(parsed.year, parsed.month, parsed.day, nextHour, nextMinute));
  };

  const isSelected = (day) => parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day;
  const isToday = (day) => viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1 && day === today.getDate();

  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = firstWeekday(viewYear, viewMonth);
  const cells = [...Array(leadingBlanks).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 hover:border-[#9033FF] focus:border-[#9033FF] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#B13CFF] shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`whitespace-nowrap ${value ? 'text-white' : 'text-gray-500'}`}>
            {value ? formatLabel(value) : placeholder}
          </span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && coords && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 272) }}
          className="z-[100000] w-68 rounded-2xl border border-[#2B1F4A] bg-[#140E28] shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#231A3D]">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Previous month"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs font-bold text-white">{MONTH_SHORT[viewMonth - 1]} {viewYear}</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Next month"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 px-2.5 pt-2.5">
            {WEEKDAY_SHORT.map((w) => (
              <span key={w} className="text-[9px] font-bold text-slate-500 text-center uppercase">{w}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2.5">
            {cells.map((day, idx) =>
              day === null ? (
                <span key={`blank-${idx}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled(day)}
                  onClick={() => pickDay(day)}
                  className={`aspect-square rounded-lg text-[11px] font-semibold transition-all ${
                    isDisabled(day)
                      ? 'text-slate-700 cursor-not-allowed'
                      : isSelected(day)
                      ? 'bg-[#762CFF] text-white shadow-md shadow-[#762CFF]/30 cursor-pointer'
                      : isToday(day)
                      ? 'border border-[#762CFF]/60 text-[#B13CFF] hover:bg-white/5 cursor-pointer'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
          <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-t border-[#231A3D]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B13CFF] shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <select
              value={hour}
              onChange={(e) => applyTime(Number(e.target.value), minute)}
              className="bg-[#18112E] border border-[#2B1F4A] rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-slate-500 text-xs font-bold">:</span>
            <select
              value={minute}
              onChange={(e) => applyTime(hour, Number(e.target.value))}
              className="bg-[#18112E] border border-[#2B1F4A] rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 60 }, (_, m) => m).filter((m) => m % 5 === 0).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
