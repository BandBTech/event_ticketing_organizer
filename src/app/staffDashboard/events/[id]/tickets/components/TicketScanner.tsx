'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScanTicket } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Keyboard,
  Camera,
  X,
} from '@phosphor-icons/react';

interface TicketScannerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function TicketScanner({
  isOpen,
  onClose,
  eventId,
}: TicketScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [useCameraScanner, setUseCameraScanner] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scanMutation = useScanTicket();

  const handleScan = (ticketCode: string) => {
    if (!ticketCode.trim()) return;

    scanMutation.mutate(ticketCode.trim(), {
      onSuccess: (data) => {
        setScanResult({
          success: data.success,
          message: data.message,
        });

        // Clear input and close after success
        if (data.success) {
          setTimeout(() => {
            setManualCode('');
            setScanResult(null);
            onClose();
          }, 2000);
        }
      },
      onError: (error) => {
        setScanResult({
          success: false,
          message: error.message || 'Failed to scan ticket',
        });
      },
    });
  };

  const handleQRScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedCode = result[0].rawValue;
      handleScan(scannedCode);
    }
  };

  const handleManualScan = () => {
    handleScan(manualCode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    setCameraError('Failed to access camera. Please check permissions or use manual entry.');
    setUseCameraScanner(false);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode size={24} className="text-blue-600" />
              Scan Ticket
            </DialogTitle>
            <DialogDescription>
              Scan a ticket QR code or enter the ticket number manually
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Camera/Manual Toggle */}
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
                <Camera size={16} />
                Camera
              </Button>
              <Button
                variant={!useCameraScanner ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseCameraScanner(false)}
                className="flex-1 gap-2"
              >
                <Keyboard size={16} />
                Manual
              </Button>
            </div>

            {/* QR Scanner or Manual Input */}
            {useCameraScanner && !cameraError ? (
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
                  <div className="absolute inset-0 border-2 border-blue-500 opacity-30 rounded-lg" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white rounded-lg" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cameraError && (
                  <Alert variant="destructive">
                    <XCircle size={20} />
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Keyboard size={16} />
                  <span>Enter ticket number manually:</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter ticket number or QR code..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={scanMutation.isPending}
                      autoFocus
                    />
                  </div>
                  <Button
                    onClick={handleManualScan}
                    disabled={!manualCode.trim() || scanMutation.isPending}
                  >
                    {scanMutation.isPending ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <Alert variant={scanResult.success ? 'default' : 'destructive'}>
                <div className="flex items-start gap-2">
                  {scanResult.success ? (
                    <CheckCircle size={20} weight="fill" className="text-green-600 mt-0.5" />
                  ) : (
                    <XCircle size={20} weight="fill" className="text-red-600 mt-0.5" />
                  )}
                  <AlertDescription className="flex-1">
                    {scanResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Use camera mode to scan QR codes automatically</li>
                <li>Switch to manual mode to type ticket numbers</li>
                <li>Valid tickets will be automatically checked in</li>
                <li>Invalid or already-scanned tickets will show an error</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
