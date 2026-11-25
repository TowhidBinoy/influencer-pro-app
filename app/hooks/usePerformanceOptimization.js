"use client";

import { useEffect, useState } from 'react';

/**
 * Detects device hardware capability to throttle animations on low-end mobile devices.
 */
export const usePerformanceOptimization = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isMidEnd, setIsMidEnd] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cpuCores = navigator.hardwareConcurrency || 4;
      const deviceMemory = navigator.deviceMemory || 4;
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

      const start = performance.now();
      const iterations = 500000;
      for (let i = 0; i < iterations; i++) {
        Math.random();
      }
      const end = performance.now();
      const computeTime = end - start;

      const isLowEndDevice =
        cpuCores <= 4 ||
        deviceMemory <= 2 ||
        computeTime > 15 ||
        prefersReducedMotion;

      const isMidEndDevice =
        !isLowEndDevice &&
        (cpuCores <= 6 || deviceMemory <= 4 || computeTime > 7);

      setIsLowEnd(Boolean(isLowEndDevice));
      setIsMidEnd(Boolean(isMidEndDevice));
    } catch {
      // Safe fallback for browsers blocking hardware APIs
      setIsLowEnd(false);
      setIsMidEnd(false);
    }
  }, []);

  return { isLowEnd, isMidEnd };
};