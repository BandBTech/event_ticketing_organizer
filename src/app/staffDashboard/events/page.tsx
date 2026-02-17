'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  QrCode,
  Ticket,
  User,
  Info,
} from '@phosphor-icons/react';
import TicketScanner from './[id]/tickets/components/TicketScanner';

export default function StaffEventsPage() {
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 p-4 rounded-full">
            <QrCode size={48} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Scanner</h1>
        <p className="text-gray-500">
          Scan and validate event tickets
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info size={20} className="text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Welcome, {user?.firstName}!</strong>
          <br />
          Use the scanner below to check in attendees. Enter the ticket code manually or scan the QR code.
        </AlertDescription>
      </Alert>

      {/* Main Scanner Card */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <Ticket size={64} className="mx-auto text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Ready to Scan</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Click the button below to open the ticket scanner. You can scan QR codes or manually enter ticket numbers.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setShowScanner(true)}
              className="gap-3 px-8"
            >
              <QrCode size={24} />
              Open Scanner
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <QrCode size={32} className="text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">Quick Scan</p>
              <p className="text-sm text-gray-500">Instant check-in</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Ticket size={32} className="text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">Valid Tickets</p>
              <p className="text-sm text-gray-500">Auto-validated</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <User size={32} className="text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">Real-time</p>
              <p className="text-sm text-gray-500">Instant updates</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">How to Use</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">1.</span>
            <span>Click "Open Scanner" to launch the ticket scanning interface</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">2.</span>
            <span>Enter the ticket number manually or use the QR scanner (when available)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">3.</span>
            <span>Valid tickets will be automatically checked in</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">4.</span>
            <span>Invalid or already-scanned tickets will show an error message</span>
          </li>
        </ol>
      </Card>

      {/* Scanner Modal - Empty eventId since staff can scan any event */}
      {showScanner && (
        <TicketScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          eventId="" // Staff can scan tickets for any event
        />
      )}
    </div>
  );
}
