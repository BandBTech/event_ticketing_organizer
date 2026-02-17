'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCheckInTicket, useCheckOutTicket } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
  Ticket as TicketIcon,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
} from '@phosphor-icons/react';
import { formatDateTime } from '@/lib/utils';
import type { Ticket } from '@/types/ticket';

interface TicketDetailsModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailsModal({
  ticket,
  isOpen,
  onClose,
}: TicketDetailsModalProps) {
  const [showQR, setShowQR] = useState(false);
  const checkInMutation = useCheckInTicket();
  const checkOutMutation = useCheckOutTicket();

  const handleCheckIn = () => {
    checkInMutation.mutate(
      { ticketId: ticket.id },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(
      { ticketId: ticket.id },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      valid: 'bg-green-100 text-green-700',
      used: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700',
      refunded: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || colors.valid;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon size={24} className="text-blue-600" />
            Ticket Details
          </DialogTitle>
          <DialogDescription>
            Complete information for ticket #{ticket.ticket_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and QR */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.toUpperCase()}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(!showQR)}
              className="gap-2"
            >
              <QrCode size={16} />
              {showQR ? 'Hide' : 'Show'} QR Code
            </Button>
          </div>

          {/* QR Code */}
          {showQR && ticket.qr_code && (
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <img
                src={ticket.qr_code}
                alt="Ticket QR Code"
                className="w-48 h-48"
              />
            </div>
          )}

          <Separator />

          {/* Event Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Event Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Event</p>
                  <p className="text-sm font-medium">{ticket.event_title}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TicketIcon size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Tier</p>
                  <p className="text-sm font-medium">{ticket.tier_name}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Buyer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Buyer Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{ticket.buyer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{ticket.buyer_email}</p>
                </div>
              </div>
              {ticket.buyer_phone && (
                <div className="flex items-start gap-2">
                  <User size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{ticket.buyer_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Purchase Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Purchase Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CreditCard size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-medium">${ticket.purchase_price}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Purchase Date</p>
                  <p className="text-sm font-medium">{formatDateTime(ticket.purchase_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Check-in Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Check-in Status</h3>
            {ticket.checked_in ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} weight="fill" />
                  <span className="font-medium">Checked In</span>
                </div>
                {ticket.checked_in_at && (
                  <p className="text-sm text-gray-600">
                    At: {formatDateTime(ticket.checked_in_at)}
                  </p>
                )}
                {ticket.checked_in_by_name && (
                  <p className="text-sm text-gray-600">
                    By: {ticket.checked_in_by_name}
                  </p>
                )}
                {ticket.checked_out && (
                  <>
                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                      <XCircle size={20} weight="fill" />
                      <span className="font-medium">Checked Out</span>
                    </div>
                    {ticket.checked_out_at && (
                      <p className="text-sm text-gray-600">
                        At: {formatDateTime(ticket.checked_out_at)}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle size={20} />
                <span>Not checked in</span>
              </div>
            )}
          </div>

          {ticket.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-900">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {ticket.notes}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <PermissionGuard permission={PERMISSIONS.TICKET_CHECKIN}>
              {!ticket.checked_in && ticket.status === 'valid' && (
                <Button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="flex-1"
                >
                  {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
                </Button>
              )}
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.TICKET_CHECKOUT}>
              {ticket.checked_in && !ticket.checked_out && (
                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {checkOutMutation.isPending ? 'Checking out...' : 'Check Out'}
                </Button>
              )}
            </PermissionGuard>

            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
