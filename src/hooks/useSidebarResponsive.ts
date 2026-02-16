"use client";

import { useEffect } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useUIStore } from "@/store/uiStore";

/**
 * Hook to handle sidebar responsive behavior:
 * - >= 1025: Default expanded (store controls manually)
 * - 768 <= width < 1025: Auto collapse
 * - < 768: Hide sidebar
 */
export function useSidebarResponsive() {
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { setCollapsed, setSidebarOpen } = useUIStore();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setCollapsed(false);
    } else if (isTablet) {
      setCollapsed(true);
      setSidebarOpen(true);
    } else {
      setCollapsed(false);
      setSidebarOpen(true);
    }
  }, [isTablet, isMobile, setCollapsed, setSidebarOpen]);
}
