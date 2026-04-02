"use client";

import { motion } from "framer-motion";
import {
  CalendarCheckIcon,
  TicketIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PresentationChartIcon,
  TrendUpIcon,
  ClockIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
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

interface EventPerformanceTabProps {
  startDate?: string;
  endDate?: string;
  eventId?: string;
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

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
}

function InfoCard({ icon, label, value, isLoading }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="@container/card p-3 rounded-2xl glass-card-lowest transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">{icon}</div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-5 w-20 mb-1" />
          ) : (
            <p className="text-sm text-gray-500">{label}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <p className="text-base font-medium text-gray-900 truncate">
              {value}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const TIER_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

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

  // Type the API response based on the actual structure
  const report = data as
    | {
        event_id?: string;
        event_title?: string;
        banner_image?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        capacity?: number;
        tickets_sold?: number;
        sold_percentage?: number;
        revenue?: number;
        commission?: number;
        organizer_earnings?: number;
        average_ticket_price?: number;
        total_transactions?: number;
        top_tier?: {
          tier_id: string;
          tier_name: string;
          ticket_price: number;
          ticket_capacity: number;
          tickets_sold: number;
          sold_percentage: number;
          revenue: number;
        };
        tier_performance?: Array<{
          tier_id: string;
          tier_name: string;
          ticket_price: number;
          ticket_capacity: number;
          tickets_sold: number;
          sold_percentage: number;
          revenue: number;
        }> | null;
      }
    | undefined;

  const tierPerformance = report?.tier_performance ?? [];
  const topTier = report?.top_tier;

  // Format tier data for chart
  const tierChartData = tierPerformance.map((tier, i) => ({
    name:
      tier.tier_name.length > 15
        ? tier.tier_name.substring(0, 15) + "..."
        : tier.tier_name,
    sold: tier.tickets_sold,
    capacity: tier.ticket_capacity,
    revenue: tier.revenue,
    percentage: tier.sold_percentage,
    color: TIER_COLORS[i % TIER_COLORS.length],
  }));

  // Status color mapping
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "live":
        return "bg-blue-100 text-blue-700";
      case "on-sale":
        return "bg-indigo-100 text-indigo-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const hasAnyData = !isLoading && report && (report?.tickets_sold ?? 0) > 0;

  if (!eventId) {
    return (
      <div className="glass-card-lowest rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400">
        <CalendarCheckIcon className="w-14 h-14 mb-3" weight="duotone" />
        <p className="text-lg font-medium text-gray-600">
          {t("reports.eventPerformance.selectEventMessage", "Select an Event")}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {t(
            "reports.eventPerformance.selectEventDescription",
            "Choose an event from the filter above to view its performance report",
          )}
        </p>
      </div>
    );
  }

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
            {t(
              "reports.eventPerformance.noDataTitle",
              "No Performance Data Available",
            )}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t(
              "reports.eventPerformance.noDataDescription",
              "Performance data will appear here once tickets start selling for this event.",
            )}
          </p>
        </div>
      )}

      {/* Event Header */}
      {report && (
        <div className="glass-card-lowest rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {report.banner_image && (
                <img
                  src={report.banner_image}
                  alt={report.event_title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-80 mb-2" />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">
                    {report.event_title}
                  </h2>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status?.replace("-", " ")}
                    </span>
                  )}
                  {!isLoading && report.start_date && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarIcon className="w-3.5 h-3.5" weight="duotone" />
                      <span>
                        {new Date(report.start_date).toLocaleDateString(
                          locale,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                  {!isLoading && report.end_date && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5" weight="duotone" />
                      <span>
                        {new Date(report.end_date).toLocaleTimeString(locale, {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.eventPerformance.keyMetrics", "Key Metrics")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
            <StatCard
              icon={<TicketIcon className="w-6 h-6" weight="duotone" />}
              label={t("reports.eventPerformance.ticketsSold", "Tickets Sold")}
              value={`${(report?.tickets_sold ?? 0).toLocaleString()} / ${(report?.capacity ?? 0).toLocaleString()}`}
              subValue={`${(report?.sold_percentage ?? 0).toFixed(1)}% ${t("reports.eventPerformance.sold", "sold")}`}
              colorClass="bg-purple-100 text-purple-600"
              isLoading={isLoading}
              index={0}
            />
            <StatCard
              icon={<TicketIcon className="w-6 h-6" weight="duotone" />}
              label={t(
                "reports.eventPerformance.ticketsRemaining",
                "Tickets Remaining",
              )}
              value={(
                (report?.capacity ?? 0) - (report?.tickets_sold ?? 0)
              ).toLocaleString()}
              colorClass="bg-orange-100 text-orange-600"
              isLoading={isLoading}
              index={1}
            />
            <StatCard
              icon={<CurrencyDollarIcon className="w-6 h-6" weight="duotone" />}
              label={t("reports.eventPerformance.revenue", "Revenue")}
              value={formatCurrency(report?.revenue ?? 0)}
              subValue={
                report?.organizer_earnings
                  ? `${t("reports.eventPerformance.net", "Net")}: ${formatCurrency(report.organizer_earnings)}`
                  : undefined
              }
              colorClass="bg-green-100 text-green-600"
              isLoading={isLoading}
              index={2}
            />
            <StatCard
              icon={<TrendUpIcon className="w-6 h-6" weight="duotone" />}
              label={t(
                "reports.eventPerformance.avgTicketPrice",
                "Avg. Ticket Price",
              )}
              value={formatCurrency(report?.average_ticket_price ?? 0)}
              subValue={
                report?.total_transactions
                  ? `${report.total_transactions.toLocaleString()} ${t("reports.eventPerformance.transactions", "transactions")}`
                  : undefined
              }
              colorClass="bg-blue-100 text-blue-600"
              isLoading={isLoading}
              index={3}
            />
          </div>
        </div>
      </div>

      {/* Event Info Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.eventPerformance.eventDetails", "Event Details")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
            <InfoCard
              icon={<CalendarIcon className="w-5 h-5" weight="duotone" />}
              label={t("reports.eventPerformance.eventDate", "Event Date")}
              value={
                report?.start_date
                  ? new Date(report.start_date).toLocaleDateString(locale, {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"
              }
              isLoading={isLoading}
            />
            <InfoCard
              icon={<ClockIcon className="w-5 h-5" weight="duotone" />}
              label={t("reports.eventPerformance.duration", "Duration")}
              value={
                report?.start_date && report?.end_date
                  ? `${Math.round((new Date(report.end_date).getTime() - new Date(report.start_date).getTime()) / (1000 * 60 * 60))}h`
                  : "-"
              }
              isLoading={isLoading}
            />
            <InfoCard
              icon={<UsersIcon className="w-5 h-5" weight="duotone" />}
              label={t("reports.eventPerformance.capacity", "Capacity")}
              value={(report?.capacity ?? 0).toLocaleString()}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Top Performing Tier */}
      {topTier && topTier.tickets_sold > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendUpIcon className="w-5 h-5 text-amber-500" weight="fill" />
            {t(
              "reports.eventPerformance.topPerformingTier",
              "Top Performing Tier",
            )}
          </h2>
          <div className="glass-card-lowest rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <TicketIcon className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {topTier.tier_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(topTier.ticket_price)} /{" "}
                    {t("reports.eventPerformance.ticket", "ticket")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {topTier.tickets_sold.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("reports.eventPerformance.sold", "Sold")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {topTier.sold_percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("reports.eventPerformance.fillRate", "Fill Rate")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(topTier.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("reports.eventPerformance.revenue", "Revenue")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier Performance Chart */}
      {tierChartData.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.eventPerformance.tierPerformance", "Tier Performance")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier Sales Bar Chart */}
            <ChartCard
              title={t(
                "reports.eventPerformance.ticketsByTier",
                "Tickets by Tier",
              )}
              isLoading={isLoading}
              isEmpty={!isLoading && tierChartData.length === 0}
            >
              <ChartContainer
                config={{
                  sold: {
                    label: t("reports.eventPerformance.sold", "Sold"),
                    color: "#6366f1",
                  },
                  capacity: {
                    label: t("reports.eventPerformance.capacity", "Capacity"),
                    color: "#e0e7ff",
                  },
                }}
                className="h-72"
              >
                <BarChart
                  data={tierChartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-white shadow-lg border border-gray-100 rounded-xl"
                        formatter={(value, name) => {
                          if (name === "sold") {
                            return [
                              Number(value).toLocaleString(),
                              t("reports.eventPerformance.sold", "Sold"),
                            ];
                          }
                          if (name === "capacity") {
                            return [
                              Number(value).toLocaleString(),
                              t(
                                "reports.eventPerformance.capacity",
                                "Capacity",
                              ),
                            ];
                          }
                          return [value, name];
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="sold"
                    name={t("reports.eventPerformance.sold", "Sold")}
                    fill="var(--color-sold)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="capacity"
                    name={t("reports.eventPerformance.capacity", "Capacity")}
                    fill="var(--color-capacity)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            {/* Tier Revenue Pie Chart */}
            <ChartCard
              title={t(
                "reports.eventPerformance.revenueByTier",
                "Revenue by Tier",
              )}
              isLoading={isLoading}
              isEmpty={
                !isLoading &&
                tierChartData.filter((t) => t.revenue > 0).length === 0
              }
            >
              <ChartContainer
                config={Object.fromEntries(
                  tierChartData
                    .filter((t) => t.revenue > 0)
                    .map((tier) => [
                      tier.name,
                      {
                        label: tier.name,
                        color: tier.color,
                      },
                    ]),
                )}
                className="h-72"
              >
                <PieChart>
                  <Pie
                    data={tierChartData.filter((t) => t.revenue > 0)}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {tierChartData
                      .filter((t) => t.revenue > 0)
                      .map((entry, index) => (
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
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Tier Performance Table */}
      {tierPerformance.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.eventPerformance.tierBreakdown", "Tier Breakdown")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.eventPerformance.columns.tier", "Tier")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.eventPerformance.columns.price", "Price")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.eventPerformance.columns.sold", "Sold")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.eventPerformance.columns.capacity",
                        "Capacity",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.eventPerformance.columns.fillRate",
                        "Fill Rate",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.eventPerformance.columns.revenue", "Revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tierPerformance.map((tier, i) => (
                    <tr
                      key={tier.tier_id ?? i}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                TIER_COLORS[i % TIER_COLORS.length],
                            }}
                          />
                          <span className="text-gray-900 font-medium">
                            {tier.tier_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(tier.ticket_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {tier.tickets_sold.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {tier.ticket_capacity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${tier.sold_percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-700 text-xs">
                            {tier.sold_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(tier.revenue)}
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
