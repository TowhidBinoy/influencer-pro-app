"use client";

const TONE = {
  success: { fg: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", dot: "#10b981" },
  warning: { fg: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", dot: "#f59e0b" },
  danger:  { fg: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", dot: "#ef4444" },
  info:    { fg: "#C084FC", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.25)", dot: "#9033FF" },
  neutral: { fg: "rgba(255,255,255,0.7)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", dot: "rgba(255,255,255,0.4)" },
};

export default function StatusBadge({ tone = "neutral", children, showDot = true, className = "" }) {
  const c = TONE[tone] || TONE.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      style={{ color: c.fg, background: c.bg, borderColor: c.border }}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: c.dot }}
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}