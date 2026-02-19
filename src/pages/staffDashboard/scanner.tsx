import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScanTicket, useBulkCheckIn } from "@/hooks/useTickets";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  ArrowLeftIcon,
  XCircleIcon,
  CheckCircleIcon,
  Trash,
  QrCode,
  PaperPlaneRight,
  TrashIcon,
  PaperPlaneRightIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import { Loader2Icon } from "lucide-react";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { UnsavedChangesDialog } from "@/components/organizerDashboard/eventForm/createEventForm/UnsavedChangesDialog";

type ScanMode = "single" | "bulk";

interface BulkScanItem {
  code: string;
  timestamp: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // State
  const [mode, setMode] = useState<ScanMode>("single");
  const [bulkQueue, setBulkQueue] = useState<BulkScanItem[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [showBulkList, setShowBulkList] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    success: boolean;
    message: string;
    items?: { [key: string]: any }[];
  } | null>(null);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticketNumber?: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scanMutation = useScanTicket();
  const bulkCheckInMutation = useBulkCheckIn();

  // Navigation Guard
  const hasUnsavedChanges = useCallback(
    () => bulkQueue.length > 0,
    [bulkQueue],
  );

  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({
      hasUnsavedChanges,
    });

  // Check URL mode and eventId
  useEffect(() => {
    if (router.isReady) {
      if (router.query.mode === "bulk") {
        setMode("bulk");
      }

      const paramEventId = router.query.eventId as string;
      setEventId(paramEventId || null);
    }
  }, [router.isReady, router.query]);

  // Update queue state
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

  const handleScan = (ticketCode: string) => {
    const code = ticketCode.trim();
    if (!code) return;

    if (mode === "single") {
      // Use eventId if present, otherwise let backend try to find it (or fail if required)
      handleSingleScan(code, eventId || undefined);
    } else {
      handleBulkScan(code);
    }
  };

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

          // Clear result after 3 seconds for next scan
          setTimeout(() => {
            setScanResult(null);
          }, 3000);
        },
      },
    );
  };

  const handleBulkScan = (code: string) => {
    // Check queue limit
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

    // Check if code is already in queue
    if (bulkQueue.some((item) => item.code === code)) {
      toast.error(t("staffScanner.alreadyInQueue", "Ticket already in queue"));
      return;
    }

    if (bulkQueue.length === 0 && !eventId) {
      scanMutation.mutate(
        { ticketCode: code },
        {
          onSuccess: (data) => {
            if (data.ticket?.event_id) {
              const newEventId = data.ticket.event_id;
              const newItem = { code, timestamp: new Date().toISOString() };
              updateQueue([newItem], newEventId);
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

    // Quick feedback
    if (navigator.vibrate) navigator.vibrate(50);
    toast.success(
      "Added to queue",
      `#${bulkQueue.length + 1}: ${code.substring(0, 8)}...`,
    );
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
      {
        event_id: eventId,
        qr_codes: codes,
      },
      {
        onSuccess: (data) => {
          setBulkResult({
            success: data.success,
            message: data.message,
            items: data.data,
          });
          // Clear queue on success
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

  const removeFromQueue = (index: number) => {
    const newQueue = [...bulkQueue];
    newQueue.splice(index, 1);
    updateQueue(newQueue, newQueue.length === 0 ? null : undefined);
  };

  const handleQRScan = (result: unknown[]) => {
    // Prevent multiple scans while processing
    if (scanMutation.isPending || scanResult) return;

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for secure context on mount
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

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Ticket Scanner | Staff Dashboard</title>
      </Head>
      <StaffDashboardLayout>
        <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
          <div className="flex flex-col h-[calc(100vh-64px)] relative max-md:bg-black">
            {/* Mode Toggle & Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 max-md:bg-linear-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <Link href="/staffDashboard">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white md:text-black hover:bg-white/20"
                  >
                    <ArrowLeftIcon weight="bold" className="size-6" />
                  </Button>
                </Link>
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 flex border border-white/10">
                  <button
                    onClick={() => setMode("single")}
                    className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                      mode === "single"
                        ? "bg-white text-black shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {t("staffScanner.single", "Single")}
                  </button>
                  <button
                    onClick={() => setMode("bulk")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      mode === "bulk"
                        ? "bg-white text-black shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {t("staffScanner.bulk", "Bulk")} ({bulkQueue.length})
                  </button>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>
            {/* Camera Area */}
            <div className="flex-1 relative overflow-hidden md:max-w-[500px] md:mx-auto md:rounded-xl md:max-h-[500px] md:mt-18 md:mb-6 scanner-wrapper">
              {!eventId ? (
                <div className="flex items-center justify-center h-full bg-white text-black p-6 text-center">
                  <div className="max-w-md space-y-4">
                    <Alert className="bg-amber-50 border-amber-500/50 text-amber-600 p-6">
                      <AlertDescription className="flex flex-col items-center gap-2 text-lg">
                        <span className="p-3 bg-amber-100 rounded-full">
                          <WarningOctagonIcon
                            weight="bold"
                            className="size-8"
                          />
                        </span>
                        {t(
                          "staffScanner.selectEventFirst",
                          "Please select an event from the dashboard to start scanning.",
                        )}
                      </AlertDescription>
                    </Alert>
                    <Link href="/staffDashboard">
                      <Button variant="default">
                        {t("staffScanner.backToDashboard", "Back to Dashboard")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : !cameraError ? (
                <>
                  <div className="w-full h-full relative">
                    <Scanner
                      scanDelay={300}
                      onScan={handleQRScan}
                      onError={handleCameraError}
                      classNames={{
                        container: "scanner-wrapper",
                      }}
                      components={{
                        finder: false,
                      }}
                      constraints={{
                        facingMode: "environment",
                      }}
                      styles={{
                        container: {
                          width: "100vw",
                          height: "calc(100dvh - 64px)",
                        },
                        video: {
                          width: "100vw",
                          height: "calc(100dvh - 64px)",
                          objectFit: "cover",
                        },
                      }}
                    />
                  </div>

                  {/* Scanner Finder Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${mode === "bulk" ? "w-72 h-48 border-dashed" : "w-64 h-64"} border-4 border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mode === "bulk" && (
                          <QrCode className="text-white/20" size={48} />
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-32 left-0 right-0 text-center text-white/80 px-4">
                      <p className="text-sm font-medium shadow-black/50 drop-shadow-md">
                        {mode === "single"
                          ? t(
                              "staffScanner.scanTicketInfo",
                              "Scan a ticket to check in",
                            )
                          : t(
                              "staffScanner.scanMultipleTicketsInfo",
                              "Scan multiple tickets to queue",
                            )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
                  <div className="max-w-md space-y-4">
                    <XCircleIcon size={48} className="mx-auto text-red-500" />
                    <p className="text-lg font-medium">{cameraError}</p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {(scanMutation.isPending || bulkCheckInMutation.isPending) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
                    <Loader2Icon className="size-8 animate-spin" />
                    <span className="text-sm font-medium text-gray-900">
                      {t("common.processing", "Processing...")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Controls Bottom Sheet */}
            {mode === "bulk" && bulkQueue.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-20 pb-safe">
                <div className="p-4">
                  <div
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setShowBulkList(!showBulkList)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                        {bulkQueue.length}{" "}
                        {t("staffScanner.inQueue", "In Queue")}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("staffScanner.pendingCheckIn", "Pending Check-in")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      {showBulkList
                        ? t("common.hideList", "Hide List")
                        : t("common.viewList", "View List")}
                    </Button>
                  </div>

                  {showBulkList && (
                    <div className="max-h-48 overflow-y-auto mb-4 border rounded-lg divide-y">
                      {bulkQueue.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 flex items-center justify-between bg-gray-50 text-sm"
                        >
                          <span className="font-mono text-gray-700">
                            {item.code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(idx);
                            }}
                            className="text-red-500 p-1"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      onClick={submitBulkCheckIn}
                      disabled={bulkCheckInMutation.isPending}
                    >
                      <PaperPlaneRightIcon size={18} weight="fill" />
                      {t(
                        "staffScanner.submitBulkCheckIn",
                        "Submit Bulk Check-in",
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={clearQueue}
                    >
                      <TrashIcon size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Single Scan Overlay Result */}
            {scanResult && mode === "single" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 pointer-events-none">
                <div
                  className={`absolute inset-0 ${scanResult.success ? "bg-green-500" : "bg-red-500"}`}
                />
                <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center shadow-2xl space-y-4 pointer-events-auto">
                  <div
                    className={`mx-auto rounded-full p-4 w-20 h-20 flex items-center justify-center ${scanResult.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {scanResult.success ? (
                      <CheckCircleIcon size={48} weight="fill" />
                    ) : (
                      <XCircleIcon size={48} weight="fill" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {scanResult.success ? "Checked In!" : "Scan Failed"}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {scanResult.message}
                    </p>
                    {scanResult.ticketNumber && (
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        {scanResult.ticketNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Result Overlay */}
            {bulkResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                  <div
                    className={`p-6 text-center ${bulkResult.success ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <div
                      className={`mx-auto mb-3 rounded-full p-3 w-16 h-16 flex items-center justify-center ${bulkResult.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {bulkResult.success ? (
                        <CheckCircleIcon size={32} weight="fill" />
                      ) : (
                        <XCircleIcon size={32} weight="fill" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t("common.bulkOperation", "Bulk Operation")}
                      {bulkResult.success ? "Complete" : "Failed"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bulkResult.message}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                    {bulkResult.items?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border flex items-start gap-3 bg-white ${item.success ? "border-green-200" : "border-red-200"}`}
                      >
                        {item.success ? (
                          <CheckCircleIcon className="text-green-500 mt-0.5" />
                        ) : (
                          <XCircleIcon className="text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.ticket_number ||
                              item.code ||
                              `Ticket #${i + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setBulkResult(null)}
                    >
                      {t("common.done", "Done")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PermissionGuard>
      </StaffDashboardLayout>

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}
