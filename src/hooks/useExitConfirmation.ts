"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Router from "next/router";
import { useAuthStore } from "@/store/authStore";

export interface UseExitConfirmationReturn {
  showExitDialog: boolean;
  setShowExitDialog: (show: boolean) => void;
  confirmExit: () => void;
  cancelExit: () => void;
}

/**
 * Hook that intercepts the browser back button while the user is on the
 * dashboard Home Screen and shows an exit-confirmation dialog.
 */
export function useExitConfirmation(): UseExitConfirmationReturn {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const guardActiveRef = useRef(false);
  const confirmedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);

  const { isAuthenticated, _authChecked } = useAuthStore();

  const pushSentinel = useCallback(() => {
    if (typeof window === "undefined") return;

    // Always push a fresh sentinel — this also clears any stale forward history
    // entries (e.g. leftover scanner pages from a previous navigation cycle),
    // preventing back-button loops.
    window.history.pushState(
      { exitGuard: true },
      "",
      window.location.href
    );
    guardActiveRef.current = true;
  }, []);

  // Clear the bypass flag if it was set when returning from scanner/inner pages.
  // Also push a fresh sentinel to purge any stale forward history entries that
  // may have been left behind by scanner's navigation guard (history.go(-2) path).
  useEffect(() => {
    if (typeof window !== "undefined" && (window as typeof window & { __bypassExitConfirmation?: boolean }).__bypassExitConfirmation) {
      (window as typeof window & { __bypassExitConfirmation?: boolean }).__bypassExitConfirmation = false;
      pushSentinel();
    }
  }, [pushSentinel]);

  // Listen for Next.js route transitions to distinguish from browser back button
  useEffect(() => {
    const handleRouteChangeStart = () => {
      isNavigatingAwayRef.current = true;
    };
    const handleRouteChangeComplete = () => {
      isNavigatingAwayRef.current = false;
    };
    const handleRouteChangeError = () => {
      isNavigatingAwayRef.current = false;
    };

    Router.events.on("routeChangeStart", handleRouteChangeStart);
    Router.events.on("routeChangeComplete", handleRouteChangeComplete);
    Router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
      Router.events.off("routeChangeComplete", handleRouteChangeComplete);
      Router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, []);

  useEffect(() => {
    if (!_authChecked || !isAuthenticated) return;

    // Push sentinel on mount (after first render / authentication verification)
    pushSentinel();

    const handlePopstate = () => {
      // If we are bypassing the exit confirmation (e.g., returning from scanner), ignore this popstate
      if (typeof window !== "undefined" && (window as typeof window & { __bypassExitConfirmation?: boolean }).__bypassExitConfirmation) {
        return;
      }

      // If the user confirmed exit and we called history.back(), ignore this event
      if (confirmedRef.current) {
        confirmedRef.current = false;
        return;
      }

      // Check if this popstate consumed our sentinel entry
      if (guardActiveRef.current) {
        guardActiveRef.current = false;

        // Stop Next.js from processing this route change
        Router.events.emit("routeChangeError");

        // Show the confirmation dialog
        setShowExitDialog(true);

        // Re-push sentinel so the guard remains if user cancels
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
      // Clean up the sentinel entry when the component unmounts.
      // Do NOT call history.back() if the user is logging out,
      // as executing history.back() during logout causes an unwanted browser popstate/refresh on the login screen.
      if (
        guardActiveRef.current &&
        !isNavigatingAwayRef.current &&
        useAuthStore.getState().isAuthenticated
      ) {
        guardActiveRef.current = false;
        // Go back to remove the sentinel we pushed
        window.history.back();
      } else {
        guardActiveRef.current = false;
      }
    };
  }, [_authChecked, isAuthenticated, pushSentinel]);

  const confirmExit = useCallback(() => {
    setShowExitDialog(false);
    confirmedRef.current = true;
    guardActiveRef.current = false;
    // Navigate to /login?exit=1 — a clean exit that won't redirect back to the
    // dashboard (AuthLayout checks for the exit param and skips its redirect).
    // Using Router.push instead of history.back() avoids the loop where the
    // login page redirects the still-authenticated user back to the dashboard.
    Router.push("/login?exit=1");
  }, []);

  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  return {
    showExitDialog,
    setShowExitDialog,
    confirmExit,
    cancelExit,
  };
}
