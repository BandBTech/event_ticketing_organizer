import Head from "next/head";
import Link from "next/link";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import { UnsavedChangesDialog } from "@/components/organizerDashboard/eventForm/createEventForm/UnsavedChangesDialog";

import useScannerState from "@/hooks/useScannerState";
import ScannerHeader from "@/components/scanner/ScannerHeader";
import QRCameraView from "@/components/scanner/QRCameraView";
import NoEventWarning from "@/components/scanner/NoEventWarning";
import CameraErrorView from "@/components/scanner/CameraErrorView";
import ProcessingOverlay from "@/components/scanner/ProcessingOverlay";
import BulkBottomSheet from "@/components/scanner/BulkBottomSheet";
import SingleScanResult from "@/components/scanner/SingleScanResult";

export default function ScannerPage() {
  const {
    isScanDisabled,
    isQueueSubmitted,
    isBulkToastShowing,
    mode,
    setMode,
    bulkQueue,
    eventId,
    currentEventTitle,
    showBulkList,
    setShowBulkList,
    scanResult,
    clearScanResult,
    cameraError,
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
    selectedEventDayId,
    setSelectedEventDayId,
    eventData,
    t,
  } = useScannerState();

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>{t("staffDashboard.scannerTitle", "Ticket Scanner")}</title>
      </Head>

      <StaffDashboardLayout>
        <PermissionGuard
          permission={PERMISSIONS.TICKET_SCAN}
          role="staff"
          fallback={
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8 text-center gap-4">
              <p className="text-lg font-semibold text-gray-800">
                {t("common.accessDenied", "Access Denied")}
              </p>
              <p className="text-sm text-gray-500">
                {t(
                  "staffScanner.noPermission",
                  "You don't have permission to scan tickets.",
                )}
              </p>
              <Link
                href="/staffDashboard"
                className="text-sm text-blue-600 underline underline-offset-2"
              >
                {t("staffScanner.backToDashboard", "Back to Dashboard")}
              </Link>
            </div>
          }
        >
          <div className="flex flex-col h-[calc(100dvh-64px)] overflow-hidden relative max-md:bg-black isolate">
            {/* ── Header ───────────────────────────────────────────────── */}
            <ScannerHeader
              mode={mode}
              bulkCount={bulkQueue.length}
              onModeChange={setMode}
              singleLabel={t("staffScanner.single", "Single")}
              bulkLabel={t("staffScanner.bulk", "Bulk")}
              eventTitle={currentEventTitle}
              eventDays={eventData?.event_days}
              selectedDayId={selectedEventDayId}
              onDayChange={setSelectedEventDayId}
              startDate={eventData?.start_date}
              endDate={eventData?.end_date}
            />

            {/* ── Camera area ──────────────────────────────────────────── */}
            <div className="flex-1 relative overflow-hidden md:max-w-[500px] md:mx-auto md:rounded-xl md:max-h-[500px] md:mt-18 md:mb-6 scanner-wrapper">
              {!eventId ? (
                <NoEventWarning
                  selectEventText={t(
                    "staffScanner.selectEventFirst",
                    "Please select an event from the dashboard to start scanning.",
                  )}
                  backToDashboardText={t(
                    "staffScanner.backToDashboard",
                    "Back to Dashboard",
                  )}
                />
              ) : !cameraError ? (
                <QRCameraView
                  mode={mode}
                  onScan={handleQRScan}
                  onError={handleCameraError}
                  disabled={isScanDisabled}
                  paused={
                    (mode === "bulk" && bulkQueue.length > 0 && isQueueSubmitted) ||
                    (mode === "single" && !!scanResult)
                  }
                  scanCompleted={
                    (mode === "bulk" && bulkQueue.length > 0 && isQueueSubmitted && !bulkQueue.some((i) => i.checkinResult === "failed")) ||
                    (mode === "single" && !!scanResult?.success && !scanResult?.alreadyCheckedIn)
                  }
                  // lastScanError={lastScanError}
                  externalPaused={mode === "bulk" && showBulkList}
                  resumeHintText={t(
                    "staffScanner.tapToResume",
                    "Tap to resume scanning",
                  )}
                  scanHintText={
                    isBulkToastShowing && mode === "bulk"
                      ? t("staffScanner.pleaseWait", "Please wait...")
                      : isScanDisabled && mode === "bulk"
                        ? isQueueSubmitted &&
                          bulkQueue.some((i) => i.checkinResult === "failed")
                          ? t(
                            "staffScanner.reviewResults",
                            "Review results — retry failed or clear queue",
                          )
                          : t(
                            "staffScanner.allCheckedIn",
                            "All tickets checked in — tap Done to finish",
                          )
                        : mode === "single"
                        ? t(
                          "staffScanner.scanTicketInfo",
                          "Scan a ticket to check in",
                        )
                        : t(
                          "staffScanner.scanMultipleTicketsInfo",
                          "Scan multiple tickets to queue",
                        )
                  }
                />
              ) : (
                <CameraErrorView errorMessage={cameraError} />
              )}

              {/* Loading overlay — sits above camera area */}
              <ProcessingOverlay
                visible={isProcessing}
                label={t("common.processing", "Processing...")}
              />
            </div>

            {/* ── Bulk controls bottom sheet ────────────────────────────── */}
            {mode === "bulk" && (
              <BulkBottomSheet
                queue={bulkQueue}
                showList={showBulkList}
                isSubmitting={isProcessing}
                onToggleList={() => setShowBulkList(!showBulkList)}
                onRemoveItem={removeFromQueue}
                onSubmit={submitBulkCheckIn}
                onClear={clearQueue}
                onRetryFailed={retryFailed}
                inQueueLabel={t("staffScanner.inQueue", "In Queue")}
                pendingCheckInLabel={t(
                  "staffScanner.pendingCheckIn",
                  "Pending Check-in",
                )}
                viewListLabel={t("common.viewList", "View List")}
                hideListLabel={t("common.hideList", "Hide List")}
                submitLabel={t(
                  "staffScanner.submitBulkCheckIn",
                  "Submit Bulk Check-in",
                )}
              />
            )}
          </div>
        </PermissionGuard>
      </StaffDashboardLayout>

      {/* ── Overlays (above everything) ──────────────────────────────────── */}
      {mode === "single" && (
        <SingleScanResult result={scanResult} onClose={clearScanResult} />
      )}

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}
