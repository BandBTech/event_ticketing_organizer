'use client';

import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  CheckCircle,
  Lightning,
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function StaffDashboardHome() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to scan tickets and check in attendees
          </p>
        </div>

        {/* Main Scanner Card */}
        <Card className="p-8 bg-white shadow-xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-6 rounded-full">
                <QrCode size={64} className="text-blue-600" weight="duotone" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Quick Ticket Scanner</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start scanning QR codes instantly. Check in attendees with just one tap.
              </p>
            </div>

            <Link href="/staffDashboard/scanner" className="inline-block">
              <Button size="lg" className="gap-3 px-8 py-6 text-lg">
                <QrCode size={24} />
                Open Scanner
              </Button>
            </Link>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Lightning size={32} className="text-green-600" weight="duotone" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Instant Validation</p>
                <p className="text-sm text-gray-500 mt-1">Real-time ticket verification</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <QrCode size={32} className="text-blue-600" weight="duotone" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">QR Code Scanning</p>
                <p className="text-sm text-gray-500 mt-1">Camera or manual entry</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <CheckCircle size={32} className="text-purple-600" weight="duotone" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Auto Check-in</p>
                <p className="text-sm text-gray-500 mt-1">Automatic attendee check-in</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats (Optional - can be removed if not needed) */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="text-center space-y-2">
            <p className="text-sm opacity-90">Today's Session</p>
            <p className="text-3xl font-bold">Ready to Start</p>
            <p className="text-sm opacity-75">Click "Open Scanner" to begin checking in attendees</p>
          </div>
        </Card>
      </div>
    </div>
  );
}