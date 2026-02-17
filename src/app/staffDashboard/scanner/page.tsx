'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScanTicket } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
  QrCode,
  CheckCircle,
  XCircle,
  // Keyboard,
  // Camera,
  ArrowLeft,
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function ScannerPage() {
  // const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticketNumber?: string;
  } | null>(null);
  // const [useCameraScanner, setUseCameraScanner] = useState(true);
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
          // setManualCode('');
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

  const handleQRScan = (result: any) => {
    // Prevent multiple scans while processing
    if (scanMutation.isPending || scanResult) return;

    if (result && result.length > 0) {
      const scannedCode = result[0].rawValue;
      handleScan(scannedCode);
    }
  };

  // const handleManualScan = () => {
  //   handleScan(manualCode);
  // };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     handleManualScan();
  //   }
  // };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    setCameraError('Failed to access camera. Please check camera permissions.');
    // setUseCameraScanner(false);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/staffDashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
              <p className="text-sm text-gray-500">Scan tickets to check in attendees</p>
            </div>
          </div>

          {/* Mode Toggle - Commented Out */}
          {/* <Card className="p-4">
            <div className="flex gap-2">
              <Button
                variant={useCameraScanner ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseCameraScanner(true);
                  setCameraError(null);
                }}
                className="flex-1 gap-2"
              >
                <Camera size={18} />
                Camera
              </Button>
              <Button
                variant={!useCameraScanner ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseCameraScanner(false)}
                className="flex-1 gap-2"
              >
                <Keyboard size={18} />
                Manual
              </Button>
            </div>
          </Card> */}

          {/* Scanner Area */}
          <Card className="p-4">
            {/* Camera Scanner */}
            {!cameraError ? (
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleCameraError}
                    components={{
                      finder: false,
                    }}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%',
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

                <p className="text-center text-sm text-gray-600">
                  Position QR code within the frame
                </p>
              </div>
            ) : (
              /* Camera Error Display */
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle size={20} />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>

                <p className="text-center text-sm text-gray-600">
                  Please allow camera access in your browser settings and refresh the page.
                </p>
              </div>
            )}

            {/* Manual Entry - Commented Out */}
            {/* {useCameraScanner && !cameraError ? (
              // Camera scanner code above
            ) : (
              <div className="space-y-4">
                {cameraError && (
                  <Alert variant="destructive">
                    <XCircle size={20} />
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Enter Ticket Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ticket number..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={scanMutation.isPending}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      onClick={handleManualScan}
                      disabled={!manualCode.trim() || scanMutation.isPending}
                    >
                      {scanMutation.isPending ? 'Validating...' : 'Scan'}
                    </Button>
                  </div>
                </div>
              </div>
            )} */}
          </Card>

          {/* Scan Result */}
          {scanResult && (
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
                      <p className="text-sm mt-1 opacity-75">Ticket: {scanResult.ticketNumber}</p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Instructions */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">How to Use:</h3>
            <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
              <li>Point camera at ticket QR code for automatic scanning</li>
              <li>Valid tickets are checked in automatically</li>
              <li>Results clear after 3 seconds for next scan</li>
              <li>Ensure good lighting for best results</li>
            </ul>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
