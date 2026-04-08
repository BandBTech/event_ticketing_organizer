"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Router from "next/router";
import { navigationGuard } from "@/store/navigationGuardStore";

export interface UseNavigationGuardOptions {
  /**
   * Function that returns true if there are unsaved changes
   */
  hasUnsavedChanges: () => boolean;
  /**
   * Called before navigation is confirmed (useful for cleanup)
   */
  onBeforeLeave?: () => void;
}

export interface UseNavigationGuardReturn {
  showLeaveDialog: boolean;
  setShowLeaveDialog: (show: boolean) => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
  handleNavigateAway: (navigationAction: () => void) => void;
}

/**
 * Hook to guard against navigation when there are unsaved changes.
 * Handles:
 * - Browser refresh/close (beforeunload)
 * - All client-side route changes via Next.js Router events (Links, router.push, back/forward)
 */
export function useNavigationGuard({
  hasUnsavedChanges,
  onBeforeLeave,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const isConfirmedNavigation = useRef(false);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle all client-side navigation via Next.js Router events
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (isConfirmedNavigation.current) {
        isConfirmedNavigation.current = false;
        return;
      }

      if (hasUnsavedChanges()) {
        setPendingNavigation(() => () => {
          Router.push(url);
        });
        setShowLeaveDialog(true);

        // Abort the current route change
        Router.events.emit("routeChangeError");
        // eslint-disable-next-line no-throw-literal
        throw "Route change aborted due to unsaved changes.";
      }
    };

    Router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [hasUnsavedChanges]);

  const confirmLeave = useCallback(() => {
    onBeforeLeave?.();
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      isConfirmedNavigation.current = true;
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [onBeforeLeave, pendingNavigation]);

  const cancelLeave = useCallback(() => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  }, []);

  const handleNavigateAway = useCallback(
    (navigationAction: () => void) => {
      if (hasUnsavedChanges()) {
        setPendingNavigation(() => navigationAction);
        setShowLeaveDialog(true);
      } else {
        navigationAction();
      }
    },
    [hasUnsavedChanges]
  );

  // Register with the global singleton so non-intercepted navigations (e.g. logout button) can trigger the guard
  useEffect(() => {
    navigationGuard.register(handleNavigateAway);
    return () => navigationGuard.unregister();
  }, [handleNavigateAway]);

  return {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
  };
}
