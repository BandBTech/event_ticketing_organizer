"use client";

import { TicketIcon, CurrencyDollarIcon, TrendUpIcon } from "@phosphor-icons/react";
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
import { SalesReportData } from "@/types/report";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface SalesTabProps {
  startDate?: string;
  endDate?: string;
}

export function SalesTab({ startDate, endDate }: SalesTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { data, isLoading } = useReport("sales", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as SalesReportData | undefined;
  const salesByEvent = report?.sales_by_event ?? [];
  const salesOverTime = report?.sales_over_time ?? [];
  const topEvents = report?.top_selling_events ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={<CurrencyDollarIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.sales.totalSales", "Total Sales")}
          value={formatCurrency(report?.total_sales ?? 0)}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          icon={<TicketIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.sales.totalTicketsSold", "Total Tickets Sold")}
          value={(report?.total_tickets ?? 0).toLocaleString()}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          index={1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("reports.sales.salesByEvent", "Sales by Event")}
          isLoading={isLoading}
          isEmpty={!isLoading && salesByEvent.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={salesByEvent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="event_name"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), t("reports.sales.columns.revenue", "Revenue")]}
              />
              <Bar dataKey="total_sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("reports.sales.salesOverTime", "Sales Over Time")}
          isLoading={isLoading}
          isEmpty={!isLoading && salesOverTime.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), t("reports.sales.columns.revenue", "Revenue")]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.sales.topSellingEvents", "Top Selling Events")}</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : topEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <TrendUpIcon className="w-10 h-10 mb-2" weight="duotone" />
            <p className="text-sm">{t("reports.sales.noSalesData", "No sales data available")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">{t("reports.sales.columns.event", "Event")}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{t("reports.sales.columns.ticketsSold", "Tickets Sold")}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{t("reports.sales.columns.revenue", "Revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event, i) => (
                  <tr key={event.event_id ?? i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-900">{event.event_name}</td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {event.tickets_sold.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {formatCurrency(event.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
