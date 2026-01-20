'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Users, CheckCircle, XCircle } from '@phosphor-icons/react';
import type { TicketStats } from '@/types/ticket';

interface TicketStatsCardsProps {
  stats: TicketStats | undefined;
  isLoading: boolean;
}

export default function TicketStatsCards({ stats, isLoading }: TicketStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Sold',
      value: stats?.tickets_sold || 0,
      total: stats?.total_tickets || 0,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Checked In',
      value: stats?.tickets_checked_in || 0,
      total: stats?.tickets_sold || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: stats?.check_in_rate ? `${stats.check_in_rate.toFixed(1)}%` : '0%',
    },
    {
      title: 'Remaining',
      value: stats?.tickets_remaining || 0,
      total: stats?.total_tickets || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: XCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isRevenue: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={card.color} size={24} />
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {card.isRevenue ? card.value : card.value.toLocaleString()}
            </p>
            
            {!card.isRevenue && card.total !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                of {card.total.toLocaleString()} {card.percentage && `(${card.percentage})`}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
