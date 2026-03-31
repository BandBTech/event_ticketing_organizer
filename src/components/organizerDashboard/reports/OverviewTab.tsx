"use client";

import {
  CurrencyDollarIcon,
  CalendarCheckIcon,
  TicketIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReport } from "@/hooks/useReports";
import { OverviewReportData } from "@/types/report";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { formatCurrency } from "@/lib/utils";

interface OverviewTabProps {
  startDate?: string;
  endDate?: string;
}

export function OverviewTab({ startDate, endDate }: OverviewTabProps) {
  const { data, isLoading } = useReport("overview", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as OverviewReportData | undefined;

  const stats = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" weight="duotone" />,
      label: "Total Revenue",
      value: formatCurrency(report?.total_revenue ?? 0),
      change: report?.revenue_change_pct,
      colorClass: "bg-green-100 text-green-600",
    },
    {
      icon: <CalendarCheckIcon className="w-6 h-6" weight="duotone" />,
      label: "Total Events",
      value: (report?.total_events ?? 0).toLocaleString(),
      change: report?.events_change_pct,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      icon: <TicketIcon className="w-6 h-6" weight="duotone" />,
      label: "Tickets Sold",
      value: (report?.tickets_sold ?? 0).toLocaleString(),
      change: report?.tickets_change_pct,
      colorClass: "bg-purple-100 text-purple-600",
    },
    {
      icon: <UsersIcon className="w-6 h-6" weight="duotone" />,
      label: "Total Attendees",
      value: (report?.total_attendees ?? 0).toLocaleString(),
      change: report?.attendees_change_pct,
      colorClass: "bg-orange-100 text-orange-600",
    },
  ];

  const revenueTrend = report?.revenue_trend ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            colorClass={stat.colorClass}
            isLoading={isLoading}
            index={i}
          />
        ))}
      </div>

      <ChartCard
        title="Revenue Over Time"
        isLoading={isLoading}
        isEmpty={!isLoading && revenueTrend.length === 0}
      >
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
