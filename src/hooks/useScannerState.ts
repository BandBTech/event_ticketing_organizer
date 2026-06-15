"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBulkCheckIn } from "@/hooks/useTickets";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService } from "@/services/eventService";
import { TicketService } from "@/services/ticketService";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/lib/toast";
import { EventDay } from "@/types/event";
import { parseTicketScanMessage } from "@/lib/utils";
import { playBeep } from "@/lib/scannerBeep";

// Minimal type for QR scanner library result — avoids the `any` cast on rawValue
interface DetectedBarcode {
  rawValue: string;
}

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

export function getDefaultEventDay(eventDays: EventDay[]): string | null {
  if (!eventDays || eventDays.length === 0) return null;
  const now = new Date();

  // Find if current time is within any event day
  for (const day of eventDays) {
    const start = new Date(day.start_time);
    const end = new Date(day.end_time);
    if (now >= start && now <= end) {
      return day.id;
    }
  }

  // Otherwise, find the event day that starts today
  const todayStr = now.toDateString();
  for (const day of eventDays) {
    const start = new Date(day.start_time);
    if (start.toDateString() === todayStr) {
      return day.id;
    }
  }

  // Otherwise, find the event day closest to now.
  // For future days we measure time until start; for past days, time since end.
  // This prefers the nearest upcoming day over a recently-ended one.
  let closestDayId = eventDays[0].id;
  let minDiff = Infinity;
  for (const day of eventDays) {
    const startMs = new Date(day.start_time).getTime();
    const endMs = new Date(day.end_time).getTime();
    const nowMs = now.getTime();
    const diff = nowMs < startMs ? startMs - nowMs : nowMs - endMs;
    if (diff < minDiff) {
      minDiff = diff;
      closestDayId = day.id;
    }
  }

  return closestDayId;
}

export function useScannerState() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<ScanMode>("single");
  const [bulkQueue, setBulkQueue] = useState<BulkScanItem[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [selectedEventDayId, setSelectedEventDayId] = useState<string | null>(null);
  const [showBulkList, setShowBulkList] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scannedEventTitle, setScannedEventTitle] = useState<string | null>(null);
  const [isBulkToastShowing, setIsBulkToastShowing] = useState(false);
  const bulkToastClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBulkToastState = useCallback(() => {
    if (bulkToastClearTimerRef.current) {
      clearTimeout(bulkToastClearTimerRef.current);
      bulkToastClearTimerRef.current = null;
    }
    setIsBulkToastShowing(false);
  }, []);

  // ─── Refs for race-condition-safe guards ─────────────────────────────────────
  // Tracks codes currently being processed (in-flight API calls).
  // Using a ref + Set so the guard is synchronous and immune to React's
  // batched state updates — the scanner fires onScan faster than setState.
  const processingCodesRef = useRef<Set<string>>(new Set());

  const scanResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref mirror of bulkQueue so async callbacks always see latest queue state
  const bulkQueueRef = useRef<BulkScanItem[]>(bulkQueue);
  bulkQueueRef.current = bulkQueue;

  // Ref mirror of eventId for async callbacks
  const eventIdRef = useRef<string | null>(eventId);
  eventIdRef.current = eventId;

  // Tracks suppress timers by code so they can be cancelled on demand
  const suppressTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const bulkCheckInMutation = useBulkCheckIn();

  // Single-scan mutation — inline so we can disable the default apiClient error toast.
  // The apiClient's showErrorToast defaults to true, which causes a generic error toast
  // even when our onError handler already shows a contextual one.
  const scanMutation = useMutation({
    mutationFn: ({ ticketCode, eventId: eid, eventDayId }: { ticketCode: string; eventId?: string; eventDayId?: string }) =>
      TicketService.scanTicket(ticketCode, eid, eventDayId),
    onSuccess: (data) => {
      if (data.success && data.ticket) {
        const defaultFallback = data.already_checked_in
          ? "Ticket already checked in."
          : "Ticket scanned successfully.";
        const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
          data.message,
          defaultFallback
        );
        toast.success(
          data.already_checked_in
            ? "scanner.ticket_already_checked_in"
            : "scanner.ticket_scanned_successfully",
          parsedTitle,
          parsedDesc
        );
      }
    },
  });

  // Validate-for-queue mutation — also inline to avoid duplicate toasts.
  const validateCheckInMutation = useMutation({
    mutationFn: ({ qrCode, eventId: eid, eventDayId }: { qrCode: string; eventId?: string; eventDayId?: string }) =>
      TicketService.validateCheckIn(qrCode, eid, eventDayId),
  });

  // isProcessing is used only for the UI overlay (spinner) and bulk-submit button.
  // It is NOT used to gate incoming scans (that's handled by per-code refs).
  const isProcessing =
    scanMutation.isPending || bulkCheckInMutation.isPending;

  // True once any bulk item has a checkinResult (i.e. queue has been submitted)
  const isQueueSubmitted = bulkQueue.some(item => item.checkinResult !== undefined);

  // Disable scanning once the queue has been submitted — prevents adding items
  // that can't be submitted (no Submit button shown after results appear).
  const isScanDisabled =
    (mode === "bulk" &&
      (isBulkToastShowing ||
        (bulkQueue.length > 0 && isQueueSubmitted) ||
        validateCheckInMutation.isPending ||
        bulkCheckInMutation.isPending)) ||
    (mode === "single" && (!!scanResult || scanMutation.isPending));

  // ─── Fetch event details when eventId is available ──────────────────────────
  const { data: eventData } = useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ""),
    queryFn: () => eventService.getEvent(eventId!),
    enabled: !!eventId && !scannedEventTitle,
  });

  // Automatically determine the active day
  useEffect(() => {
    if (eventData?.event_days && eventData.event_days.length > 0 && !selectedEventDayId) {
      const defaultDayId = getDefaultEventDay(eventData.event_days);
      setSelectedEventDayId(defaultDayId);
    }
  }, [eventData, selectedEventDayId]);

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

  // Sync mode + eventId from URL params.
  // Uses raw setMode (not handleModeChange) intentionally — handleModeChange writes
  // back to the URL, which would re-trigger this effect and risk an update loop.
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
  // Cooldown is set to 3000ms so the user can re-scan the same code after a brief wait
  // without hammering the server.
  // Uses refs + Sets (not state) so guards are synchronous with camera ticks.
  const suppressedCodesRef = useRef<Set<string>>(new Set());

  // Mark a code as suppressed for a short window to prevent rapid re-validations.
  const suppressCode = useCallback((code: string, ttlMs = 3000) => {
    const existing = suppressTimersRef.current.get(code);
    if (existing) clearTimeout(existing);
    suppressedCodesRef.current.add(code);
    const timer = setTimeout(() => {
      suppressedCodesRef.current.delete(code);
      suppressTimersRef.current.delete(code);
    }, ttlMs);
    suppressTimersRef.current.set(code, timer);
  }, []);



  // Drop suppression refs and pending timers on unmount.
  useEffect(() => {
    const suppressed = suppressedCodesRef.current;
    const timers = suppressTimersRef.current;
    return () => {
      suppressed.clear();
      timers.forEach(clearTimeout);
      timers.clear();
      if (scanResultTimeoutRef.current) {
        clearTimeout(scanResultTimeoutRef.current);
        scanResultTimeoutRef.current = null;
      }
      if (bulkToastClearTimerRef.current) {
        clearTimeout(bulkToastClearTimerRef.current);
        bulkToastClearTimerRef.current = null;
      }
      if (typeof window !== "undefined") {
        (window as typeof window & { __bypassExitConfirmation?: boolean }).__bypassExitConfirmation = true;
      }
    };
  }, []);

  // ─── Queue Helpers ────────────────────────────────────────────────────────────
  const clearQueue = () => {
    setBulkQueue([]);
    setBulkResult(null);
    setShowBulkList(false);
    processingCodesRef.current.clear();
    suppressedCodesRef.current.clear();
    suppressTimersRef.current.forEach(clearTimeout);
    suppressTimersRef.current.clear();
    clearBulkToastState();
  };

  const removeFromQueue = (index: number) => {
    setBulkQueue((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1);
      // Also remove from suppression + processing so re-scan is possible
      if (removed[0]) {
        processingCodesRef.current.delete(removed[0].code);
        suppressedCodesRef.current.delete(removed[0].code);
        const timer = suppressTimersRef.current.get(removed[0].code);
        if (timer) {
          clearTimeout(timer);
          suppressTimersRef.current.delete(removed[0].code);
        }
      }
      // Clear error state when the last item is removed
      // if (next.length === 0) {
      //   setLastScanError(null);
      // }
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

  // Strips successfully-checked-in items and resets failed ones so they can
  // be re-submitted after a partial bulk check-in.
  const retryFailed = useCallback(() => {
    setBulkQueue(prev => {
      const failed = prev.filter(item => item.checkinResult === "failed");
      if (failed.length === 0) return prev;
      return failed.map(({ checkinResult: _r, checkinMessage: _m, ...rest }) => rest);
    });
    setShowBulkList(false);
  }, []);

  // ─── Scan Handlers ────────────────────────────────────────────────────────────

  const handleSingleScan = (code: string, scanEventId?: string) => {
    // Suppressed — recent validation failure or successful scan within cooldown window.
    if (suppressedCodesRef.current.has(code)) return;

    // Prevent duplicate in-flight requests for the same code
    if (processingCodesRef.current.has(code)) return;
    processingCodesRef.current.add(code);

    if (scanResultTimeoutRef.current) clearTimeout(scanResultTimeoutRef.current);
    scanMutation.mutate(
      { ticketCode: code, eventId: scanEventId, eventDayId: selectedEventDayId || undefined },
      {
        onSuccess: (data) => {
          suppressCode(code, 3000);

          if (data.success && !data.already_checked_in) {
            playBeep();
            if (navigator.vibrate) navigator.vibrate(50);
          }

          const defaultFallback = data.already_checked_in
            ? t("scanner.ticket_already_checked_in", "Ticket already checked in.")
            : t("scanner.ticket_scanned_successfully", "Ticket checked in successfully.");

          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            data.message,
            defaultFallback
          );

          setScanResult({
            success: data.success,
            alreadyCheckedIn: data.already_checked_in,
            message: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
            ticketNumber: data.ticket?.ticket_number,
          });
          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            scanResultTimeoutRef.current = null;
          }, 3000);

          // Invalidate ticket stats so any open organizer views refresh
          if (data.ticket?.event_id) {
            queryClient.invalidateQueries({ queryKey: queryKeys.tickets.stats(data.ticket.event_id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(data.ticket.event_id) });
          }
        },
        onError: (error) => {
          suppressCode(code, 3000);

          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            error.message,
            t("staffScanner.scanFailed", "Failed to scan ticket")
          );

          setScanResult({
            success: false,
            message: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
          });
          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
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
    // After bulk submit, block new scans until queue is cleared or failed items retried.
    // This prevents adding items that can't be submitted (no Submit button after results).
    if (bulkQueueRef.current.some(i => i.checkinResult !== undefined)) return;

    // ── Synchronous guard: check ref-based queue + processing set ──
    const currentQueue = bulkQueueRef.current;

    if (currentQueue.length >= 10) {
      setIsBulkToastShowing(true);
      if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
      bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);

      toast.error(
        "staffScanner.queueLimitReached",
        t("staffScanner.queueLimitReached", "Queue limit reached (Max 10)"),
        t(
          "staffScanner.submitQueue",
          "Please submit current queue for check-in first",
        ),
        {
          onDismiss: clearBulkToastState,
          onAutoClose: clearBulkToastState,
        }
      );
      return;
    }

    // Suppressed — API call blocked to avoid hammering the server.
    if (suppressedCodesRef.current.has(code)) {
      return;
    }

    // If already in the queue, show error toast (suppressed every 3s so it doesn't spam)
    const existingItem = currentQueue.find((item) => item.code === code);
    if (existingItem) {
      suppressCode(code, 3000);
      setIsBulkToastShowing(true);
      if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
      bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);

      toast.error(
        "staffScanner.alreadyInQueue",
        t("staffScanner.alreadyInQueue", "Already in queue"),
        t("staffScanner.ticketAlreadyQueued", "This ticket is already queued for check-in"),
        {
          onDismiss: clearBulkToastState,
          onAutoClose: clearBulkToastState,
        }
      );
      return;
    }

    // In-flight validation for this code — silently ignore to avoid double-processing.
    if (processingCodesRef.current.has(code)) {
      return;
    }

    // Mark as in-flight immediately (synchronous, before any async gap)
    processingCodesRef.current.add(code);

    validateCheckInMutation.mutate(
      { qrCode: code, eventId: eventIdRef.current ?? undefined, eventDayId: selectedEventDayId || undefined },
      {
        onSuccess: (data) => {
          // Immediately release in-flight lock so re-scan is possible
          processingCodesRef.current.delete(code);

          if (!data.can_checkin) {
            suppressCode(code, 3000);

            const { title: toastTitle, description: toastDesc } = parseTicketScanMessage(
              data.message,
              t("staffScanner.ticketInvalid", "Invalid ticket"),
              t("staffScanner.ticketCannotCheckIn", "Ticket cannot be checked in")
            );

            setIsBulkToastShowing(true);
            if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
            bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);

            toast.error(toastTitle, toastTitle, toastDesc, {
              onDismiss: clearBulkToastState,
              onAutoClose: clearBulkToastState,
            });
            return;
          }

          suppressCode(code, 3000);
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

          if (!eventIdRef.current && responseEventId) {
            playBeep();
            setEventId(responseEventId);
            if (responseEventTitle) {
              setScannedEventTitle(responseEventTitle);
            }
            setIsBulkToastShowing(true);
            if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
            bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);
            toast.success(
              "staffScanner.eventDetected",
              t("staffScanner.eventDetected", "Event detected"),
              `${t("staffScanner.readyToScanFor", "Ready to scan for")}: ${responseEventTitle ?? responseEventId}`,
              {
                onDismiss: clearBulkToastState,
                onAutoClose: clearBulkToastState,
              }
            );
            setBulkQueue([newItem]);
            return;
          }

          playBeep();
          if (navigator.vibrate) navigator.vibrate(50);
          setIsBulkToastShowing(true);
          if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
          bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);

          const nextIndex = bulkQueueRef.current.length + 1;

          toast.success(
            "staffScanner.addedToQueue",
            t("staffScanner.addedToQueue", "Added to queue"),
            `#${nextIndex}: ${newItem.ticketNumber}`,
            {
              onDismiss: clearBulkToastState,
              onAutoClose: clearBulkToastState,
            }
          );

          setBulkQueue((prev) => {
            if (prev.some((item) => item.code === code)) {
              return prev;
            }
            return [...prev, newItem];
          });
        },
        onError: () => {
          processingCodesRef.current.delete(code);
          suppressCode(code, 3000);
          setIsBulkToastShowing(true);
          if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
          bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 3000);

          toast.error(
            "staffScanner.connectionError",
            t("staffScanner.connectionError", "Connection error"),
            t("staffScanner.scanRetry", "Tap to scan again when connected"),
            {
              onDismiss: clearBulkToastState,
              onAutoClose: clearBulkToastState,
            }
          );
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
    // Block if scanning is disabled (queue submitted or all checked in)
    if (isScanDisabled) return;

    // In bulk mode we do NOT block on isProcessing — the per-code
    // processingCodesRef handles dedup, allowing parallel validations.

    if (result && result.length > 0) {
      const scannedCode = (result[0] as DetectedBarcode).rawValue;
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
        "staffScanner.noEventContext",
        t("staffScanner.noEventContext", "No event context"),
        t("staffScanner.scanOneTicketFirst", "Please scan at least one valid ticket first"),
      );
      return;
    }

    if (bulkQueue.length === 0) return;

    const codes = bulkQueue.map((i) => i.code);

    bulkCheckInMutation.mutate(
      { event_id: eventId, qr_codes: codes, event_day_id: selectedEventDayId || undefined },
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
              const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
                result?.message,
                result?.success
                  ? t("staffScanner.checkedIn", "Checked in")
                  : t("staffScanner.failed", "Failed")
              );
              return {
                ...item,
                checkinResult: result?.success
                  ? ("success" as const)
                  : ("failed" as const),
                checkinMessage: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
              };
            }),
          );
          setShowBulkList(true);
        },
        onError: (error) => {
          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            error.message,
            t("staffScanner.bulkCheckInFailed", "Bulk check-in failed")
          );
          setBulkResult({
            success: false,
            message: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
          });
        },
      },
    );
  };

  const clearScanResult = useCallback(() => {
    if (scanResultTimeoutRef.current) {
      clearTimeout(scanResultTimeoutRef.current);
      scanResultTimeoutRef.current = null;
    }
    setScanResult(null);
  }, []);

  const handleModeChange = useCallback((newMode: ScanMode) => {
    setMode(newMode);
    suppressedCodesRef.current.clear();
    processingCodesRef.current.clear();
    suppressTimersRef.current.forEach(clearTimeout);
    suppressTimersRef.current.clear();
    clearBulkToastState();
    // Keep URL in sync so mode survives a page share/bookmark (shallow = no reload)
    router.replace(
      { pathname: router.pathname, query: { ...router.query, mode: newMode } },
      undefined,
      { shallow: true }
    );
  }, [router, clearBulkToastState]);

  return {
    // State
    isScanDisabled,
    isQueueSubmitted,
    isBulkToastShowing,
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
    selectedEventDayId,
    setSelectedEventDayId,
    eventData,
    clearScanResult,
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
    retryFailed,
    t,
  };
}

export default useScannerState;
