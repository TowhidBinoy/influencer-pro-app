"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../ui/Button";

export default function AddExclusionsModal({ open, value, onChange, onSubmit, onClose, busy = false, error = "" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={busy ? undefined : onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        className="relative w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#0f0b1e] p-6 shadow-2xl"
      >
        <h2 className="mb-2 text-xl font-bold text-white">
          Exclude Influencers
        </h2>
        <p className="mb-4 text-xs leading-5 text-gray-400">
          Enter one Influencer / Creator ID per line to hide them from public leaderboards.
        </p>
        <label htmlFor="leaderboard-member-ids" className="mb-2 block text-xs font-semibold text-gray-300">
          Influencer IDs
        </label>
        <textarea
          id="leaderboard-member-ids"
          autoFocus
          rows={5}
          value={value}
          disabled={busy}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={"INF-1029\nINF-4482"}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#9033FF] disabled:opacity-50"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>Exclude</Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}