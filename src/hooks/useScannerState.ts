"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useScanTicket, useBulkCheckIn, useValidateCheckIn } from "@/hooks/useTickets";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService } from "@/services/eventService";
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
  const [scannedEventTitle, setScannedEventTitle] = useState<string | null>(null);

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const scanMutation = useScanTicket();
  const bulkCheckInMutation = useBulkCheckIn();
  const validateCheckInMutation = useValidateCheckIn();

  const isProcessing =
    scanMutation.isPending ||
    bulkCheckInMutation.isPending ||
    validateCheckInMutation.isPending;

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

  // ─── Queue Helpers ────────────────────────────────────────────────────────────
  const updateQueue = (
    newQueue: BulkScanItem[],
    newEventId?: string | null,
  ) => {
    setBulkQueue(newQueue);
    if (newEventId !== undefined) {
      setEventId(newEventId);
    }
  };

  const clearQueue = () => {
    updateQueue([]);
    setBulkResult(null);
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...bulkQueue];
    newQueue.splice(index, 1);
    updateQueue(newQueue, newQueue.length === 0 ? null : undefined);
  };

  // ─── Scan Handlers ────────────────────────────────────────────────────────────
  const handleSingleScan = (code: string, scanEventId?: string) => {
    scanMutation.mutate(
      { ticketCode: code, eventId: scanEventId },
      {
        onSuccess: (data) => {
          setScanResult({
            success: data.success,
            message: data.message,
          });
          // Auto-clear result after 3 s so the camera is ready for the next scan
          setTimeout(() => setScanResult(null), 3000);
        },
        onError: (error) => {
          setScanResult({
            success: false,
            message:
              error.message ||
              t("staffScanner.scanFailed", "Failed to scan ticket"),
          });
          // Auto-clear so the camera is ready for the next scan
          setTimeout(() => setScanResult(null), 3000);
        },
      },
    );
  };

  const handleBulkScan = (code: string) => {
    if (bulkQueue.length >= 10) {
      toast.error(
        t("staffScanner.queueLimitReached", "Queue limit reached (Max 10)"),
        t(
          "staffScanner.submitQueue",
          "Please submit current queue for check-in first",
        ),
      );
      return;
    }

    if (bulkQueue.some((item) => item.code === code)) {
      toast.error(t("staffScanner.alreadyInQueue", "Ticket already in queue"));
      return;
    }

    // Validate the ticket via API before adding to the queue
    validateCheckInMutation.mutate(
      { qrCode: code, eventId: eventId ?? undefined },
      {
        onSuccess: (data) => {
          if (!data.can_checkin) {
            // Validation failed – show reason and do NOT add to queue
            toast.error(
              t("staffScanner.ticketInvalid", "Invalid ticket"),
              data.message || "Ticket cannot be checked in",
            );
            return;
          }

          // Validation passed – add to queue
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

          // If there's no event context yet, attempt to extract it from the response
          const responseEventId = data.event_id;
          const responseEventTitle = data.event_title;

          if (!eventId && responseEventId) {
            updateQueue([newItem], responseEventId);
            if (responseEventTitle) {
              setScannedEventTitle(responseEventTitle);
            }
            toast.success(
              "Event detected",
              `Ready to scan for: ${responseEventTitle ?? responseEventId}`,
            );
          } else {
            updateQueue([...bulkQueue, newItem], undefined);
            if (navigator.vibrate) navigator.vibrate(50);
            toast.success(
              "staffScanner.addedToQueue",
              "Added to queue",
              `#${bulkQueue.length + 1}: ${newItem.ticketNumber}`,
            );
          }
        }
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
    // Prevent multiple scans while a result is displayed, a request is in-flight,
    // or all bulk tickets are already successfully checked in
    if (isProcessing || scanResult || isScanDisabled) return;

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
          const results: BulkResultItem[] = (data.data ?? []).map((r) => ({
            success: r.success as boolean,
            message: r.message as string | undefined,
            qr_code: r.qr_code as string | undefined,
          }));

          // Update each item in the queue with its check-in result
          const updatedQueue = bulkQueue.map((item) => {
            const result = results?.find(
              (r) => r.qr_code === item.code,
            );
            return {
              ...item,
              checkinResult: result?.success ? ("success" as const) : ("failed" as const),
              checkinMessage: result?.message || (result?.success ? "Checked in" : "Failed"),
            };
          });

          setBulkQueue(updatedQueue);
          setShowBulkList(true);

          // if (data.success) {
          //   toast.success("Bulk check-in complete");
          // } else {
          //   toast.error("Bulk check-in completed with issues");
          // }
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

  const clearScanResult = useCallback(() => setScanResult(null), []);

  return {
    // State
    isScanDisabled,
    mode,
    setMode,
    bulkQueue,
    eventId,
    currentEventTitle,
    showBulkList,
    setShowBulkList,
    bulkResult,
    setBulkResult,
    scanResult,
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
    t,
  };
}

export default useScannerState;
