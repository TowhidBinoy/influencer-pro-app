"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = MONTH_LABELS.map((m) => m.slice(0, 3));

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date, from, to) {
  if (!from || !to) return false;
  const t = date.getTime();
  return t > from.getTime() && t < to.getTime();
}

function isoOrNull(date) {
  return date ? toIso(date) : null;
}

function formatTrigger(fromIso, toIso) {
  const from = parseIso(fromIso);
  const to = parseIso(toIso);
  if (!from || !to) return null;
  const f = `${from.getDate()} ${MONTH_SHORT[from.getMonth()]}`;
  const t = `${to.getDate()} ${MONTH_SHORT[to.getMonth()]}`;
  return `${f} – ${t}`;
}

function formatPanelLabel(date) {
  if (!date) return "—";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

const PRESETS = [
  { id: "today", label: "Today", range: (today) => ({ from: today, to: today }) },
  { id: "yesterday", label: "Yesterday", range: (today) => { const d = addDays(today, -1); return { from: d, to: d }; } },
  { id: "last7", label: "Last 7 Days", range: (today) => ({ from: addDays(today, -6), to: today }) },
  { id: "last30", label: "Last 30 Days", range: (today) => ({ from: addDays(today, -29), to: today }) },
  { id: "thisMonth", label: "This Month", range: (today) => ({ from: startOfMonth(today), to: endOfMonth(today) }) },
  { id: "lastMonth", label: "Last Month", range: (today) => { const lm = addMonths(today, -1); return { from: startOfMonth(lm), to: endOfMonth(lm) }; } },
  { id: "custom", label: "Custom Range", range: null },
];

function detectPreset(from, to, today) {
  if (!from || !to) return null;
  for (const p of PRESETS) {
    if (!p.range) continue;
    const r = p.range(today);
    if (isSameDay(r.from, from) && isSameDay(r.to, to)) return p.id;
  }
  return "custom";
}

function buildCells(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const lead = first.getDay();
  const total = last.getDate();
  const cells = [];

  if (lead > 0) {
    const prevTotal = new Date(year, month, 0).getDate();
    for (let i = lead - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevTotal - i);
      cells.push({ date: d, inMonth: false });
    }
  }
  for (let day = 1; day <= total; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length < 42) {
    const last2 = cells[cells.length - 1].date;
    cells.push({ date: addDays(last2, 1), inMonth: false });
  }
  return cells;
}

const PANEL_WIDTH = 600;
const PANEL_HEIGHT = 360;

export default function RangePicker({
  fromDate,
  toDate,
  onApply,
  trigger,
  align = "left",
  placeholder = "Select Date",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerLabel = formatTrigger(fromDate, toDate) || placeholder;
  const wrapperRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, bottom: undefined, left: 0, align: "left" });

  const reposition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let resolvedAlign = align;
    if (align === "left" && r.left + PANEL_WIDTH > window.innerWidth - 16) {
      resolvedAlign = "right";
    }
    const openUpward = r.bottom + PANEL_HEIGHT > window.innerHeight - 8;
    setPosition({
      top: openUpward ? undefined : r.bottom + 8,
      bottom: openUpward ? window.innerHeight - r.top + 8 : undefined,
      left: resolvedAlign === "right" ? r.right : r.left,
      align: resolvedAlign,
    });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, reposition]);

  return (
    <div ref={wrapperRef} className="inline-flex">
      {trigger ? (
        trigger({ open: () => setIsOpen(true), label: triggerLabel, hasValue: !!fromDate && !!toDate })
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 h-9 rounded-lg px-3 py-2 border border-white/10 bg-white/5 text-xs font-medium text-white transition hover:bg-white/10"
        >
          <CalendarIcon />
          <span className="whitespace-nowrap">{triggerLabel}</span>
        </button>
      )}
      {isOpen && (
        <RangePickerPopover
          fromIso={fromDate}
          toIso={toDate}
          onClose={() => setIsOpen(false)}
          onApply={(f, t) => {
            onApply?.(f, t);
            setIsOpen(false);
          }}
          position={position}
        />
      )}
    </div>
  );
}

function RangePickerPopover({ fromIso, toIso, onClose, onApply, position }) {
  const align = position.align;
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const [from, setFrom] = useState(parseIso(fromIso));
  const [to, setTo] = useState(parseIso(toIso));
  const [pickingEnd, setPickingEnd] = useState("from");
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parseIso(fromIso) || today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const activePreset = detectPreset(from, to, today);

  const applyPreset = (preset) => {
    if (!preset.range) return;
    const r = preset.range(today);
    setFrom(r.from);
    setTo(r.to);
    setPickingEnd("from");
    setViewMonth(new Date(r.from.getFullYear(), r.from.getMonth(), 1));
  };

  const handleCellClick = (date) => {
    if (pickingEnd === "from") {
      setFrom(date);
      if (to && date.getTime() > to.getTime()) setTo(null);
      setPickingEnd("to");
      return;
    }
    if (from && date.getTime() < from.getTime()) {
      setFrom(date);
      setTo(null);
      setPickingEnd("to");
      return;
    }
    setTo(date);
    setPickingEnd("from");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const leftMonth = viewMonth;
  const rightMonth = addMonths(viewMonth, 1);

  const panel = (
    <div className="fixed inset-0 z-[1000]" onMouseDown={onClose}>
      <div
        className="absolute"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: align === "right" ? undefined : position.left,
          right: align === "right" ? `calc(100vw - ${position.left}px)` : undefined,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col w-[540px] sm:w-[600px] rounded-2xl border border-white/10 bg-[#0f0b1e] shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="flex">
            <PresetRail activePreset={activePreset} onSelect={applyPreset} />
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setViewMonth((v) => addMonths(v, -1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <ChevronLeft />
                </button>
                <div className="flex flex-1 items-center justify-around">
                  <span className="text-xs font-semibold text-white">
                    {MONTH_LABELS[leftMonth.getMonth()]} {leftMonth.getFullYear()}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {MONTH_LABELS[rightMonth.getMonth()]} {rightMonth.getFullYear()}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setViewMonth((v) => addMonths(v, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CalendarGrid month={leftMonth} from={from} to={to} today={today} onPick={handleCellClick} />
                <CalendarGrid month={rightMonth} from={from} to={to} today={today} onPick={handleCellClick} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-3">
            <span className="text-xs font-mono text-gray-300">
              {formatPanelLabel(from)} – {formatPanelLabel(to)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onApply(isoOrNull(from), isoOrNull(to))}
                disabled={!from || !to}
                className="rounded-lg bg-[#9033FF] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#7825DC] disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

function PresetRail({ activePreset, onSelect }) {
  return (
    <ul className="flex flex-col w-[130px] shrink-0 border-r border-white/10 bg-white/[0.02] py-2">
      {PRESETS.map((p) => {
        const active = p.id === activePreset;
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={`flex w-full items-center justify-start px-3 py-2 text-xs font-medium transition-colors ${
                active ? "bg-[#9033FF]/20 text-[#B13CFF] font-semibold border-l-2 border-[#9033FF]" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CalendarGrid({ month, from, to, today, onPick }) {
  const cells = useMemo(() => buildCells(month.getFullYear(), month.getMonth()), [month]);
  return (
    <div className="grid grid-cols-7 gap-y-0.5 text-center">
      {WEEKDAY_LABELS.map((w) => (
        <span key={w} className="text-[10px] font-semibold text-gray-500 py-1">
          {w}
        </span>
      ))}
      {cells.map((cell, i) => {
        const inMonth = cell.inMonth;
        const isFrom = inMonth && from && isSameDay(cell.date, from);
        const isTo = inMonth && to && isSameDay(cell.date, to);
        const isEnd = isFrom || isTo;
        const inRange = inMonth && isBetween(cell.date, from, to);
        const isToday = inMonth && isSameDay(cell.date, today);

        return (
          <button
            type="button"
            key={i}
            onClick={() => inMonth && onPick(cell.date)}
            disabled={!inMonth}
            className={`relative flex h-7 items-center justify-center text-xs transition-colors ${
              !inMonth ? "text-gray-600" : "text-gray-300"
            } ${inRange ? "bg-[#9033FF]/15 text-white" : ""} ${
              isEnd ? "" : `rounded-md ${inMonth ? "hover:bg-white/10 hover:text-white" : ""}`
            }`}
          >
            <span
              className={
                isEnd
                  ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#9033FF] text-white font-semibold shadow-md shadow-[#9033FF]/30"
                  : isToday
                  ? "flex h-6 w-6 items-center justify-center rounded-full border border-[#9033FF] text-[#B13CFF]"
                  : ""
              }
            >
              {cell.date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}