"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

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
 * - Browser back/forward buttons (popstate)
 * - Click navigation on anchor tags
 */
export function useNavigationGuard({
  hasUnsavedChanges,
  onBeforeLeave,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const historyStatePushed = useRef(false);

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

  // Handle browser back/forward buttons
  useEffect(() => {
    // Push a dummy state ONCE to detect back navigation
    if (typeof window !== "undefined" && !historyStatePushed.current) {
      window.history.pushState({ formPage: true }, "");
      historyStatePushed.current = true;
    }

    const handlePopState = () => {
      if (hasUnsavedChanges()) {
        // Push state back to prevent navigation
        window.history.pushState({ formPage: true }, "");
        // Show our custom dialog
        setPendingNavigation(() => () => {
          // Allow the back navigation by going back twice (our pushed state + actual back)
          window.history.go(-2);
        });
        setShowLeaveDialog(true);
      } else {
        // No unsaved changes - allow normal back navigation
        // Go back one more time since we consumed the popstate event
        window.history.go(-1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Handle sidebar/route navigation clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges()) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        // Build the URL to check if it's a navigation
        const href = anchor.getAttribute("href");

        // Ignore non-navigation links
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          anchor.target === "_blank"
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        setPendingNavigation(() => () => {
          router.push(href);
        });
        setShowLeaveDialog(true);
      }
    };

    window.addEventListener("click", handleClick, true); // Capture phase to intervene early
    return () => window.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges, router]);

  const confirmLeave = useCallback(() => {
    // Call cleanup callback before leaving
    onBeforeLeave?.();
    setShowLeaveDialog(false);
    if (pendingNavigation) {
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

  return {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
  };
}
