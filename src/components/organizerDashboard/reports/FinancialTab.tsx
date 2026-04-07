"use client";

import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  WalletIcon,
  TrendUpIcon,
  ReceiptIcon,
  ClockIcon,
  PresentationChartIcon,
  TicketIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
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
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface FinancialTabProps {
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

const EVENT_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
];

export function FinancialTab({ startDate, endDate }: FinancialTabProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useReport("financial", {
    start_date: startDate,
    end_date: endDate,
  });

  // Type the API response based on the actual structure
  const report = data as
    | {
        summary_metrics?: {
          total_gross_revenue?: number;
          total_commission?: number;
          total_organizer_share?: number;
          total_refunds?: number;
          net_revenue?: number;
          pending_payouts?: number;
          completed_payouts?: number;
          average_ticket_price?: number;
          total_transactions?: number;
        };
        revenue_breakdown?: Array<{
          event_title: string;
          gross_revenue: number;
          commission: number;
          organizer_share: number;
          refunds: number;
          net_revenue: number;
        }> | null;
        commission_history?: Array<{
          id: string;
          event_id: string;
          event_title: string;
          revenue: number;
          commission_rate: number;
          commission_amount: number;
          created_at: string;
        }> | null;
        bill_history?: Array<{
          id: string;
          bill_number: string;
          amount: number;
          status: string;
          processed_at: string;
          created_at: string;
        }> | null;
        payout_history?: Array<{
          payout_id: string;
          amount: number;
          status: string;
          created_at: string;
        }> | null;
        currency_breakdown?: Array<{
          currency: string;
          gross_revenue: number;
          commission: number;
          organizer_share: number;
          transaction_count: number;
          percentage_of_total: number;
        }> | null;
      }
    | undefined;

  const summary = report?.summary_metrics;
  const revenueBreakdown = report?.revenue_breakdown ?? [];
  const commissionHistory = report?.commission_history ?? [];
  const billHistory = report?.bill_history ?? [];
  const payoutHistory = report?.payout_history ?? [];
  const currencyBreakdown = report?.currency_breakdown ?? [];

  // Primary stats
  const primaryStats = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.financial.grossRevenue", "Gross Revenue"),
      value: formatCurrency(summary?.total_gross_revenue ?? 0),
      subValue:
        summary?.net_revenue !== undefined &&
        summary.net_revenue !== summary.total_gross_revenue
          ? `${t("reports.financial.net", "Net")}: ${formatCurrency(summary.net_revenue)}`
          : undefined,
      colorClass: "bg-green-100 text-green-600",
    },
    {
      icon: <TicketIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.financial.avgTicketPrice", "Avg. Ticket Price"),
      value: formatCurrency(summary?.average_ticket_price ?? 0),
      subValue: summary?.total_transactions
        ? `${summary.total_transactions.toLocaleString()} ${t("reports.financial.transactions", "transactions")}`
        : undefined,
      colorClass: "bg-purple-100 text-purple-600",
    },
    {
      icon: <WalletIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.financial.organizerShare", "Organizer Share"),
      value: formatCurrency(summary?.total_organizer_share ?? 0),
      subValue: summary?.total_commission
        ? `${t("reports.financial.commission", "Commission")}: ${formatCurrency(summary.total_commission)}`
        : undefined,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      icon: <ReceiptIcon className="w-6 h-6" weight="duotone" />,
      label: t("reports.financial.totalRefunds", "Total Refunds"),
      value: formatCurrency(summary?.total_refunds ?? 0),
      subValue: undefined,
      colorClass: "bg-red-100 text-red-600",
    },
  ];

  // Payout stats
  const payoutStats = [
    {
      icon: <ClockIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.financial.pendingPayouts", "Pending Payouts"),
      value: formatCurrency(summary?.pending_payouts ?? 0),
      description: t(
        "reports.financial.awaitingWithdrawal",
        "Awaiting withdrawal",
      ),
      alert: (summary?.pending_payouts ?? 0) > 0,
    },
    {
      icon: <CreditCardIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.financial.completedPayouts", "Completed Payouts"),
      value: formatCurrency(summary?.completed_payouts ?? 0),
      description: t("reports.financial.paidOut", "Paid out"),
    },
    {
      icon: <TrendUpIcon className="w-5 h-5" weight="duotone" />,
      label: t("reports.financial.netRevenue", "Net Revenue"),
      value: formatCurrency(summary?.net_revenue ?? 0),
      description: t("reports.financial.afterRefunds", "After refunds"),
    },
  ];

  // Revenue breakdown by event — top 10 by gross revenue
  const revenueByEventData = [...revenueBreakdown]
    .sort((a, b) => b.gross_revenue - a.gross_revenue)
    .slice(0, 10)
    .map((item, i) => ({
      name:
        item.event_title.length > 22
          ? item.event_title.substring(0, 22) + "…"
          : item.event_title,
      organizerShare: item.organizer_share,
      commission: item.commission,
      color: EVENT_COLORS[i % EVENT_COLORS.length],
    }));

  // Currency breakdown for pie chart
  const currencyChartData = currencyBreakdown.map((curr, i) => ({
    name: curr.currency,
    value: curr.gross_revenue,
    percentage: curr.percentage_of_total,
    color: EVENT_COLORS[i % EVENT_COLORS.length],
  }));

  const hasAnyData =
    !isLoading &&
    ((summary?.total_gross_revenue ?? 0) > 0 || revenueBreakdown.length > 0);

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
            {t("reports.financial.noDataTitle", "No Financial Data Available")}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t(
              "reports.financial.noDataDescription",
              "Financial data will appear here once transactions are processed for your events.",
            )}
          </p>
        </div>
      )}

      {/* Primary Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.financial.keyMetrics", "Key Metrics")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
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

      {/* Payout Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("reports.financial.payoutOverview", "Payout Overview")}
        </h2>
        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
            {payoutStats.map((stat, i) => (
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

      {/* Revenue by Event + Currency Breakdown — side by side */}
      {(revenueByEventData.length > 0 ||
        (currencyChartData.length > 0 && currencyChartData.length <= 4)) && (
        <div className="@container">
          <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-6 items-start">
            {/* Revenue by Event */}
            {revenueByEventData.length > 0 && (
              <ChartCard
                title={t(
                  "reports.financial.revenueBreakdown",
                  "Revenue Breakdown",
                )}
                isLoading={isLoading}
                isEmpty={!isLoading && revenueByEventData.length === 0}
              >
                <ChartContainer
                  config={{
                    organizerShare: {
                      label: t(
                        "reports.financial.organizerShare",
                        "Organizer Share",
                      ),
                      color: "hsl(var(--chart-1))",
                    },
                    commission: {
                      label: t("reports.financial.commission", "Commission"),
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-64 sm:h-80 w-full"
                >
                  <BarChart
                    layout="vertical"
                    data={revenueByEventData}
                    margin={{ top: 4, right: 4, left: 8, bottom: 4 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1_000_000)
                          return `$${(value / 1_000_000).toFixed(1)}M`;
                        if (value >= 1_000)
                          return `$${(value / 1_000).toFixed(0)}k`;
                        return `$${value}`;
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="bg-card text-card-foreground border-border rounded-lg"
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name,
                          ]}
                        />
                      }
                    />
                    <ChartLegend />
                    <Bar
                      dataKey="organizerShare"
                      name={t(
                        "reports.financial.organizerShare",
                        "Organizer Share",
                      )}
                      stackId="revenue"
                      fill="var(--color-organizerShare)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="commission"
                      name={t("reports.financial.commission", "Commission")}
                      stackId="revenue"
                      fill="var(--color-commission)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              </ChartCard>
            )}

            {/* Currency Breakdown */}
            {currencyChartData.length > 0 && currencyChartData.length <= 4 && (
              <ChartCard
                title={t(
                  "reports.financial.revenueByCurrency",
                  "Revenue by Currency",
                )}
                isLoading={isLoading}
                isEmpty={!isLoading && currencyChartData.length === 0}
              >
                <ChartContainer
                  config={Object.fromEntries(
                    currencyChartData.map((curr) => [
                      curr.name,
                      {
                        label: curr.name,
                        color: curr.color,
                      },
                    ]),
                  )}
                  className="h-64 sm:h-72 w-full"
                >
                  <PieChart>
                    <Pie
                      data={currencyChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      innerRadius="40%"
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {currencyChartData.map((entry, index) => (
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
                          className="bg-card text-card-foreground border-border rounded-lg"
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <ChartLegend />
                  </PieChart>
                </ChartContainer>
              </ChartCard>
            )}
          </div>
        </div>
      )}

      {/* Revenue Breakdown Table */}
      {revenueBreakdown.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("reports.financial.eventBreakdown", "Event Breakdown")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.event", "Event")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.financial.columns.grossRevenue",
                        "Gross Revenue",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.commission", "Commission")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.financial.columns.organizerShare",
                        "Organizer Share",
                      )}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.refunds", "Refunds")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.netRevenue", "Net Revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueBreakdown.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-gray-900 font-medium truncate max-w-xs">
                            {item.event_title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.gross_revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(item.commission)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(item.organizer_share)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {item.refunds > 0 ? formatCurrency(item.refunds) : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(item.net_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Commission History */}
      {commissionHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-gray-500" weight="duotone" />
            {t("reports.financial.recentCommissions", "Recent Commissions")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {commissionHistory.slice(0, 10).map((commission, i) => (
                <div
                  key={commission.id ?? i}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                      <ArrowUpRightIcon className="w-5 h-5" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {commission.event_title ??
                          t("reports.financial.unknownEvent", "Unknown Event")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(commission.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-600">
                      {formatCurrency(commission.commission_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {commission.commission_rate}%{" "}
                      {t("reports.financial.of", "of")}{" "}
                      {formatCurrency(commission.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bill History (if available) */}
      {billHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-gray-500" weight="duotone" />
            {t("reports.financial.billHistory", "Bill History")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.billNumber", "Bill Number")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.amount", "Amount")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.status", "Status")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t(
                        "reports.financial.columns.processedAt",
                        "Processed At",
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billHistory.map((bill, i) => {
                    const statusColor =
                      bill.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : bill.status === "partially_paid"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700";
                    return (
                      <tr
                        key={bill.id ?? i}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs text-gray-600">
                            {bill.bill_number}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor}`}
                          >
                            {bill.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {new Date(bill.processed_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payout History (if available) */}
      {payoutHistory && payoutHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-gray-500" weight="duotone" />
            {t("reports.financial.payoutHistory", "Payout History")}
          </h2>
          <div className="glass-card-lowest rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.payoutId", "Payout ID")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.amount", "Amount")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.status", "Status")}
                    </th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                      {t("reports.financial.columns.date", "Date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout, i) => {
                    const statusColor =
                      payout.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : payout.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700";
                    return (
                      <tr
                        key={payout.payout_id ?? i}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs text-gray-600">
                            {payout.payout_id?.substring(0, 8)}...
                          </code>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {new Date(payout.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
