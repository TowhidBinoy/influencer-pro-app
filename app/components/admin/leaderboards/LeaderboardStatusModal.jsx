"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-[#9033FF]" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function LeaderboardStatusModal({ open, onClose, initial, onSave }) {
  const [isOpen, setIsOpen] = useState(initial ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setIsOpen(Boolean(initial ?? true));
  }, [initial, open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(isOpen);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#0f0b1e] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2">Leaderboard Visibility</h2>
        <p className="mb-4 text-xs leading-5 text-gray-400">
          Control whether the public rankings and weekly reward tiers are visible to creators.
        </p>
        <Toggle checked={isOpen} onChange={setIsOpen} label="Public Leaderboard Active" />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}