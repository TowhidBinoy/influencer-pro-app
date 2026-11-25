"use client";

import { createContext, useCallback, useContext, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "imp_admin_sidebar_collapsed";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function getStoredSidebarCollapsed(defaultValue = false) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === null) return defaultValue;
    return stored === "true";
  } catch {
    return defaultValue;
  }
}

function storeSidebarCollapsed(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "true" : "false");
  } catch {
    // Ignore storage failures
  }
}

export function SidebarProvider({ children, initialCollapsed = false }) {
  const [collapsed, setCollapsedState] = useState(() => getStoredSidebarCollapsed(initialCollapsed));

  const setCollapsed = useCallback((value) => {
    setCollapsedState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      storeSidebarCollapsed(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => setCollapsed((v) => !v), [setCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}