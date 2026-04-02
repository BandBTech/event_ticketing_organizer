"use client";

import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  CalendarCheckIcon,
  TicketIcon,
  UsersIcon,
  WalletIcon,
  TrendUpIcon,
  PresentationChartIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ClockIcon,
  StarIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/useReports";
import { OverviewReportData } from "@/types/report";
import { ChartCard } from "./ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";

interface OverviewTabProps {
  startDate?: string;
  endDate?: string;
}

const EVENT_STATUS_COLORS = {
  draft: "#6b7280",
  pending: "#f59e0b",
  approved: "#3b82f6",
  rejected: "#ef4444",
  "on-sale": "#10b981",
  live: "#8b5cf6",
  completed: "#059669",
  cancelled: "#dc2626",
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  colorClass: string;
  isLoading: boolean;
  index: number;
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  colorClass,
  isLoading,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </>
      )}
    </motion.div>
  );
}

interface FinancialCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  alert?: boolean;
  isLoading: boolean;
}

function FinancialCard({
  icon,
  label,
  value,
  description,
  alert,
  isLoading,
}: FinancialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className={`@container/card p-2.5 rounded-2xl glass-card-lowest transition-all ${
        alert ? "border-amber-200" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${alert ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-20 mb-1" />
          ) : (
            <p className="text-sm text-gray-500 truncate">{label}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-7 w-24 mb-1" />
          ) : (
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          )}
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        {alert && (
          <ClockIcon
            className="w-5 h-5 text-amber-500 flex-shrink-0"
            weight="duotone"
          />
        )}
      </div>
    </motion.div>
  );
}

export function OverviewTab({ startDate, endDate }: OverviewTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { currency } = useCurrencyStore();
  const { data, isLoading } = useReport("overview", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as OverviewReportData | undefined;
  const summary = report?.summary_metrics;
  const eventsStats = report?.events_statistics;
  const topEvents = report?.top_performing_events ?? [];
  const recentTransactions = report?.recent_transactions ?? [];
  const revenueTrend = report?.revenue_trend ?? [];
  const ticketSalesTrend = report?.ticket_sales_trend ?? [];

  // Calculate derived metrics
  const hasAnyData =
    !isLoading &&
    ((summary?.total_events ?? 0) > 0 ||
      (summary?.total_tickets_sold ?? 0) > 0 ||
      (summary?.total_revenue ?? 0) > 0);

  const completionRate =
    summary?.total_events && summary?.total_events > 0
      ? (
          ((eventsStats?.completed_events ?? 0) / summary.total_events) *
          100
        ).toFixed(1)
      : "0";

  const rejectionRate =
    summary?.total_events && summary?.total_events > 0
      ? (
          ((eventsStats?.rejected_events ?? 0) / summary.total_events) *
          100
        ).toFixed(1)
      : "0";

  // Primary KPIs
  const primaryStats = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.overview.totalRevenue", "Total Revenue"),
      value: formatCurrency(summary?.total_revenue ?? 0),
      subValue:
        summary?.net_revenue !== undefined &&
        summary.net_revenue !== summary?.total_revenue
          ? `${t("reports.overview.net", "Net")}: ${formatCurrency(summary.net_revenue)}`
          : undefined,
      colorClass: "bg-green-100 text-green-600",
    },
    {
      icon: <TicketIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.overview.ticketsSold", "Tickets Sold"),
      value: (summary?.total_tickets_sold ?? 0).toLocaleString(),
      subValue: summary?.average_tickets_per_event
        ? `${t("reports.overview.avgPerEvent", "Avg")}: ${summary.average_tickets_per_event.toLocaleString()}`
        : undefined,
      colorClass: "bg-purple-100 text-purple-600",
    },
    {
      icon: <CalendarCheckIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.overview.activeEvents", "Active Events"),
      value: (summary?.active_events ?? 0).toLocaleString(),
      subValue: `${t("reports.overview.ofTotal", "of")} ${(summary?.total_events ?? 0).toLocaleString()} ${t("reports.overview.total", "total")}`,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      icon: <UsersIcon className="w-6 h-6" weight="duotone" />,
      label: t(
        "reports.overview.completedTransactions",
        "Completed Transactions",
      ),
      value: (summary?.completed_transactions ?? 0).toLocaleString(),
      subValue: `${t("reports.overview.ofTotal", "of")} ${(summary?.total_transactions ?? 0).toLocaleString()}`,
      colorClass: "bg-orange-100 text-orange-600",
    },
  ];

  // Financial summary cards
  const financialStats = [
    {
      icon: <WalletIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.overview.pendingPayouts", "Pending Payouts"),
      value: formatCurrency(summary?.pending_payouts ?? 0),
      description: t(
        "reports.overview.awaitingWithdrawal",
        "Awaiting withdrawal",
      ),
      alert: (summary?.pending_payouts ?? 0) > 0,
    },
    {
      icon: <TrendUpIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.overview.netEarnings", "Net Earnings"),
      value: formatCurrency(summary?.net_earnings ?? 0),
      description: t("reports.overview.afterFees", "After platform fees"),
    },
    {
      icon: <ArrowDownRightIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.overview.totalRefunds", "Total Refunds"),
      value: formatCurrency(summary?.total_refunds ?? 0),
      description: t("reports.overview.processedRefunds", "Processed refunds"),
    },
    {
      icon: <PresentationChartIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.overview.conversionRate", "Conversion Rate"),
      value: `${((summary?.conversion_rate ?? 0) * 100).toFixed(1)}%`,
      description: t("reports.overview.visitorToBuyer", "Visitor to buyer"),
    },
  ];

  // Event status breakdown data
  const eventsStatusData = eventsStats
    ? [
        {
          name: t("events.status.draft", "Draft"),
          value: eventsStats.draft_events ?? 0,
          color: EVENT_STATUS_COLORS.draft,
        },
        {
          name: t("events.status.pending", "Pending"),
          value: eventsStats.pending_events ?? 0,
          color: EVENT_STATUS_COLORS.pending,
        },
        {
          name: t("events.status.approved", "Approved"),
          value: eventsStats.approved_events ?? 0,
          color: EVENT_STATUS_COLORS.approved,
        },
        {
          name: t("events.status.onSale", "On Sale"),
          value: eventsStats.on_sale_events ?? 0,
          color: EVENT_STATUS_COLORS["on-sale"],
        },
        {
          name: t("events.status.live", "Live"),
          value: eventsStats.live_events ?? 0,
          color: EVENT_STATUS_COLORS.live,
        },
        {
          name: t("events.status.completed", "Completed"),
          value: eventsStats.completed_events ?? 0,
          color: EVENT_STATUS_COLORS.completed,
        },
        {
          name: t("events.status.cancelled", "Cancelled"),
          value: eventsStats.cancelled_events ?? 0,
          color: EVENT_STATUS_COLORS.cancelled,
        },
        {
          name: t("events.status.rejected", "Rejected"),
          value: eventsStats.rejected_events ?? 0,
          color: EVENT_STATUS_COLORS.rejected,
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {!isLoading && !hasAnyData && (
        <div className="glass-card-lowest rounded-2xl p-8 text-center">
          <PresentationChartIcon
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            weight="duotone"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("reports.overview.noDataTitle", "No Data Available Yet")}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t(
              "reports.overview.noDataDescription",
              "Start creating and selling events to see your performance metrics and analytics here.",
            )}
          </p>
        </div>
      )}

      {/* Primary KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.overview.keyMetrics", "Key Metrics")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4 gap-4">
            {primaryStats.map((stat, i) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                subValue={stat.subValue}
                colorClass={stat.colorClass}
                isLoading={isLoading}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.overview.financialOverview", "Financial Overview")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-4 gap-4">
            {financialStats.map((stat, i) => (
              <FinancialCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                description={stat.description}
                alert={stat.alert}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {(revenueTrend.length > 0 || ticketSalesTrend.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <ChartCard
            title={t("reports.overview.revenueOverTime", "Revenue Over Time")}
            isLoading={isLoading}
            isEmpty={!isLoading && revenueTrend.length === 0}
          >
            <ChartContainer
              config={{
                revenue: {
                  label: t("reports.financial.revenue", "Revenue"),
                  color: "#6366f1",
                },
              }}
              className="h-64 sm:h-72 w-full"
            >
              <LineChart
                data={revenueTrend}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-white shadow-lg border border-gray-100 rounded-xl"
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        t("reports.financial.revenue", "Revenue"),
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          {/* Ticket Sales Trend Chart */}
          <ChartCard
            title={t(
              "reports.overview.ticketSalesOverTime",
              "Ticket Sales Over Time",
            )}
            isLoading={isLoading}
            isEmpty={!isLoading && ticketSalesTrend.length === 0}
          >
            <ChartContainer
              config={{
                tickets: {
                  label: t("reports.overview.tickets", "Tickets"),
                  color: "#10b981",
                },
              }}
              className="h-64 sm:h-72 w-full"
            >
              <LineChart
                data={ticketSalesTrend}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-white shadow-lg border border-gray-100 rounded-xl"
                      formatter={(value) => [
                        Number(value).toLocaleString(),
                        t("reports.overview.tickets", "Tickets"),
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-tickets)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </ChartCard>
        </div>
      )}

      {/* Events Status Breakdown */}
      {eventsStatusData.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.overview.eventsByStatus", "Events by Status")}
          </h2>
          <div className="glass-card-lowest rounded-2xl p-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {eventsStats?.total_events ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  {t("reports.overview.totalEvents", "Total Events")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {completionRate}%
                </p>
                <p className="text-xs text-gray-500">
                  {t("reports.overview.completionRate", "Completion Rate")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {rejectionRate}%
                </p>
                <p className="text-xs text-gray-500">
                  {t("reports.overview.rejectionRate", "Rejection Rate")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {eventsStats?.pending_events ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  {t("reports.overview.pendingReview", "Pending Review")}
                </p>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {eventsStatusData.map((item) => (
                <div key={item.name} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500">{item.name}</p>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            <div className="mt-6 flex h-3 rounded-full overflow-hidden bg-gray-100">
              {eventsStatusData.map((item) => {
                const percentage = eventsStats?.total_events
                  ? (item.value / eventsStats.total_events) * 100
                  : 0;
                return (
                  <div
                    key={item.name}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.name}: ${item.value} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Events */}
      {topEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-amber-500" weight="fill" />
            {t("reports.overview.topPerformingEvents", "Top Performing Events")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.overview.columns.event", "Event")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.overview.columns.ticketsSold",
                        "Tickets Sold",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.overview.columns.revenue", "Revenue")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">
                      {t("reports.overview.columns.avgPrice", "Avg. Price")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topEvents.slice(0, 5).map((event, i) => (
                    <tr
                      key={event.event_id ?? i}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {event.event_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {event.tickets_sold.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(event.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">
                        {event.tickets_sold > 0
                          ? formatCurrency(event.revenue / event.tickets_sold)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-gray-500" weight="duotone" />
            {t("reports.overview.recentTransactions", "Recent Transactions")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentTransactions.slice(0, 5).map((transaction, i) => {
                const isRefund = (transaction.status as string) === "refunded";
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isRefund ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                      >
                        {isRefund ? (
                          <ArrowDownRightIcon
                            className="w-5 h-5"
                            weight="duotone"
                          />
                        ) : (
                          <ArrowUpRightIcon
                            className="w-5 h-5"
                            weight="duotone"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(transaction.event_name as string) ??
                            t("reports.overview.unknownEvent", "Unknown Event")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(transaction.created_at as string) ?? ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${isRefund ? "text-red-600" : "text-green-600"}`}
                    >
                      {isRefund ? "-" : "+"}
                      {formatCurrency((transaction.amount as number) ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
