"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Router from "next/router";
import { navigationGuard } from "@/store/navigationGuardStore";

export interface UseNavigationGuardOptions {
  hasUnsavedChanges: () => boolean;
  onBeforeLeave?: () => void;
}

export interface UseNavigationGuardReturn {
  showLeaveDialog: boolean;
  setShowLeaveDialog: (show: boolean) => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
  handleNavigateAway: (navigationAction: () => void) => void;
  bypassNextNavigation: () => void;
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
  // True when the intercepted navigation was triggered by the device back button (popstate).
  // On confirm we use history.go(-2) instead of Router.push to avoid polluting the history
  // stack — Router.push on a popstate-confirm causes the same scanner URL to accumulate
  // across events, trapping the user in a back-button loop.
  const pendingWasPopstateRef = useRef(false);

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

  // Track whether the most recent navigation event came from the back/forward button.
  // popstate fires synchronously before routeChangeStart, so the flag is always set
  // by the time the route change handler reads it.
  const lastWasPopstateRef = useRef(false);
  useEffect(() => {
    const onPopstate = () => { lastWasPopstateRef.current = true; };
    window.addEventListener("popstate", onPopstate);
    return () => window.removeEventListener("popstate", onPopstate);
  }, []);

  // Handle all client-side navigation via Next.js Router events
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (isConfirmedNavigation.current) {
        isConfirmedNavigation.current = false;
        lastWasPopstateRef.current = false;
        return;
      }

      if (hasUnsavedChanges()) {
        const fromPopstate = lastWasPopstateRef.current;
        lastWasPopstateRef.current = false;
        pendingWasPopstateRef.current = fromPopstate;

        setPendingNavigation(() => () => {
          Router.push(url);
        });
        setShowLeaveDialog(true);

        // Abort the current route change
        Router.events.emit("routeChangeError");
        // eslint-disable-next-line no-throw-literal
        throw "Route change aborted due to unsaved changes.";
      }

      lastWasPopstateRef.current = false;
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
      if (pendingWasPopstateRef.current) {
        // When the back button triggered the guard, Next.js pushed the current URL
        // onto the stack to recover the aborted navigation. go(-2) skips that
        // recovery entry and reaches the intended destination without adding a new
        // history entry — preventing the scanner from accumulating in history across
        // multiple event sessions.
        pendingWasPopstateRef.current = false;
        window.history.go(-2);
      } else {
        pendingNavigation();
      }
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

  const bypassNextNavigation = useCallback(() => {
    isConfirmedNavigation.current = true;
  }, []);

  return {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
    bypassNextNavigation,
  };
}
