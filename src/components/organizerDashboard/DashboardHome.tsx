"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  CalendarCheckIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BroadcastIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ClockCounterClockwiseIcon,
  MoneyIcon,
  HourglassIcon,
  BankIcon,
  ClockIcon,
  ReceiptIcon,
  ArrowBendUpLeftIcon,
} from "@phosphor-icons/react";
import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";
import EventCard from "./EventCard";
import { EventSelect } from "@/components/ui/EventSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardEarning } from "@/types/dashboard";

// ─── Design-system card components ───────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  colorClass?: string;
  isLoading?: boolean;
  index?: number;
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  colorClass = "bg-blue-100 text-blue-600",
  isLoading = false,
  index = 0,
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
        <span className="text-sm text-gray-500 truncate">{label}</span>
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
  isLoading?: boolean;
  index?: number;
}

function FinancialCard({
  icon,
  label,
  value,
  description,
  alert = false,
  isLoading = false,
  index = 0,
}: FinancialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      className={`@container/card p-2.5 rounded-2xl glass-card-lowest transition-all ${
        alert ? "border border-amber-200" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            alert ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-6 w-24 mb-1" />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 truncate">{label}</p>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
            </>
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

// ─── Earnings section (one per currency) ─────────────────────────────────────

function EarningsSection({
  earning,
  t,
  isLoading,
  baseIndex,
}: {
  earning: DashboardEarning;
  t: (key: string, fallback: string) => string;
  isLoading: boolean;
  baseIndex: number;
}) {
  const fmt = (n: number) =>
    `${earning.symbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cards: FinancialCardProps[] = [
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" weight="duotone" />,
      label: t("dashboard.grossRevenue", "Gross Revenue"),
      value: fmt(earning.gross_revenue),
      description: t("dashboard.beforeFees", "Before fees & commissions"),
    },
    {
      icon: <MoneyIcon className="w-6 h-6" weight="duotone" />,
      label: t("dashboard.netRevenue", "Net Revenue"),
      value: fmt(earning.net_revenue),
      description: t("dashboard.afterFees", "After platform fees"),
    },
    {
      icon: <HourglassIcon className="w-6 h-6" weight="duotone" />,
      label: t("dashboard.pendingPayout", "Pending Payout"),
      value: fmt(earning.pending_payout),
      description: t("dashboard.awaitingWithdrawal", "Awaiting withdrawal"),
      alert: earning.pending_payout > 0,
    },
    {
      icon: <BankIcon className="w-6 h-6" weight="duotone" />,
      label: t("dashboard.paidOut", "Paid Out"),
      value: fmt(earning.paid_out),
      description: t("dashboard.alreadyWithdrawn", "Already withdrawn"),
    },
  ];

  return (
    <div className="@container">
      <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <FinancialCard
            key={card.label}
            {...card}
            isLoading={isLoading}
            index={baseIndex + i}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Event status colours ─────────────────────────────────────────────────────

const STATUS_HEX = {
  live: "#10b981",
  on_sale: "#8edb01",
  pending: "#fbbf24",
  approved: "#3b82f6",
  rejected: "#f43f5e",
  completed: "#254cda",
  cancelled: "#a1a1aa",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("JPY");
  const [allCurrencies, setAllCurrencies] = useState<{ currency: string; symbol: string }[]>([
    { currency: "JPY", symbol: "¥" },
  ]);
  const { stats, selectedEvent, upcomingEvents, isLoading, error } =
    useOrganizerDashboard(selectedEventId);

  // Keep allCurrencies up-to-date from the unfiltered (no event) response
  useEffect(() => {
    if (!selectedEventId && stats.earnings.length > 0) {
      setAllCurrencies(stats.earnings.map((e) => ({ currency: e.currency, symbol: e.symbol })));
    }
  }, [selectedEventId, stats.earnings]);

  // Auto-sync currency when an event is selected
  useEffect(() => {
    if (selectedEvent?.currency) {
      setSelectedCurrency(selectedEvent.currency);
    }
  }, [selectedEvent]);

  const displayedEarning = stats.earnings.find(
    (e) => e.currency === selectedCurrency,
  );

  const handleEventChange = (value: string) => {
    setSelectedEventId(value || undefined);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    if (selectedEventId && selectedEvent?.currency !== currency) {
      setSelectedEventId(undefined);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        {t(
          "dashboard.failedToLoadData",
          "Failed to load dashboard data. Please try again.",
        )}
      </div>
    );
  }

  // Donut chart — use snake_case keys so CSS vars (--color-live etc.) are valid
  const statusItems = [
    {
      key: "live",
      label: t("status.live", "Live"),
      value: stats.events.live,
      hex: STATUS_HEX.live,
      icon: <BroadcastIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "on_sale",
      label: t("status.on_sale", "On Sale"),
      value: stats.events.on_sale,
      hex: STATUS_HEX.on_sale,
      icon: <ShoppingCartIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "pending",
      label: t("status.pending", "Pending"),
      value: stats.events.pending,
      hex: STATUS_HEX.pending,
      icon: <ClockCounterClockwiseIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "approved",
      label: t("status.approved", "Approved"),
      value: stats.events.approved,
      hex: STATUS_HEX.approved,
      icon: <ThumbsUpIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "rejected",
      label: t("status.rejected", "Rejected"),
      value: stats.events.rejected,
      hex: STATUS_HEX.rejected,
      icon: <ThumbsDownIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "completed",
      label: t("status.completed", "Completed"),
      value: stats.events.completed,
      hex: STATUS_HEX.completed,
      icon: <CheckCircleIcon weight="fill" className="w-6 h-6" />,
    },
    {
      key: "cancelled",
      label: t("status.cancelled", "Cancelled"),
      value: stats.events.cancelled,
      hex: STATUS_HEX.cancelled,
      icon: <XCircleIcon weight="fill" className="w-6 h-6" />,
    },
  ];

  const chartConfig: ChartConfig = {
    value: { label: "Events" },
    live: { label: t("status.live", "Live"), color: STATUS_HEX.live },
    on_sale: {
      label: t("status.on_sale", "On Sale"),
      color: STATUS_HEX.on_sale,
    },
    pending: {
      label: t("status.pending", "Pending"),
      color: STATUS_HEX.pending,
    },
    approved: {
      label: t("status.approved", "Approved"),
      color: STATUS_HEX.approved,
    },
    rejected: {
      label: t("status.rejected", "Rejected"),
      color: STATUS_HEX.rejected,
    },
    completed: {
      label: t("status.completed", "Completed"),
      color: STATUS_HEX.completed,
    },
    cancelled: {
      label: t("status.cancelled", "Cancelled"),
      color: STATUS_HEX.cancelled,
    },
  };

  const chartData = statusItems
    .filter((s) => s.value > 0)
    .map((s) => ({
      status: s.key,
      value: s.value,
      fill: s.hex,
    }));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        {/*<div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            {t("dashboard.keyMetrics", "Key Metrics")}
          </h3>
        </div>*/}

        <div className="@container">
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CalendarCheckIcon className="w-5 h-5" weight="duotone" />}
              label={t("dashboard.totalEvents", "Total Events")}
              value={stats.events.total}
              subValue={`${stats.events.upcoming} ${t("dashboard.upcoming", "upcoming")}`}
              colorClass="bg-blue-100 text-blue-600"
              isLoading={isLoading}
              index={0}
            />
            <StatCard
              icon={<TicketIcon className="w-5 h-5" weight="duotone" />}
              label={t("dashboard.ticketsSold", "Tickets Sold")}
              value={stats.tickets.total_sold}
              subValue={`${stats.tickets.active} ${t("dashboard.active", "active")}`}
              colorClass="bg-purple-100 text-purple-600"
              isLoading={isLoading}
              index={1}
            />
            <StatCard
              icon={<ReceiptIcon className="w-5 h-5" weight="duotone" />}
              label={t("dashboard.transactions", "Transactions")}
              value={stats.transactions.total}
              subValue={`${stats.transactions.completed} ${t("dashboard.completed", "completed")}`}
              colorClass="bg-orange-100 text-orange-600"
              isLoading={isLoading}
              index={2}
            />
            <StatCard
              icon={
                <ArrowBendUpLeftIcon className="w-5 h-5" weight="duotone" />
              }
              label={t("dashboard.refunds", "Refunds")}
              value={
                stats.refunds.pending +
                stats.refunds.processing +
                stats.refunds.completed +
                stats.refunds.failed
              }
              subValue={
                stats.refunds.pending > 0
                  ? `${stats.refunds.pending} ${t("dashboard.pending", "pending")}`
                  : t("dashboard.noPending", "none pending")
              }
              colorClass="bg-red-100 text-red-500"
              isLoading={isLoading}
              index={3}
            />
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="space-y-2">
        {/* Earnings title row with filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-gray-900">
            {t("dashboard.earnings", "Earnings")}
          </h3>
          <div className="flex items-center gap-2">
            <EventSelect
              value={selectedEventId ?? ""}
              onValueChange={handleEventChange}
              triggerWidth="w-52"
              showAllOption={true}
              allOptionLabel={t("dashboard.allEvents", "All events")}
            />
            <Select
              value={selectedCurrency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-28 text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allCurrencies.map((c) => (
                  <SelectItem key={c.currency} value={c.currency}>
                    {c.symbol} {c.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Earnings cards */}
        {isLoading ? (
          <div className="@container">
            <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-2.5 rounded-2xl glass-card-lowest">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : displayedEarning ? (
          <EarningsSection
            earning={displayedEarning}
            t={t}
            isLoading={isLoading}
            baseIndex={0}
          />
        ) : (
          <div className="glass-card-lowest rounded-2xl p-8 text-center">
            <CurrencyDollarIcon
              className="w-12 h-12 mx-auto text-gray-300 mb-3"
              weight="duotone"
            />
            <p className="text-gray-500 text-sm">
              {t("dashboard.noEarningsData", "No earnings data available.")}
            </p>
          </div>
        )}
      </div>

      {/* Event Status Breakdown — Donut + Legend */}

      <h3 className="text-lg font-bold text-gray-800 mb-3">
        {t("dashboard.eventStatusOverview", "Event Status Overview")}
      </h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-lowest rounded-2xl"
      >
        <div className="flex flex-col md:flex-row items-center">
          {/* Recharts donut */}
          <div className="shrink-0 pl-4">
            {isLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Skeleton className="w-32 h-32 rounded-full" />
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-[200px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      const color: string = item.payload.fill;
                      const label =
                        statusItems.find((s) => s.key === item.payload.status)?.label ??
                        String(item.name);
                      return (
                        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {Number(item.value).toLocaleString()}
                          </span>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={3}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats.events.total}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 22}
                                className="fill-muted-foreground text-xs"
                              >
                                {t("dashboard.totalEvents", "Total")}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </div>

          {/* Legend */}
          <div className="grid auto-fit-[180px] gap-x-6 gap-y-4 p-6 flex-1 w-full">
            {statusItems.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 px-2 group"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: s.hex }}
                >
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-400 truncate">{s.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-8 mt-0.5" />
                  ) : (
                    <p className="text-lg font-bold text-gray-800 leading-tight">
                      {s.value}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" weight="duotone" />
          {t("dashboard.upcomingEvents", "Upcoming Events")}
          <span className="text-gray-300">({upcomingEvents.length})</span>
        </h3>

        {upcomingEvents.length === 0 ? (
          <div className="glass-card-lowest rounded-2xl p-8 text-center text-gray-500">
            {t("dashboard.noUpcomingEvents", "No upcoming events found.")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  address: event.venue_name || "",
                  price: 0,
                  category: event.category,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
