import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEventTickets, useTicketStats } from '@/hooks/useTickets';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, MagnifyingGlass, Download } from '@phosphor-icons/react';
import TicketStatsCards from '@/components/staffDashboard/TicketStatsCards';
import TicketTable from '@/components/staffDashboard/TicketTable';
import TicketScanner from '@/components/staffDashboard/TicketScanner';
import StaffDashboardLayout from '@/components/layout/StaffDashboardLayout';

export default function EventTicketsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = typeof id === 'string' ? id : '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);

  // Fetch tickets and stats
  const { data: stats, isLoading: statsLoading } = useTicketStats(eventId);
  const { data: ticketsData, isLoading: ticketsLoading } = useEventTickets(eventId, {
    page,
    limit: 20,
    search: search || undefined,
    status: (statusFilter !== 'all' ? statusFilter : undefined) as 'valid' | 'used' | 'cancelled' | 'expired' | 'refunded' | undefined,
  });

  const tickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination;

  return (
    <>
      <Head>
        <title>Ticket Management | Staff Dashboard</title>
      </Head>
      <StaffDashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.event_title || 'Loading...'}
              </p>
            </div>

            <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
              <Button onClick={() => setShowScanner(true)} className="gap-2">
                <QrCode size={20} />
                Scan Ticket
              </Button>
            </PermissionGuard>
          </div>

          {/* Stats Cards */}
          <TicketStatsCards stats={stats} isLoading={statsLoading} />

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by ticket number or buyer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download size={20} />
              Export
            </Button>
          </div>

          {/* Tickets Table */}
          <TicketTable
            tickets={tickets}
            isLoading={ticketsLoading}
            pagination={pagination}
            onPageChange={setPage}
            eventId={eventId}
          />

          {/* Scanner Modal */}
          {showScanner && (
            <TicketScanner
              isOpen={showScanner}
              onClose={() => setShowScanner(false)}
              eventId={eventId}
            />
          )}
        </div>
      </StaffDashboardLayout>
    </>
  );
}
