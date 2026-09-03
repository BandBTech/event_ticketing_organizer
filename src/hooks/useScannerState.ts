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
import { EventDay } from "@/types/event";
import { parseTicketScanMessage } from "@/lib/utils";
import {
  initAudioUnlock,
  playCaptureFeedback,
  playSuccessFeedback,
  playWarningFeedback,
  playErrorFeedback,
} from "@/lib/scannerBeep";

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
  checkinResult?: "success" | "failed";
  checkinMessage?: string;
}

export interface ScanResult {
  code?: string;
  success: boolean;
  message: string;
  ticketNumber?: string;
  attendeeName?: string;
  tierName?: string;
  eventTitle?: string;
  alreadyCheckedIn?: boolean;
  canCheckin?: boolean;
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

  for (const day of eventDays) {
    const start = new Date(day.start_time);
    const end = new Date(day.end_time);
    if (now >= start && now <= end) return day.id;
  }

  const todayStr = now.toDateString();
  for (const day of eventDays) {
    if (new Date(day.start_time).toDateString() === todayStr) return day.id;
  }

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

  // ─── UI State ──────────────────────────────────────────────────────────────
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
  const [isScanPausedForError] = useState(false);
  const [isBulkToastShowing, setIsBulkToastShowing] = useState(false);

  // ─── Synchronous Concurrency Refs ──────────────────────────────────────────
  const processingCodesRef = useRef<Set<string>>(new Set());
  const suppressedCodesRef = useRef<Set<string>>(new Set());
  const suppressTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastAnyScanTimeRef = useRef<number>(0);
  const bulkQueueRef = useRef<BulkScanItem[]>(bulkQueue);
  bulkQueueRef.current = bulkQueue;
  const eventIdRef = useRef<string | null>(eventId);
  eventIdRef.current = eventId;

  const scanResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkToastClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const bulkCheckInMutation = useBulkCheckIn();

  const scanMutation = useMutation({
    mutationFn: ({
      ticketCode,
      eventId: eid,
      eventDayId,
    }: {
      ticketCode: string;
      eventId?: string;
      eventDayId?: string;
    }) => TicketService.scanTicket(ticketCode, eid, eventDayId),
  });

  const validateCheckInMutation = useMutation({
    mutationFn: ({
      qrCode,
      eventId: eid,
      eventDayId,
    }: {
      qrCode: string;
      eventId?: string;
      eventDayId?: string;
    }) => TicketService.validateCheckIn(qrCode, eid, eventDayId),
  });

  const isProcessing = scanMutation.isPending || bulkCheckInMutation.isPending;
  const isQueueSubmitted = bulkQueue.some((item) => item.checkinResult !== undefined);
  const isScanDisabled =
    (mode === "bulk" &&
      (isScanPausedForError ||
        (bulkQueue.length > 0 && isQueueSubmitted) ||
        bulkCheckInMutation.isPending)) ||
    (mode === "single" && (!!scanResult || scanMutation.isPending));

  // ─── Fetch Event Details ───────────────────────────────────────────────────
  const { data: eventData } = useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ""),
    queryFn: () => eventService.getEvent(eventId!),
    enabled: !!eventId && !scannedEventTitle,
  });

  useEffect(() => {
    if (eventData?.event_days && eventData.event_days.length > 0 && !selectedEventDayId) {
      setSelectedEventDayId(getDefaultEventDay(eventData.event_days));
    }
  }, [eventData, selectedEventDayId]);

  const currentEventTitle = scannedEventTitle || eventData?.title || null;

  // ─── Navigation Guard ──────────────────────────────────────────────────────
  const hasUnsavedChanges = useCallback(() => bulkQueue.length > 0, [bulkQueue]);
  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({ hasUnsavedChanges });

  // ─── Mount & Storage Hydration (SSR-Safe) ───────────────────────────────────
  useEffect(() => {
    setMounted(true);
    initAudioUnlock();
  }, []);

  // FORENSIC ITEM 4: Scoped LocalStorage Key
  const getStorageKey = (id: string | null) =>
    id ? `staff_scanner_bulk_queue_${id}_v1` : null;

  // Hydrate queue from event-scoped localStorage strictly post-mount
  useEffect(() => {
    if (!mounted || !eventId) return;
    const key = getStorageKey(eventId);
    if (!key) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && bulkQueueRef.current.length === 0) {
          setBulkQueue(parsed);
        }
      }
    } catch {
      // Ignore corrupt storage
    }
  }, [mounted, eventId]);

  // Sync queue to event-scoped localStorage
  useEffect(() => {
    const key = getStorageKey(eventId);
    if (!key || !mounted) return;

    try {
      if (bulkQueue.length > 0) {
        localStorage.setItem(key, JSON.stringify(bulkQueue));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  }, [bulkQueue, eventId, mounted]);

  // Sync mode and eventId from router query
  useEffect(() => {
    if (router.isReady) {
      if (router.query.mode === "bulk") setMode("bulk");
      const paramEventId = router.query.eventId as string;
      if (paramEventId) setEventId(paramEventId);
    }
  }, [router.isReady, router.query]);

  // Check secure context
  useEffect(() => {
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setCameraError(
        t("staffScanner.insecureContext", "Camera access requires a secure context (HTTPS).")
      );
    }
  }, [t]);

  // ─── Suppression Timer Helper ──────────────────────────────────────────────
  const suppressCode = useCallback((code: string, ttlMs = 6000) => {
    const existing = suppressTimersRef.current.get(code);
    if (existing) clearTimeout(existing);
    suppressedCodesRef.current.add(code);
    const timer = setTimeout(() => {
      suppressedCodesRef.current.delete(code);
      suppressTimersRef.current.delete(code);
    }, ttlMs);
    suppressTimersRef.current.set(code, timer);
  }, []);

  const clearBulkToastState = useCallback(() => {
    setIsBulkToastShowing(false);
    if (bulkToastClearTimerRef.current) {
      clearTimeout(bulkToastClearTimerRef.current);
      bulkToastClearTimerRef.current = null;
    }
  }, []);

  const clearQueue = useCallback(() => {
    const key = getStorageKey(eventIdRef.current);
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    setBulkQueue([]);
    setBulkResult(null);
    setShowBulkList(false);
    processingCodesRef.current.clear();
    suppressedCodesRef.current.clear();
    suppressTimersRef.current.forEach(clearTimeout);
    suppressTimersRef.current.clear();
    clearBulkToastState();
  }, [clearBulkToastState]);

  const removeFromQueue = useCallback((index: number) => {
    setBulkQueue((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1);
      if (removed[0]) {
        processingCodesRef.current.delete(removed[0].code);
        suppressedCodesRef.current.delete(removed[0].code);
        const timer = suppressTimersRef.current.get(removed[0].code);
        if (timer) {
          clearTimeout(timer);
          suppressTimersRef.current.delete(removed[0].code);
        }
      }
      if (next.length === 0 && !router.query.eventId) {
        setEventId(null);
        setScannedEventTitle(null);
      }
      return next;
    });
  }, [router.query.eventId]);

  const retryFailed = useCallback(() => {
    setBulkQueue((prev) => {
      const failed = prev.filter((item) => item.checkinResult === "failed");
      if (failed.length === 0) return prev;
      return failed.map((item) => ({
        code: item.code,
        timestamp: item.timestamp,
        ticketNumber: item.ticketNumber,
        attendeeName: item.attendeeName,
        attendeeEmail: item.attendeeEmail,
      }));
    });
    setShowBulkList(false);
  }, []);

  // Multi-day queue protection guard
  const handleDayChange = useCallback(
    (newDayId: string | null) => {
      if (bulkQueue.length > 0 && newDayId !== selectedEventDayId) {
        const confirmed = window.confirm(
          t(
            "staffScanner.dayChangeConfirm",
            "Changing the event day will clear unsubmitted tickets in your bulk queue. Proceed?"
          )
        );
        if (!confirmed) return;
        clearQueue();
      }
      setSelectedEventDayId(newDayId);
    },
    [bulkQueue.length, selectedEventDayId, clearQueue, t]
  );

  // ─── Scanning Pipeline ─────────────────────────────────────────────────────

  const executeSingleScan = (code: string) => {
    scanMutation.mutate(
      {
        ticketCode: code,
        eventId: eventId || undefined,
        eventDayId: selectedEventDayId || undefined,
      },
      {
        onSuccess: (data) => {
          suppressCode(code, 6000);

          if (data.already_checked_in) {
            playWarningFeedback();
          } else if (data.success) {
            playSuccessFeedback();
          } else {
            playErrorFeedback();
          }

          const defaultFallback = data.already_checked_in
            ? t("scanner.ticket_already_checked_in", "Ticket already checked in.")
            : t("scanner.ticket_scanned_successfully", "Ticket checked in successfully.");

          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            data.message,
            defaultFallback
          );

          setScanResult({
            code,
            success: data.success,
            alreadyCheckedIn: data.already_checked_in,
            message: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
            ticketNumber: data.ticket?.ticket_number,
          });

          // Auto-dismiss in 1200ms
          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            scanResultTimeoutRef.current = null;
          }, 1200);

          if (data.ticket?.event_id && !eventIdRef.current) {
            eventIdRef.current = data.ticket.event_id;
            setEventId(data.ticket.event_id);
            if (data.ticket.event_title) setScannedEventTitle(data.ticket.event_title);
          }
        },
        onError: (error) => {
          playErrorFeedback();
          suppressCode(code, 6000);

          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            error.message,
            t("staffScanner.scanFailed", "Failed to scan ticket")
          );

          setScanResult({
            code,
            success: false,
            message: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
          });

          scanResultTimeoutRef.current = setTimeout(() => {
            setScanResult(null);
            scanResultTimeoutRef.current = null;
          }, 1200);
        },
        onSettled: () => {
          processingCodesRef.current.delete(code);
        },
      }
    );
  };

  const executeBulkValidation = (code: string) => {
    validateCheckInMutation.mutate(
      {
        qrCode: code,
        eventId: eventIdRef.current ?? undefined,
        eventDayId: selectedEventDayId || undefined,
      },
      {
        onSuccess: (data) => {
          processingCodesRef.current.delete(code);

          if (!data.can_checkin) {
            playErrorFeedback();
            suppressCode(code, 6000);

            const { title: toastTitle, description: toastDesc } = parseTicketScanMessage(
              data.message,
              t("staffScanner.ticketInvalid", "Invalid ticket"),
              t("staffScanner.ticketCannotCheckIn", "Ticket cannot be checked in")
            );

            setIsBulkToastShowing(true);
            if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
            bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 2000);

            toast.error(toastTitle, toastTitle, toastDesc, {
              onDismiss: clearBulkToastState,
              onAutoClose: clearBulkToastState,
            });
            return;
          }

          playSuccessFeedback();
          suppressCode(code, 6000);

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

          // Synchronously sync eventIdRef to prevent auto-detect queue clobber
          if (!eventIdRef.current && data.event_id) {
            eventIdRef.current = data.event_id;
            setEventId(data.event_id);
            if (data.event_title) setScannedEventTitle(data.event_title);
          }

          setIsBulkToastShowing(true);
          if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
          bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 2000);

          setBulkQueue((prev) => {
            if (prev.some((item) => item.code === code)) return prev;
            return [...prev, newItem];
          });
        },
        onError: () => {
          playErrorFeedback();
          processingCodesRef.current.delete(code);
          suppressCode(code, 6000);

          setIsBulkToastShowing(true);
          if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
          bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 2000);

          toast.error(
            "staffScanner.connectionError",
            t("staffScanner.connectionError", "Connection error"),
            t("staffScanner.scanRetry", "Tap to scan again when connected"),
            { onDismiss: clearBulkToastState, onAutoClose: clearBulkToastState }
          );
        },
      }
    );
  };

  const handleScan = (ticketCode: string) => {
    if (typeof ticketCode !== "string") return;
    const code = ticketCode.trim().slice(0, 512);
    if (!code) return;

    const now = Date.now();

    // 1. Minimum 400ms inter-scan spacing
    if (now - lastAnyScanTimeRef.current < 400) return;

    // 2. Immediate 1000ms same-code debounce
    if (lastScannedCodeRef.current === code && now - lastScannedTimeRef.current < 1000) return;

    // 3. TTL suppression check
    if (suppressedCodesRef.current.has(code)) return;

    if (mode === "single") {
      // Single Mode Lock
      if (scanMutation.isPending || !!scanResult) return;
      if (processingCodesRef.current.has(code)) return;

      lastAnyScanTimeRef.current = now;
      lastScannedCodeRef.current = code;
      lastScannedTimeRef.current = now;
      processingCodesRef.current.add(code);

      // Stage 1 feedback: immediate subtle capture click
      playCaptureFeedback();
      executeSingleScan(code);
    } else {
      // Bulk Mode Ceiling & Deduplication Check
      if (bulkQueueRef.current.some((i) => i.checkinResult !== undefined)) return;
      if (bulkQueueRef.current.length + processingCodesRef.current.size >= 10) {
        setIsBulkToastShowing(true);
        if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
        bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 2000);

        toast.error(
          "staffScanner.queueLimitReached",
          t("staffScanner.queueLimitReached", "Queue limit reached (Max 10)"),
          t("staffScanner.submitQueue", "Please submit current queue for check-in first")
        );
        return;
      }

      if (bulkQueueRef.current.some((item) => item.code === code)) {
        suppressCode(code, 6000);
        setIsBulkToastShowing(true);
        if (bulkToastClearTimerRef.current) clearTimeout(bulkToastClearTimerRef.current);
        bulkToastClearTimerRef.current = setTimeout(clearBulkToastState, 2000);

        toast.error(
          "staffScanner.alreadyInQueue",
          t("staffScanner.alreadyInQueue", "Already in queue"),
          t("staffScanner.ticketAlreadyQueued", "This ticket is already queued for check-in")
        );
        return;
      }

      if (processingCodesRef.current.has(code)) return;

      lastAnyScanTimeRef.current = now;
      lastScannedCodeRef.current = code;
      lastScannedTimeRef.current = now;
      processingCodesRef.current.add(code);

      // Stage 1 feedback: immediate subtle capture click
      playCaptureFeedback();
      executeBulkValidation(code);
    }
  };

  const handleQRScan = (result: unknown[]) => {
    if (isScanDisabled) return;
    if (result && result.length > 0) {
      const scannedCode = (result[0] as DetectedBarcode).rawValue;
      handleScan(scannedCode);
    }
  };

  const handleCameraError = (error: unknown) => {
    console.error("Camera error:", error);
    let errorMessage = t("staffScanner.cameraErrorGeneric", "Failed to access camera.");

    if (error instanceof Error) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = t(
          "staffScanner.cameraPermissionDenied",
          "Camera access denied. Please enable camera permissions in browser settings."
        );
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = t("staffScanner.noCameraFound", "No camera found on this device.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = t(
          "staffScanner.cameraInUse",
          "Camera is in use by another application or tab."
        );
      } else if (error.name === "OverconstrainedError") {
        errorMessage = t("staffScanner.cameraConstraints", "Camera constraints not satisfied.");
      }
    }
    setCameraError(errorMessage);
  };

  const retryCamera = useCallback(() => {
    setCameraError(null);
  }, []);

  const cancelProcessing = useCallback(() => {
    processingCodesRef.current.clear();
  }, []);

  const submitBulkCheckIn = () => {
    if (!eventId) {
      toast.error(
        "staffScanner.noEventContext",
        t("staffScanner.noEventContext", "No event context"),
        t("staffScanner.scanOneTicketFirst", "Please scan at least one valid ticket first")
      );
      return;
    }

    if (bulkQueue.length === 0) return;
    const codes = bulkQueue.map((i) => i.code);

    bulkCheckInMutation.mutate(
      { event_id: eventId, qr_codes: codes, event_day_id: selectedEventDayId || undefined },
      {
        onSuccess: (data) => {
          const results: BulkResultItem[] = (data.data ?? []).map((r) => ({
            success: r.success,
            message: r.message,
            qr_code: r.qr_code,
          }));

          setBulkQueue((prev) =>
            prev.map((item) => {
              const result = results.find((r) => r.qr_code === item.code);
              const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
                result?.message,
                result?.success
                  ? t("staffScanner.checkedIn", "Checked in")
                  : t("staffScanner.failed", "Failed")
              );
              return {
                ...item,
                checkinResult: result?.success ? ("success" as const) : ("failed" as const),
                checkinMessage: parsedDesc ? `${parsedTitle}: ${parsedDesc}` : parsedTitle,
              };
            })
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
          // Mark uncommitted items as failed so user can retry
          setBulkQueue((prev) =>
            prev.map((item) => ({
              ...item,
              checkinResult: "failed" as const,
              checkinMessage: parsedDesc || parsedTitle,
            }))
          );
          setShowBulkList(true);
        },
      }
    );
  };

  const clearScanResult = useCallback(() => {
    if (scanResultTimeoutRef.current) {
      clearTimeout(scanResultTimeoutRef.current);
      scanResultTimeoutRef.current = null;
    }
    setScanResult(null);
  }, []);

  const handleModeChange = useCallback(
    (newMode: ScanMode) => {
      if (newMode === mode) return;
      setMode(newMode);
      suppressedCodesRef.current.clear();
      processingCodesRef.current.clear();
      suppressTimersRef.current.forEach(clearTimeout);
      suppressTimersRef.current.clear();
      clearBulkToastState();

      // Preserve eventId in URL query to prevent dropping context on mode switch
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            mode: newMode,
            ...(eventIdRef.current ? { eventId: eventIdRef.current } : {}),
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [mode, router, clearBulkToastState]
  );

  return {
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
    setSelectedEventDayId: handleDayChange,
    eventData,
    clearScanResult,
    cameraError,
    retryCamera,
    cancelProcessing,
    mounted,
    isProcessing,
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
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