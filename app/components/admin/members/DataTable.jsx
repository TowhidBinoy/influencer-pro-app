"use client";

import { useState } from "react";

export function SortIcon({ active, direction }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 ml-1">
      <path
        d="M4 5L7 2L10 5"
        stroke={active && direction === "asc" ? "#B13CFF" : "rgba(255,255,255,0.3)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={active && direction === "desc" ? "#B13CFF" : "rgba(255,255,255,0.3)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 pt-4 pr-2 pb-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-[13px] text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1"
      >
        Previous
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="text-[13px] text-white/40 px-1">
            ...
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`text-[13px] min-w-[28px] h-[28px] rounded-md flex items-center justify-center transition-colors ${
              currentPage === page
                ? "bg-[#9033FF] text-white font-semibold shadow-md shadow-[#9033FF]/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-[13px] text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1"
      >
        Next
      </button>

      {totalPages > 7 && (
        <GoToPage totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}

function GoToPage({ totalPages, onPageChange }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(totalPages, Math.max(1, n));
    onPageChange(clamped);
    setValue("");
  };

  return (
    <div className="ml-2 flex items-center gap-1.5">
      <span className="text-[13px] text-white/60">Go to</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={String(totalPages)}
        aria-label={`Go to page (1 to ${totalPages})`}
        className="h-[28px] w-[52px] rounded-md border border-white/15 bg-white/5 px-2 text-center text-[13px] text-white placeholder:text-white/30 focus:border-[#9033FF] focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!value}
        className="h-[28px] rounded-md border border-[#9033FF] px-2 text-[12px] font-medium text-[#B13CFF] hover:bg-[#9033FF]/15 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Go
      </button>
    </div>
  );
}

function SkeletonRow({ columns }) {
  return (
    <tr className="border-b border-white/5">
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-4">
          <div
            className={`h-3.5 rounded bg-white/10 animate-pulse ${col.align === "right" ? "ml-auto" : ""}`}
            style={{ width: `${40 + ((col.key?.length ?? 6) * 7) % 50}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function DataTable({
  columns,
  rows,
  sortKey,
  sortDir,
  onSort,
  renderCell,
  emptyMessage = "No records found.",
  isLoading = false,
  skeletonRows = 6,
  maxHeight,
}) {
  const sticky = !!maxHeight;
  return (
    <div
      className="overflow-auto rounded-xl border border-white/10 bg-white/[0.02]"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full min-w-[700px]">
        <thead className={sticky ? "sticky top-0 z-10" : ""}>
          <tr className="border-b border-white/10 bg-[#0d091a]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.minW || ""} px-4 py-3.5 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                onClick={() => onSort?.(col.key)}
              >
                <div className={`flex items-center ${col.align === "right" ? "justify-end" : "justify-start"}`}>
                  <span className="font-semibold text-xs uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {col.label}
                  </span>
                  <SortIcon active={sortKey === col.key} direction={sortDir} />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={`sk-${i}`} columns={columns} />
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 text-sm text-gray-200 whitespace-nowrap ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}