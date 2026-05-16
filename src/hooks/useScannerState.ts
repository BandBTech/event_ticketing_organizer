"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBulkCheckIn } from "@/hooks/useTickets";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService } from "@/services/eventService";
import { TicketService } from "@/services/ticketService";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/lib/toast";

export type ScanMode = "single" | "bulk";

export interface BulkScanItem {
  code: string;
  timestamp: string;
  ticketNumber?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  // check-in result (set after bulk submit)
  checkinResult?: "success" | "failed";
  checkinMessage?: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  ticketNumber?: string;
  alreadyCheckedIn?: boolean;
}

export interface BulkResultItem {
  success: boolean;
  message?: string;
  ticket_number?: string;
  code?: string;
  qr_code?: string;
}

export interface BulkResult {
  success: boolean;
  message: string;
  items?: BulkResultItem[];
}

export function useScannerState() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<ScanMode>("single");
  const [bulkQueue, setBulkQueue] = useState<BulkScanItem[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [showBulkList, setShowBulkList] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scannedEventTitle, setScannedEventTitle] = useState<string | null>(
    null,
  );
  const [lastScanError, setLastScanError] = useState<{
    code: string;
    message: string;
    ticketNumber?: string;
  } | null>(null);

  // ─── Refs for race-condition-safe guards ─────────────────────────────────────
  // Tracks codes currently being processed (in-flight API calls).
  // Using a ref + Set so the guard is synchronous and immune to React's
  // batched state updates — the scanner fires onScan faster than setState.
  const processingCodesRef = useRef<Set<string>>(new Set());

  // Cooldown flag for single-scan mode — prevents the same QR from triggering
  // multiple rapid API calls before scanResult state is set.
  const singleScanCooldownRef = useRef(false);
  const scanResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref mirror of bulkQueue so async callbacks always see latest queue state
  const bulkQueueRef = useRef<BulkScanItem[]>(bulkQueue);
  bulkQueueRef.current = bulkQueue;

  // Ref mirror of eventId for async callbacks
  const eventIdRef = useRef<string | null>(eventId);
  eventIdRef.current = eventId;

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const bulkCheckInMutation = useBulkCheckIn();

  // Single-scan mutation — inline so we can disable the default apiClient error toast.
  // The apiClient's showErrorToast defaults to true, which causes a generic error toast
  // even when our onError handler already shows a contextual one.
  const scanMutation = useMutation({
    mutationFn: ({ ticketCode, eventId: eid }: { ticketCode: string; eventId?: string }) =>
      TicketService.scanTicket(ticketCode, eid),
    onSuccess: (data) => {
      if (data.success && data.ticket) {
        toast.success(
          data.already_checked_in
            ? "scanner.ticket_already_checked_in"
            : "scanner.ticket_scanned_successfully",
          data.already_checked_in
            ? "Ticket already checked in."
            : "Ticket scanned successfully.",
          data.message || "",
        );
      }
    },
  });

  // Validate-for-queue mutation — also inline to avoid duplicate toasts.
  const validateCheckInMutation = useMutation({
    mutationFn: ({ qrCode, eventId: eid }: { qrCode: string; eventId?: string }) =>
      TicketService.validateCheckIn(qrCode, eid),
  });

  // isProcessing is used only for the UI overlay (spinner) and bulk-submit button.
  // It is NOT used to gate incoming scans (that's handled by per-code refs).
  const isProcessing =
    scanMutation.isPending || bulkCheckInMutation.isPending;

  // Disable scanning when all bulk items are successfully checked-in and the results drawer is open
  const isScanDisabled =
    mode === "bulk" &&
    showBulkList &&
    bulkQueue.length > 0 &&
    bulkQueue.every((item) => item.checkinResult === "success");

  // ─── Fetch event details when eventId is available ──────────────────────────
  const { data: eventData } = useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ""),
    queryFn: () => eventService.getEvent(eventId!),
    enabled: !!eventId && !scannedEventTitle,
  });

  const currentEventTitle = scannedEventTitle || eventData?.title || null;

  // ─── Navigation Guard ────────────────────────────────────────────────────────
  const hasUnsavedChanges = useCallback(
    () => bulkQueue.length > 0,
    [bulkQueue],
  );

  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({ hasUnsavedChanges });

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mode + eventId from URL params
  useEffect(() => {
    if (router.isReady) {
      if (router.query.mode === "bulk") {
        setMode("bulk");
      }
      const paramEventId = router.query.eventId as string;
      setEventId(paramEventId || null);
    }
  }, [router.isReady, router.query]);

  // Guard against non-HTTPS contexts
  useEffect(() => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCameraError(
        t(
          "staffScanner.insecureContext",
          "Camera access requires a secure context (HTTPS).",
        ),
      );
    }
  }, [t]);

  // ─── Failed-code suppression ─────────────────────────────────────────────────
  // Prevents re-validation spam while a failed QR is still in the camera frame.
  // Short TTL (1500ms) so the user can re-scan the same code after a brief wait.
  // Toast spam is prevented separately via toastedCodesRef.
  // Uses refs + Sets (not state) so guards are synchronous with camera ticks.
  const suppressedCodesRef = useRef<Set<string>>(new Set());

  // Mark a code as suppressed for a short window to prevent rapid re-validations.
  // After the window expires, the code is freed for a fresh scan.
  const suppressCode = useCallback((code: string, ttlMs = 1500) => {
    suppressedCodesRef.current.add(code);
    setTimeout(() => {
      suppressedCodesRef.current.delete(code);
    }, ttlMs);
  }, []);

  // Track which codes have already shown a toast to avoid duplicate toasts.
  const toastedCodesRef = useRef<Set<string>>(new Set());

  // Drop suppression refs on unmount.
  useEffect(() => {
    return () => {
      suppressedCodesRef.current.clear();
      toastedCodesRef.current.clear();
      if (scanResultTimeoutRef.current) {
        clearTimeout(scanResultTimeoutRef.current);
        scanResultTimeoutRef.current = null;
      }
    };
  }, []);

  // ─── Queue Helpers ────────────────────────────────────────────────────────────
  const clearQueue = () => {
    setBulkQueue([]);
    setBulkResult(null);
    setShowBulkList(false);
    setLastScanError(null);
    processingCodesRef.current.clear();
    suppressedCodesRef.current.clear();
    toastedCodesRef.current.clear();
  };

  const removeFromQueue = (index: number) => {
    setBulkQueue((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1);
      // Also remove from suppression + processing so re-scan is possible
      if (removed[0]) {
        processingCodesRef.current.delete(removed[0].code);
        suppressedCodesRef.current.delete(removed[0].code);
        toastedCodesRef.current.delete(removed[0].code);
      }
      // Clear error state when the last item is removed
      if (next.length === 0) {
        setLastScanError(null);
      }
      // Only reset event context when it was self-detected from a scan
      // (no eventId in the URL). If the user opened the scanner from the
      // dashboard with ?eventId=..., keep that event context so emptying
      // the queue doesn't bounce them back to "Please select an event".
      if (next.length === 0 && !router.query.eventId) {
        setEventId(null);
        setScannedEventTitle(null);
      }
      return next;
    });
  };

  // ─── Scan Handlers ────────────────────────────────────────────────────────────

  const handleSingleScan = (code: string, scanEventId?: string) => {
    // Prevent duplicate in-flight requests for the same code
    if (processingCodesRef.current.has(code)) return;
    processingCodesRef.current.add(code);
    singleScanCooldownRef.current = true;

    if (scanResultTimeoutRef.current) clearTimeout(scanResultTimeoutRef.current);
    scanMutation.mutate(
      { ticketCode: code, eventId: scanEventId },
      {
        onSuccess: (data) => {
          if (navigator.vibrate) navigator.vibrate(50);
          setScanResult({
            success: data.success,
            alreadyCheckedIn: data.already_checked_in,
            message: data.already_checked_in
              ? t("scanner.ticket_already_checked_in", "Ticket already checked in.")
              : t("scanner.ticket_scanned_successfully", "Ticket checked in successfully."),
          });
          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            singleScanCooldownRef.current = false;
            scanResultTimeoutRef.current = null;
          }, 3000);
        },
        onError: (error) => {
          setScanResult({
            success: false,
            message:
              error.message ||
              t("staffScanner.scanFailed", "Failed to scan ticket"),
          });
          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            singleScanCooldownRef.current = false;
            scanResultTimeoutRef.current = null;
          }, 3000);
        },
        onSettled: () => {
          processingCodesRef.current.delete(code);
        },
      },
    );
  };

  const handleBulkScan = (code: string) => {
    // ── Synchronous guard: check ref-based queue + processing set ──
    const currentQueue = bulkQueueRef.current;

    if (currentQueue.length >= 10) {
      toast.error(
        t("staffScanner.queueLimitReached", "Queue limit reached (Max 10)"),
        t(
          "staffScanner.submitQueue",
          "Please submit current queue for check-in first",
        ),
      );
      return;
    }

    // If already in the queue: silent within 2 s of being added (camera re-read),
    // toast after that (intentional duplicate scan).
    const existingItem = currentQueue.find((item) => item.code === code);
    if (existingItem) {
      const age = Date.now() - new Date(existingItem.timestamp).getTime();
      if (age >= 2000) {
        toast.error(
          t("staffScanner.alreadyInQueue", "Already in queue"),
          t("staffScanner.ticketAlreadyQueued", "This ticket is already queued for check-in"),
        );
      }
      return;
    }

    // Suppressed — recent validation failure still within cooldown window.
    // Silently drop so we don't hammer the API every 1.2s scanDelay tick.
    if (suppressedCodesRef.current.has(code)) {
      return;
    }

    // In-flight validation for this code — silently ignore to avoid double-processing.
    if (processingCodesRef.current.has(code)) {
      return;
    }

    // Mark as in-flight immediately (synchronous, before any async gap)
    processingCodesRef.current.add(code);

    validateCheckInMutation.mutate(
      { qrCode: code, eventId: eventIdRef.current ?? undefined },
      {
        onSuccess: (data) => {
          // Immediately release in-flight lock so re-scan is possible
          processingCodesRef.current.delete(code);

          if (!data.can_checkin) {
            // Suppress rapid re-validations of the same code while still in frame
            suppressCode(code);
            setLastScanError({
              code,
              message: data.message || "Ticket cannot be checked in",
            });
            // Show toast only once per code to avoid spam
            if (!toastedCodesRef.current.has(code)) {
              toastedCodesRef.current.add(code);
              const msgParts = (data.message || "").split(": ");
              const toastTitle = msgParts[0] || t("staffScanner.ticketInvalid", "Invalid ticket");
              const toastDesc = msgParts[1] || t("staffScanner.ticketCannotCheckIn", "Ticket cannot be checked in");
              toast.error(toastTitle, toastDesc);
            }
            return;
          }

          // Validation passed — clear any previous error and add to queue
          setLastScanError(null);
          const ticketInfo = data.ticket_info as Record<string, unknown> & {
            ticket_number?: string;
            attendee?: { name?: string; email?: string };
          };
          const newItem: BulkScanItem = {
            code,
            timestamp: new Date().toISOString(),
            ticketNumber: ticketInfo?.ticket_number,
            attendeeName: ticketInfo?.attendee?.name,
            attendeeEmail: ticketInfo?.attendee?.email,
          };

          const responseEventId = data.event_id;
          const responseEventTitle = data.event_title;

          setBulkQueue((prev) => {
            if (prev.some((item) => item.code === code)) {
              processingCodesRef.current.delete(code);
              return prev;
            }

            if (!eventIdRef.current && responseEventId) {
              setEventId(responseEventId);
              if (responseEventTitle) {
                setScannedEventTitle(responseEventTitle);
              }
              toast.success(
                "Event detected",
                `Ready to scan for: ${responseEventTitle ?? responseEventId}`,
              );
              return [newItem];
            }

            if (navigator.vibrate) navigator.vibrate(50);
            toastedCodesRef.current.delete(code);
            toast.success(
              "staffScanner.addedToQueue",
              "Added to queue",
              `#${prev.length + 1}: ${newItem.ticketNumber}`,
            );
            return [...prev, newItem];
          });
        },
        onError: () => {
          processingCodesRef.current.delete(code);
          suppressCode(code);
          setLastScanError({
            code,
            message: t("staffScanner.cannotConnect", "Cannot connect to server. Try again."),
          });
          if (!toastedCodesRef.current.has(code)) {
            toastedCodesRef.current.add(code);
            toast.error(
              t("staffScanner.connectionError", "Connection error"),
              t("staffScanner.scanRetry", "Tap to scan again when connected"),
            );
          }
        },
      },
    );
  };

  const handleScan = (ticketCode: string) => {
    const code = ticketCode.trim();
    if (!code) return;

    if (mode === "single") {
      handleSingleScan(code, eventId || undefined);
    } else {
      handleBulkScan(code);
    }
  };

  const handleQRScan = (result: unknown[]) => {
    // In single mode: block while result is displayed or cooldown is active
    if (mode === "single" && (scanResult || singleScanCooldownRef.current)) {
      return;
    }

    // Block if all bulk tickets are already checked in
    if (isScanDisabled) return;

    // In bulk mode we do NOT block on isProcessing — the per-code
    // processingCodesRef handles dedup, allowing parallel validations.

    if (result && result.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scannedCode = (result[0] as any).rawValue;
      handleScan(scannedCode);
    }
  };

  const handleCameraError = (error: unknown) => {
    console.error("Camera error:", error);

    let errorMessage = t(
      "staffScanner.cameraErrorGeneric",
      "Failed to access camera.",
    );

    if (error instanceof Error) {
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage = t(
          "staffScanner.cameraPermissionDenied",
          "Camera access denied. Please enable camera permissions in your browser settings.",
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = t(
          "staffScanner.noCameraFound",
          "No camera found on this device.",
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage = t(
          "staffScanner.cameraInUse",
          "Camera is currently in use by another application or permission is denied.",
        );
      } else if (error.name === "OverconstrainedError") {
        errorMessage = t(
          "staffScanner.cameraConstraints",
          "Camera constraints not satisfied.",
        );
      }
    }

    setCameraError(errorMessage);
  };

  const submitBulkCheckIn = () => {
    if (!eventId) {
      toast.error(
        "No event context",
        "Please scan at least one valid ticket first",
      );
      return;
    }

    if (bulkQueue.length === 0) return;

    const codes = bulkQueue.map((i) => i.code);

    bulkCheckInMutation.mutate(
      { event_id: eventId, qr_codes: codes },
      {
        onSuccess: (data) => {
          const results: BulkResultItem[] = (data.data ?? []).map(
            (r) => ({
              success: r.success as boolean,
              message: r.message as string | undefined,
              qr_code: r.qr_code as string | undefined,
            }),
          );

          // Update each item in the queue with its check-in result
          setBulkQueue((prev) =>
            prev.map((item) => {
              const result = results?.find((r) => r.qr_code === item.code);
              return {
                ...item,
                checkinResult: result?.success
                  ? ("success" as const)
                  : ("failed" as const),
                checkinMessage:
                  result?.message ||
                  (result?.success ? "Checked in" : "Failed"),
              };
            }),
          );
          setShowBulkList(true);
        },
        onError: (error) => {
          setBulkResult({
            success: false,
            message: error.message || "Bulk check-in failed",
          });
        },
      },
    );
  };

  const clearScanResult = useCallback(() => {
    setScanResult(null);
    singleScanCooldownRef.current = false;
  }, []);

  const handleModeChange = useCallback((newMode: ScanMode) => {
    setMode(newMode);
    setLastScanError(null);
    suppressedCodesRef.current.clear();
    toastedCodesRef.current.clear();
  }, []);

  return {
    // State
    isScanDisabled,
    mode,
    setMode: handleModeChange,
    bulkQueue,
    eventId,
    currentEventTitle,
    showBulkList,
    setShowBulkList,
    bulkResult,
    setBulkResult,
    scanResult,
    clearScanResult,
    lastScanError,
    cameraError,
    mounted,
    isProcessing,
    // Navigation guard
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    // Handlers
    handleQRScan,
    handleCameraError,
    submitBulkCheckIn,
    removeFromQueue,
    clearQueue,
    t,
  };
}

export default useScannerState;
