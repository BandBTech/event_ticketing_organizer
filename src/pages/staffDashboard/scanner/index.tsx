import Head from "next/head";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import { UnsavedChangesDialog } from "@/components/organizerDashboard/eventForm/createEventForm/UnsavedChangesDialog";

import { useScannerState } from "./useScannerState";
import { ScannerHeader } from "./components/ScannerHeader";
import { QRCameraView } from "./components/QRCameraView";
import { NoEventWarning } from "./components/NoEventWarning";
import { CameraErrorView } from "./components/CameraErrorView";
import { ProcessingOverlay } from "./components/ProcessingOverlay";
import { BulkBottomSheet } from "./components/BulkBottomSheet";
import { SingleScanResult } from "./components/SingleScanResult";
import { BulkResultOverlay } from "./components/BulkResultOverlay";

export default function ScannerPage() {
  const {
    mode,
    setMode,
    bulkQueue,
    eventId,
    showBulkList,
    setShowBulkList,
    bulkResult,
    setBulkResult,
    scanResult,
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
    t,
  } = useScannerState();

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Ticket Scanner | Staff Dashboard</title>
      </Head>

      <StaffDashboardLayout>
        <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
          <div className="flex flex-col h-[calc(100vh-64px)] relative max-md:bg-black isolate">
            {/* ── Header ───────────────────────────────────────────────── */}
            <ScannerHeader
              mode={mode}
              bulkCount={bulkQueue.length}
              onModeChange={setMode}
              singleLabel={t("staffScanner.single", "Single")}
              bulkLabel={t("staffScanner.bulk", "Bulk")}
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
                  scanHintText={
                    mode === "single"
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
      {mode === "single" && <SingleScanResult result={scanResult} />}

      <BulkResultOverlay
        result={bulkResult}
        onDismiss={() => setBulkResult(null)}
        bulkOperationLabel={t("common.bulkOperation", "Bulk Operation")}
        doneLabel={t("common.done", "Done")}
      />

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}
