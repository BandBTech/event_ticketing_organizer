"use client";

import { motion } from "framer-motion";
import {
  TicketIcon,
  CurrencyDollarIcon,
  TrendUpIcon,
  ChartBarIcon,
  WalletIcon,
  CreditCardIcon,
  PresentationChartIcon,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/useReports";
import { ChartCard } from "./ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";

interface SalesTabProps {
  startDate?: string;
  endDate?: string;
}

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

const GATEWAY_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export function SalesTab({ startDate, endDate }: SalesTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { currency } = useCurrencyStore();
  const { data, isLoading } = useReport("sales", {
    start_date: startDate,
    end_date: endDate,
  });

  // Type the API response
  const report = data as
    | {
        summary_metrics?: {
          total_revenue?: number;
          total_commission?: number;
          organizer_share?: number;
          total_tickets_sold?: number;
          active_events?: number;
          total_events?: number;
          total_transactions?: number;
          completed_transactions?: number;
          pending_transactions?: number;
          failed_transactions?: number;
          average_order_value?: number;
          conversion_rate?: number;
        };
        daily_sales?: Array<{
          date: string;
          revenue: number;
          tickets_sold: number;
          transactions: number;
          average_order_value: number;
        }> | null;
        top_product_events?: Array<{
          event_id: string;
          event_name: string;
          revenue: number;
          tickets_sold: number;
        }> | null;
        sales_by_payment_gateway?: Array<{
          gateway_name: string;
          total_transactions: number;
          total_revenue: number;
          percentage_of_total: number;
          status: string;
        }>;
      }
    | undefined;

  const summary = report?.summary_metrics;
  const dailySales = report?.daily_sales ?? [];
  const paymentGateways = report?.sales_by_payment_gateway ?? [];
  const topProductEvents = report?.top_product_events ?? [];

  // Primary stats
  const primaryStats = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.sales.totalRevenue", "Total Revenue"),
      value: formatCurrency(summary?.total_revenue ?? 0),
      subValue: summary?.organizer_share
        ? `${t("reports.sales.organizerShare", "Your Share")}: ${formatCurrency(summary.organizer_share)}`
        : undefined,
      colorClass: "bg-green-100 text-green-600",
    },
    {
      icon: <TicketIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.sales.totalTicketsSold", "Total Tickets Sold"),
      value: (summary?.total_tickets_sold ?? 0).toLocaleString(),
      subValue: summary?.total_events
        ? `${t("reports.sales.acrossEvents", "Across")} ${summary.total_events.toLocaleString()} ${t("reports.sales.events", "events")}`
        : undefined,
      colorClass: "bg-purple-100 text-purple-600",
    },
    {
      icon: <TrendUpIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.sales.averageOrderValue", "Avg. Order Value"),
      value: formatCurrency(summary?.average_order_value ?? 0),
      subValue: summary?.total_transactions
        ? `${summary.total_transactions.toLocaleString()} ${t("reports.sales.transactions", "transactions")}`
        : undefined,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.sales.conversionRate", "Conversion Rate"),
      value: `${(summary?.conversion_rate ?? 0).toFixed(1)}%`,
      subValue: undefined,
      colorClass: "bg-orange-100 text-orange-600",
    },
  ];

  // Secondary stats
  const secondaryStats = [
    {
      icon: <WalletIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.sales.totalCommission", "Total Commission"),
      value: formatCurrency(summary?.total_commission ?? 0),
    },
    {
      icon: <PresentationChartIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.sales.organizerShare", "Organizer Share"),
      value: formatCurrency(summary?.organizer_share ?? 0),
    },
    {
      icon: <CreditCardIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.sales.completedTransactions", "Completed"),
      value: (summary?.completed_transactions ?? 0).toLocaleString(),
    },
  ];

  // Format daily sales data for charts
  const dailySalesChartData = dailySales.map((day) => ({
    date: new Date(day.date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
    revenue: day.revenue,
    tickets: day.tickets_sold,
    transactions: day.transactions,
  }));

  // Payment gateway data for pie chart
  const gatewayChartData = paymentGateways.map((gw, i) => ({
    name: gw.gateway_name.charAt(0).toUpperCase() + gw.gateway_name.slice(1),
    value: gw.total_revenue,
    percentage: gw.percentage_of_total,
    color: GATEWAY_COLORS[i % GATEWAY_COLORS.length],
  }));

  const hasAnyData =
    !isLoading &&
    ((summary?.total_revenue ?? 0) > 0 ||
      (summary?.total_tickets_sold ?? 0) > 0);

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
            {t("reports.sales.noDataTitle", "No Sales Data Available")}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t(
              "reports.sales.noDataDescription",
              "Sales data will appear here once tickets are sold for your events.",
            )}
          </p>
        </div>
      )}

      {/* Primary Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.sales.keyMetrics", "Key Metrics")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-4 gap-4">
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

      {/* Secondary Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.sales.financialBreakdown", "Financial Breakdown")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 gap-4">
            {secondaryStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    {stat.icon}
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20 mb-1" />
                    ) : (
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    )}
                    {isLoading ? (
                      <Skeleton className="h-7 w-24" />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {dailySalesChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <ChartCard
            title={t("reports.sales.dailyRevenue", "Daily Revenue")}
            isLoading={isLoading}
            isEmpty={!isLoading && dailySalesChartData.length === 0}
          >
            <ChartContainer
              config={{
                revenue: {
                  label: t("reports.sales.columns.revenue", "Revenue"),
                  color: "#6366f1",
                },
              }}
              className="h-64 sm:h-72"
            >
              <BarChart
                data={dailySalesChartData}
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
                      formatter={(value, name) => {
                        if (name === "revenue") {
                          return [
                            formatCurrency(Number(value)),
                            t("reports.sales.columns.revenue", "Revenue"),
                          ];
                        }
                        return [value, name];
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          {/* Tickets Over Time */}
          <ChartCard
            title={t("reports.sales.dailyTicketsSold", "Daily Tickets Sold")}
            isLoading={isLoading}
            isEmpty={!isLoading && dailySalesChartData.length === 0}
          >
            <ChartContainer
              config={{
                tickets: {
                  label: t("reports.sales.columns.tickets", "Tickets"),
                  color: "#10b981",
                },
              }}
              className="h-64 sm:h-72"
            >
              <LineChart
                data={dailySalesChartData}
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
                        t("reports.sales.columns.tickets", "Tickets"),
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-tickets)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </ChartCard>
        </div>
      )}

      {/* Payment Gateway Breakdown */}
      {gatewayChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gateway Pie Chart */}
          <ChartCard
            title={t(
              "reports.sales.paymentGatewayBreakdown",
              "Payment Gateway Breakdown",
            )}
            isLoading={isLoading}
            isEmpty={!isLoading && gatewayChartData.length === 0}
          >
            <ChartContainer
              config={Object.fromEntries(
                gatewayChartData.map((gw) => [
                  gw.name,
                  {
                    label: gw.name,
                    color: gw.color,
                  },
                ]),
              )}
              className="h-64 sm:h-72"
            >
              <PieChart>
                <Pie
                  data={gatewayChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="40%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {gatewayChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--color-${entry.name})`}
                      className="transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-white shadow-lg border border-gray-100 rounded-xl"
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </ChartCard>

          {/* Gateway Table */}
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("reports.sales.gatewayDetails", "Gateway Details")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.gateway", "Gateway")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.transactions", "Transactions")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.revenue", "Revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentGateways.map((gw, i) => (
                    <tr
                      key={gw.gateway_name}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                GATEWAY_COLORS[i % GATEWAY_COLORS.length],
                            }}
                          />
                          <span className="text-gray-900 capitalize">
                            {gw.gateway_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              gw.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {gw.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {gw.total_transactions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(gw.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Product Events (if available) */}
      {topProductEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.sales.topProductEvents", "Top Product Events")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.event", "Event")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.ticketsSold", "Tickets Sold")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.sales.columns.revenue", "Revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProductEvents.slice(0, 5).map((event, i) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
