'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, Eye, XCircle } from '@phosphor-icons/react';
import { formatDateTime } from '@/lib/utils';
import { useCheckInTicket } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import TicketDetailsModal from './TicketDetailsModal';
import type { Ticket } from '@/types/ticket';

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
  eventId: string;
}

export default function TicketTable({
  tickets,
  isLoading,
  pagination,
  onPageChange,
  // eventId,
}: TicketTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const checkInMutation = useCheckInTicket();

  const handleQuickCheckIn = (ticket: Ticket) => {
    if (ticket.checked_in) return;

    checkInMutation.mutate({
      ticketId: ticket.id,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; className?: string }> = {
      valid: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      used: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      cancelled: { variant: 'destructive' },
      expired: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
      refunded: { variant: 'secondary', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
    };

    const config = variants[status] || variants.valid;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-gray-500">No tickets found</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedTicket(ticket)}
              >
                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{ticket.buyer_name}</p>
                    <p className="text-xs text-gray-500">{ticket.buyer_email}</p>
                  </div>
                </TableCell>
                <TableCell>{ticket.tier_name}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>
                  {ticket.checked_in ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} weight="fill" />
                      <span className="text-sm">
                        {ticket.checked_in_at ? formatDateTime(ticket.checked_in_at) : 'Yes'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400">
                      <XCircle size={16} />
                      <span className="text-sm">No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDateTime(ticket.purchase_date)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye size={16} />
                    </Button>

                    <PermissionGuard permission={PERMISSIONS.TICKET_CHECKIN}>
                      {!ticket.checked_in && ticket.status === 'valid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickCheckIn(ticket)}
                          disabled={checkInMutation.isPending}
                        >
                          Check In
                        </Button>
                      )}
                    </PermissionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {tickets.length} of {pagination.total} tickets
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}
