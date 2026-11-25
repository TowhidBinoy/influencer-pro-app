'use client';

// Dual-handle trim scrubber for video: drag either end to move that handle
// only, the span between them is what gets kept (trimIn -> trimOut). Two
// overlapping native range inputs is the lightest way to get two
// independent thumbs on one track without a slider library — the ".trim-
// thumb" rule in globals.css makes only each thumb (not its track) capture
// pointer events, so the two inputs don't fight each other.
export default function VideoTrimBar({ duration, trimIn, trimOut, onChange }) {
  if (!duration) return null;

  const startPct = (trimIn / duration) * 100;
  const endPct = (trimOut / duration) * 100;

  const handleInChange = (e) => {
    const next = Math.min(Number(e.target.value), trimOut - 0.1);
    onChange({ trimIn: Math.max(0, next), trimOut });
  };

  const handleOutChange = (e) => {
    const next = Math.max(Number(e.target.value), trimIn + 0.1);
    onChange({ trimIn, trimOut: Math.min(duration, next) });
  };

  return (
    <div className="space-y-1.5 px-1">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{formatTime(trimIn)}</span>
        <span className="text-[#B13CFF] font-bold uppercase tracking-wide">Trim</span>
        <span>{formatTime(trimOut)}</span>
      </div>

      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-[#231A3D] rounded-full" />
        <div
          className="absolute h-1.5 bg-[#B13CFF] rounded-full"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimIn}
          onChange={handleInChange}
          className="trim-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
          aria-label="Trim start"
        />
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimOut}
          onChange={handleOutChange}
          className="trim-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
          aria-label="Trim end"
        />
      </div>
    </div>
  );
}

function formatTime(secs) {
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
}
