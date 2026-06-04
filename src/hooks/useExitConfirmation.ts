"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Router from "next/router";

export interface UseExitConfirmationReturn {
  showExitDialog: boolean;
  setShowExitDialog: (show: boolean) => void;
  confirmExit: () => void;
  cancelExit: () => void;
}

/**
 * Hook that intercepts the browser back button while the user is on the
 * dashboard Home Screen and shows an exit-confirmation dialog.
 *
 * Strategy:
 * 1. On mount, push a sentinel history entry so that pressing "back"
 *    triggers a popstate event instead of navigating away immediately.
 * 2. When popstate fires on the sentinel entry we show the dialog.
 * 3. If the user confirms, we call history.back() to leave for real.
 * 4. If the user cancels, we re-push the sentinel so the guard remains active.
 *
 * This approach is intentionally scoped to the Home Screen only and does NOT
 * interfere with the existing `useNavigationGuard` hook used by inner pages.
 */
export function useExitConfirmation(): UseExitConfirmationReturn {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const guardActiveRef = useRef(false);
  const confirmedRef = useRef(false);

  const pushSentinel = useCallback(() => {
    // Push the same URL as a sentinel so "back" hits us first
    window.history.pushState(
      { exitGuard: true },
      "",
      window.location.href
    );
    guardActiveRef.current = true;
  }, []);

  useEffect(() => {
    // Push sentinel on mount (after first render)
    pushSentinel();

    const handlePopstate = (event: PopStateEvent) => {
      // If the user confirmed exit and we called history.back(), ignore this event
      if (confirmedRef.current) {
        confirmedRef.current = false;
        return;
      }

      // Check if this popstate consumed our sentinel entry
      if (guardActiveRef.current) {
        guardActiveRef.current = false;

        // Also stop Next.js from processing this route change
        Router.events.emit("routeChangeError");

        // Show the confirmation dialog
        setShowExitDialog(true);

        // Re-push sentinel so the guard remains if user cancels
        // We do it after a tick to avoid race conditions with Next.js Router
        setTimeout(() => {
          if (!confirmedRef.current) {
            pushSentinel();
          }
        }, 0);
      }
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
      // Clean up the sentinel entry when the component unmounts
      if (guardActiveRef.current) {
        guardActiveRef.current = false;
        // Go back to remove the sentinel we pushed
        window.history.back();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitDialog(false);
    confirmedRef.current = true;
    guardActiveRef.current = false;
    // Navigate back for real
    window.history.back();
  }, []);

  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
    // Sentinel was already re-pushed in the popstate handler
  }, []);

  return {
    showExitDialog,
    setShowExitDialog,
    confirmExit,
    cancelExit,
  };
}
