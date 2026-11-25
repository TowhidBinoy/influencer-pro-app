"use client";

import { motion } from "framer-motion";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Submission Successful!",
  message = "Your campaign proof has been submitted for verification.",
  actions = null,
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[320px] rounded-3xl border border-[#2B1F4A] bg-[#120D22] p-6 shadow-2xl text-center"
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-xs"
        >
          ✕
        </button>

        {/* Success Icon */}
        <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9033FF]/20 border border-[#9033FF]/40 text-[#B13CFF] shadow-lg shadow-[#9033FF]/20">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          {actions && actions.length > 0 ? (
            actions.map((act, i) => (
              <button
                key={i}
                type="button"
                onClick={act.onClick}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  act.variant === "secondary"
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                    : "bg-[#9033FF] hover:bg-[#7825DC] text-white shadow-md shadow-[#9033FF]/30"
                }`}
              >
                {act.label}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#9033FF] hover:bg-[#7825DC] text-white text-xs font-semibold shadow-md shadow-[#9033FF]/30 transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}