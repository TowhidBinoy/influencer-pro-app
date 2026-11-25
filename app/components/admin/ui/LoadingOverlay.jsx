"use client";

export default function LoadingOverlay({
  label,
  size = 48,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#07050E]/80 backdrop-blur-sm ${className}`}
    >
      <div style={{ height: size, width: size }}>
        <div
          className="h-full w-full rounded-full border-2 border-[#9033FF]/20 border-t-[#9033FF] animate-spin"
        />
      </div>
      {label ? (
        <p className="text-xs font-medium text-gray-300">
          {label}
        </p>
      ) : null}
    </div>
  );
}