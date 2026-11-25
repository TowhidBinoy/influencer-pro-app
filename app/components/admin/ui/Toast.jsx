"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: { fg: "#34d399", bar: "#10b981", icon: "✓" },
  error:   { fg: "#f87171", bar: "#ef4444", icon: "✕" },
  warning: { fg: "#fbbf24", bar: "#f59e0b", icon: "!" },
  info:    { fg: "#C084FC", bar: "#9033FF", icon: "i" },
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone, message, opts = {}) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts.duration ?? DEFAULT_DURATION;
      setToasts((prev) => [...prev, { id, tone, message, description: opts.description }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (msg, opts) => push("success", msg, opts),
      error:   (msg, opts) => push("error", msg, opts),
      warning: (msg, opts) => push("warning", msg, opts),
      info:    (msg, opts) => push("info", msg, opts),
      dismiss,
    }),
    [push, dismiss],
  );

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[100000] flex flex-col gap-2.5 w-[320px] max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const style = TONE_STYLES[toast.tone] || TONE_STYLES.info;
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0f0b1e]/95 backdrop-blur-md shadow-2xl pl-4 pr-3 py-3"
      style={{ borderLeftColor: style.bar, borderLeftWidth: 4 }}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
          style={{ background: `${style.bar}20`, color: style.fg }}
          aria-hidden="true"
        >
          {style.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white break-words">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-gray-400 break-words">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-gray-400 hover:text-white transition-colors text-base leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}