"use client";

const VARIANT = {
  primary:
    "bg-[#9033FF] text-white hover:bg-[#7825DC] focus-visible:ring-[#9033FF]/60 shadow-lg shadow-[#9033FF]/20",
  secondary:
    "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 focus-visible:ring-white/30",
  destructive:
    "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 focus-visible:ring-red-500/50",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500/60",
  ghost:
    "bg-transparent text-white/70 hover:text-white hover:bg-white/5 focus-visible:ring-white/20",
};

const SIZE = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

function Spinner({ size }) {
  const dim = size === "sm" ? 12 : size === "lg" ? 18 : 14;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      className="animate-spin shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const base =
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${base} ${VARIANT[variant] || VARIANT.primary} ${SIZE[size] || SIZE.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={size} /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}