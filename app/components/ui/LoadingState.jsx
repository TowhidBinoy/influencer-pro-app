"use client";

import LoadingOverlay from "../admin/ui/LoadingOverlay";

function LoadingSpinner({ size = "medium" }) {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-2",
    large: "w-12 h-12 border-3",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-[#9033FF]/20 border-t-[#9033FF] rounded-full animate-spin`}
    />
  );
}

export function LoadingState({ isLoading, children, skeleton, message }) {
  if (isLoading) {
    if (skeleton) {
      return (
        <div className="relative">
          {skeleton}
          <LoadingOverlay label={message || "Loading data..."} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3">
        <LoadingSpinner size="large" />
        {message && <span className="text-gray-400 text-xs">{message}</span>}
      </div>
    );
  }
  return children;
}

export function LoadingButton({ isLoading, children, disabled, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`${className} ${isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="small" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingState;