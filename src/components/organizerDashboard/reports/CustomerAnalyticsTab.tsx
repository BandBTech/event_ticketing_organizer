"use client";

import { motion } from "framer-motion";
import {
  UsersIcon,
  UserPlusIcon,
  ArrowsClockwiseIcon,
  TrendUpIcon,
  PresentationChartIcon,
  UserIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/useReports";
import { CustomerAnalyticsData } from "@/types/report";
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

interface CustomerAnalyticsTabProps {
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

const SEGMENT_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export function CustomerAnalyticsTab({
  startDate,
  endDate,
}: CustomerAnalyticsTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { currency } = useCurrencyStore();
  const { data, isLoading } = useReport("customer-analytics", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as CustomerAnalyticsData | undefined;

  const segments = report?.customer_segments ?? [];
  const retention = report?.customer_retention;
  const topCustomers = report?.top_customers ?? [];

  // Primary stats
  const primaryStats = [
    {
      icon: <UsersIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.customerAnalytics.totalCustomers", "Total Customers"),
      value: (report?.total_customers ?? 0).toLocaleString(),
      subValue: undefined,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      icon: <UserPlusIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.customerAnalytics.registeredUsers", "Registered Users"),
      value: (report?.registered_users ?? 0).toLocaleString(),
      subValue:
        report?.total_customers && report?.registered_users
          ? `${((report.registered_users / report.total_customers) * 100).toFixed(1)}% ${t("reports.customerAnalytics.ofTotal", "of total")}`
          : undefined,
      colorClass: "bg-green-100 text-green-600",
    },
    {
      icon: <ShoppingCartIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.customerAnalytics.guestPurchases", "Guest Purchases"),
      value: (report?.guest_purchases ?? 0).toLocaleString(),
      subValue:
        report?.total_customers && report?.guest_purchases
          ? `${((report.guest_purchases / report.total_customers) * 100).toFixed(1)}% ${t("reports.customerAnalytics.ofTotal", "of total")}`
          : undefined,
      colorClass: "bg-purple-100 text-purple-600",
    },
    {
      icon: <ArrowsClockwiseIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.customerAnalytics.repeatCustomers", "Repeat Customers"),
      value: (report?.repeat_customers ?? 0).toLocaleString(),
      subValue: undefined,
      colorClass: "bg-orange-100 text-orange-600",
    },
  ];

  // Retention stats
  const retentionStats = [
    {
      icon: <UserPlusIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.customerAnalytics.newCustomers", "New Customers"),
      value: (retention?.new_customers ?? 0).toLocaleString(),
    },
    {
      icon: <ArrowsClockwiseIcon className="w-5 h-5" weight="duotone" />,
      label: t(
        "reports.customerAnalytics.returningCustomers",
        "Returning Customers",
      ),
      value: (retention?.returning_customers ?? 0).toLocaleString(),
    },
    {
      icon: <TrendUpIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.customerAnalytics.retentionRate", "Retention Rate"),
      value: `${(retention?.retention_rate ?? 0).toFixed(1)}%`,
    },
  ];

  const getTranslatedSegmentName = (name: string) => {
    const key = name.toLowerCase().replace(" ", "_");
    return t(`reports.customerAnalytics.segments.${key}`, name);
  };

  // Segment data for pie chart
  const segmentChartData = segments.map((seg, i) => ({
    name: getTranslatedSegmentName(seg.segment_name),
    value: seg.customer_count,
    percentage: seg.percentage_of_total,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  // Segment data for bar chart
  const segmentBarData = segments.map((seg) => ({
    name: getTranslatedSegmentName(seg.segment_name),
    customers: seg.customer_count,
    totalSpent: seg.total_spent,
    averageSpent: seg.average_spent,
  }));

  const hasAnyData = !isLoading && (report?.total_customers ?? 0) > 0;

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
              "reports.customerAnalytics.noDataTitle",
              "No Customer Data Available",
            )}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t(
              "reports.customerAnalytics.noDataDescription",
              "Customer analytics will appear here once customers start purchasing tickets.",
            )}
          </p>
        </div>
      )}

      {/* Primary Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.customerAnalytics.keyMetrics", "Key Metrics")}
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

      {/* Average Order Value */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.customerAnalytics.orderAnalytics", "Order Analytics")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <TrendUpIcon className="w-5 h-5" weight="duotone" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-20 mb-1" />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t(
                        "reports.customerAnalytics.averageOrderValue",
                        "Average Order Value",
                      )}
                    </p>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(report?.average_order_value ?? 0, currency)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
            {retentionStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.08 }}
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

      {/* Customer Segments */}
      {segmentChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Pie Chart */}
          <ChartCard
            title={t(
              "reports.customerAnalytics.customerSegments",
              "Customer Segments",
            )}
            isLoading={isLoading}
            isEmpty={!isLoading && segmentChartData.length === 0}
          >
            <ChartContainer
              config={Object.fromEntries(
                segmentChartData.map((seg) => [
                  seg.name,
                  {
                    label: seg.name,
                    color: seg.color,
                  },
                ]),
              )}
              className="h-64 sm:h-72 w-full"
            >
              <PieChart>
                <Pie
                  data={segmentChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="40%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {segmentChartData.map((entry, index) => (
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
                      formatter={(value) => [
                        `${Number(value)} ${t("reports.customerAnalytics.customers", "customers")}`,
                        t("reports.customerAnalytics.count", "Count"),
                      ]}
                    />
                  }
                />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </ChartCard>

          {/* Segment Bar Chart */}
          <ChartCard
            title={t(
              "reports.customerAnalytics.segmentSpending",
              "Segment Spending",
            )}
            isLoading={isLoading}
            isEmpty={!isLoading && segmentBarData.length === 0}
          >
            <ChartContainer
              config={{
                totalSpent: {
                  label: t(
                    "reports.customerAnalytics.totalSpent",
                    "Total Spent",
                  ),
                  color: "#6366f1",
                },
              }}
              className="h-64 sm:h-72 w-full"
            >
              <BarChart
                data={segmentBarData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
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
                        if (name === "totalSpent") {
                          return [
                            formatCurrency(Number(value), currency),
                            t(
                              "reports.customerAnalytics.totalSpent",
                              "Total Spent",
                            ),
                          ];
                        }
                        if (name === "averageSpent") {
                          return [
                            formatCurrency(Number(value), currency),
                            t(
                              "reports.customerAnalytics.avgSpent",
                              "Avg Spent",
                            ),
                          ];
                        }
                        return [value, name];
                      }}
                    />
                  }
                />
                <ChartLegend />
                <Bar
                  dataKey="totalSpent"
                  fill="var(--color-totalSpent)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  name={t(
                    "reports.customerAnalytics.totalSpent",
                    "Total Spent",
                  )}
                />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>
      )}

      {/* Customer Segments Table */}
      {segments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.customerAnalytics.segmentDetails", "Segment Details")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.segment",
                        "Segment",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.customers",
                        "Customers",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.totalSpent",
                        "Total Spent",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.avgSpent",
                        "Avg. Spent",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.percentage",
                        "% of Total",
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg, i) => (
                    <tr
                      key={seg.segment_name}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                            }}
                          />
                          <span className="text-gray-900 font-medium">
                            {getTranslatedSegmentName(seg.segment_name)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {seg.customer_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(seg.total_spent, currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(seg.average_spent, currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {seg.percentage_of_total.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Customers (if available) */}
      {topCustomers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-500" weight="duotone" />
            {t("reports.customerAnalytics.topCustomers", "Top Customers")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.customer",
                        "Customer",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.customerAnalytics.columns.orders", "Orders")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.customerAnalytics.columns.totalSpent",
                        "Total Spent",
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.slice(0, 5).map((customer, i) => (
                    <tr
                      key={customer.customer_id ?? i}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <span className="text-gray-900 font-medium">
                              {customer.customer_name}
                            </span>
                            {customer.email && (
                              <p className="text-xs text-gray-500">
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {customer.total_orders.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(customer.total_spent, currency)}
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
