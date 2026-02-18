import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScanTicket } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
  ArrowLeft,
  XCircle,
  CheckCircle,
  ArrowLeftIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import StaffDashboardLayout from '@/components/layout/StaffDashboardLayout';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function ScannerPage() {
  const { locale } = useLanguageStore()
  const { t } = useTranslation(locale)
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticketNumber?: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scanMutation = useScanTicket();

  const handleScan = (ticketCode: string) => {
    if (!ticketCode.trim()) return;

    scanMutation.mutate(ticketCode.trim(), {
      onSuccess: (data) => {
        setScanResult({
          success: data.success,
          message: data.message,
          ticketNumber: ticketCode,
        });

        // Clear result after 3 seconds for next scan
        setTimeout(() => {
          setScanResult(null);
        }, 3000);
      },
      onError: (error) => {
        setScanResult({
          success: false,
          message: error.message || 'Failed to scan ticket',
          ticketNumber: ticketCode,
        });

        // Clear error after 3 seconds
        setTimeout(() => {
          setScanResult(null);
        }, 3000);
      },
    });
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
    console.error('Camera error:', error);

    let errorMessage = t('staffScanner.cameraErrorGeneric', "Failed to access camera.");

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = t('staffScanner.cameraPermissionDenied', "Camera access denied. Please enable camera permissions in your browser settings.");
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = t('staffScanner.noCameraFound', "No camera found on this device.");
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = t('staffScanner.cameraInUse', "Camera is currently in use by another application or permission is denied.");
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = t('staffScanner.cameraConstraints', "Camera constraints not satisfied.");
      }
    }

    setCameraError(errorMessage);
  };

  // Check for secure context on mount
  useState(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraError(t('staffScanner.insecureContext', "Camera access requires a secure context (HTTPS)."));
    }
  });

  return (
    <>
      <Head>
        <title>QR Scanner | Staff Dashboard</title>
      </Head>
      <StaffDashboardLayout>
        <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
          <div className="bg-gray-50 md:p-4">
            <div className="max-w-2xl mx-auto space-y-4 relative">
              {/* Header */}


              {/* Scanner Area */}
              {/* Camera Scanner */}
              {!cameraError ? (
                <>
                  <div className="flex items-center gap-4 absolute top-2 left-2 z-10">
                    <Link href="/staffDashboard">
                      <Button variant="ghost" size="icon" className="gap-2 size-11 bg-black/25">
                        <ArrowLeftIcon weight='bold' className='size-6 text-white' />
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <div className="relative md:aspect-square bg-gray-900 rounded-lg overflow-hidden">
                      <Scanner
                        onScan={handleQRScan}
                        onError={handleCameraError}
                        components={{
                          finder: false,
                        }}
                        constraints={{
                          facingMode: 'environment'
                        }}
                        styles={{
                          container: {
                            width: '100vw',
                            height: 'calc(100dvh - 64px)',
                          },
                          video: {
                            width: '100vw',
                            height: 'calc(100dvh - 64px)',
                          },
                        }}
                      />
                      {/* Scanner overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-lg shadow-lg" />
                      </div>

                      {/* Scanning indicator */}
                      {scanMutation.isPending && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <span className="text-sm font-medium">Validating...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Camera Error Display */
                  <div className="space-y-4 max-md:p-6 text-center">
                    <Alert variant="destructive" className='py-4.5 text-left'>
                    <XCircleIcon weight='duotone' size={20} />
                    <AlertDescription className='-mb-[3px] font-semibold'>{cameraError}</AlertDescription>
                  </Alert>

                    <p className="text-sm text-gray-600">
                      {t('staffScanner.cameraErrorDescription', 'Please ensure camera permissions are allowed in your browser settings.')}
                  </p>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setCameraError(null);
                        // Force remount of scanner component
                        setTimeout(() => window.location.reload(), 100);
                      }}
                    >
                      {t('staffScanner.retryCameraAccess', 'Retry Camera Access')}
                    </Button>
                </div>
              )}

              {/* Scan Result */}
              {scanResult && (
                <div className="max-md:p-4">
                  <Alert
                    variant={scanResult.success ? 'default' : 'destructive'}
                    className={scanResult.success ? 'border-green-200 bg-green-50' : ''}
                  >
                    <div className="flex items-start gap-3">
                      {scanResult.success ? (
                        <CheckCircle size={24} weight="fill" className="text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={24} weight="fill" className="text-red-600 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <AlertDescription className={scanResult.success ? 'text-green-900' : ''}>
                          <p className="font-semibold">{scanResult.message}</p>
                          {scanResult.ticketNumber && (
                            <p className="text-sm mt-1 opacity-75">{t('staffScanner.ticketNumber')}: {scanResult.ticketNumber}</p>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </PermissionGuard>
      </StaffDashboardLayout >
    </>
  );
}
