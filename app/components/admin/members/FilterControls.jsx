"use client";

import { useState, useEffect, useRef } from "react";
import RangePicker from "../RangePicker";

export function FilterDropdown({ label, options, value, onChange, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 rounded-lg border border-white/10 bg-white/5 px-3 py-2 shrink-0 transition-colors hover:bg-white/10"
      >
        <span className="text-[13px] text-white whitespace-nowrap">
          {value || label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 z-50 min-w-[180px] max-h-[280px] overflow-y-auto rounded-xl border border-white/10 bg-[#0f0b1e] p-1 shadow-2xl backdrop-blur-md ${align === "right" ? "right-0" : "left-0"}`}>
          <button
            key="all-option"
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
              !value
                ? "text-[#B13CFF] bg-[#9033FF]/15 font-medium"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            All
          </button>
          {options.map((opt, index) => (
            <button
              type="button"
              key={`${opt}-${index}`}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                value === opt
                  ? "text-[#B13CFF] bg-[#9033FF]/15 font-medium"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateFilter({ label, fromDate, toDate, onFromChange, onToChange, align = "left" }) {
  const hasValue = fromDate || toDate;
  const handleApply = (f, t) => {
    onFromChange(f || "");
    onToChange(t || "");
  };

  return (
    <RangePicker
      fromDate={fromDate}
      toDate={toDate}
      onApply={handleApply}
      align={align}
      trigger={({ open, label: rangeLabel, hasValue: rangeHasValue }) => (
        <button
          type="button"
          onClick={open}
          className="flex items-center gap-2 h-9 rounded-lg border border-white/10 bg-white/5 px-3 py-2 shrink-0 transition-colors hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[13px] text-white whitespace-nowrap">
            {rangeHasValue ? rangeLabel : label}
          </span>
          {hasValue && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    />
  );
}

export function TextSearchInput({ placeholder, value, onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-[150px] sm:w-[180px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-gray-500 outline-none focus:border-[#9033FF] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-[15px]"
        >
          &times;
        </button>
      )}
    </div>
  );
}