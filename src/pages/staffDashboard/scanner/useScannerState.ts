"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useScanTicket, useBulkCheckIn } from "@/hooks/useTickets";
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

  const isProcessing = scanMutation.isPending || bulkCheckInMutation.isPending;

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
            ticketNumber: code,
          });
          // Auto-clear result after 3 s so the camera is ready for the next scan
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

    // First scan determines the event context when none is present
    if (bulkQueue.length === 0 && !eventId) {
      scanMutation.mutate(
        { ticketCode: code },
        {
          onSuccess: (data) => {
            if (data.ticket?.event_id) {
              const newEventId = data.ticket.event_id;
              const newItem = { code, timestamp: new Date().toISOString() };
              updateQueue([newItem], newEventId);
              setScannedEventTitle(data.ticket.event_title || null);
              toast.success(
                "Event detected",
                `Ready to scan for: ${data.ticket.event_title}`,
              );
            }
          },
        },
      );
      return;
    }

    const newItem = { code, timestamp: new Date().toISOString() };
    updateQueue([...bulkQueue, newItem], undefined);

    if (navigator.vibrate) navigator.vibrate(50);
    toast.success(
      "Added to queue",
      `#${bulkQueue.length + 1}: ${code.substring(0, 8)}...`,
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
    // Prevent multiple scans while a result is displayed or a request is in-flight
    if (isProcessing || scanResult) return;

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
          setBulkResult({
            success: data.success,
            message: data.message,
            items: data.data as BulkResultItem[] | undefined,
          });
          if (data.success) {
            updateQueue([], null);
          }
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

  return {
    // State
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
