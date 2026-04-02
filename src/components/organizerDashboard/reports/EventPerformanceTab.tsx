"use client";

import {
  CalendarCheckIcon,
  TicketIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReport } from "@/hooks/useReports";
import { EventPerformanceData } from "@/types/report";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";

interface EventPerformanceTabProps {
  startDate?: string;
  endDate?: string;
  eventId?: string;
}

export function EventPerformanceTab({
  startDate,
  endDate,
  eventId,
}: EventPerformanceTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { currency } = useCurrencyStore();
  const { data, isLoading } = useReport("event-performance", {
    start_date: startDate,
    end_date: endDate,
    event_id: eventId,
    enabled: !!eventId,
  });

  const report = data as EventPerformanceData | undefined;
  const ticketSalesOverTime = report?.ticket_sales_over_time ?? [];
  const tierBreakdown = report?.tier_breakdown ?? [];

  if (!eventId) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
        <CalendarCheckIcon className="w-14 h-14 mb-3" weight="duotone" />
        <p className="text-lg font-medium text-gray-600">{t("reports.eventPerformance.selectEventMessage", "Select an Event")}</p>
        <p className="text-sm mt-1">{t("reports.eventPerformance.selectEventDescription", "Choose an event from the filter above to view its performance report")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {report?.event_title && (
        <h2 className="text-xl font-semibold text-gray-900">{report.event_title}</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TicketIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.eventPerformance.ticketsSold", "Tickets Sold")}
          value={`${(report?.tickets_sold ?? 0).toLocaleString()} / ${(report?.total_tickets ?? 0).toLocaleString()}`}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          icon={<TicketIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.eventPerformance.ticketsRemaining", "Tickets Remaining")}
          value={(report?.tickets_remaining ?? 0).toLocaleString()}
          colorClass="bg-orange-100 text-orange-600"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          icon={<UsersIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.eventPerformance.attendanceRate", "Attendance Rate")}
          value={`${((report?.attendance_rate ?? 0) * 100).toFixed(1)}%`}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          index={2}
        />
        <StatCard
          icon={<CurrencyDollarIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.eventPerformance.revenue", "Revenue")}
          value={formatCurrency(report?.revenue ?? 0, currency, locale)}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("reports.eventPerformance.ticketSalesOverTime", "Ticket Sales Over Time")}
          isLoading={isLoading}
          isEmpty={!isLoading && ticketSalesOverTime.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={ticketSalesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sold"
                name={t("reports.eventPerformance.sold", "Sold")}
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("reports.eventPerformance.ticketsByTier", "Tickets by Tier")}
          isLoading={isLoading}
          isEmpty={!isLoading && tierBreakdown.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={tierBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tier_name" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="sold" name={t("reports.eventPerformance.sold", "Sold")} fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name={t("reports.eventPerformance.total", "Total")} fill="#e0e7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
