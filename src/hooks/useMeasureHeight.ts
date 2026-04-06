"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to measure an element's height and update a CSS variable
 * @param cssVariableName - The CSS variable name to update (e.g., "--header-height")
 * @returns A ref to attach to the element you want to measure
 */
export function useMeasureHeight(cssVariableName: string) {
  const ref = useRef<HTMLElement>(null);

  const updateHeight = useCallback(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      document.documentElement.style.setProperty(
        cssVariableName,
        `${height}px`,
      );
    }
  }, [cssVariableName]);

  useEffect(() => {
    // Initial measurement
    updateHeight();

    // Update on window resize
    window.addEventListener("resize", updateHeight);

    // Use ResizeObserver for more accurate measurements
    const observer = new ResizeObserver(updateHeight);
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [updateHeight]);

  return ref;
}
