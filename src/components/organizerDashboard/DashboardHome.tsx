"use client";
import { motion } from "framer-motion";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
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
  NoteIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";
import EventCard from "./EventCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export default function DashboardHome() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { stats, upcomingEvents, isLoading, error } = useOrganizerDashboard();

  const statCards = [
    {
      icon: <CalendarCheckIcon className="w-10 h-10 text-yellow-500" />,
      label: "Total Events Organized",
      value: stats.events.total,
      gradient: "from-yellow-50 to-white",
    },
    {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-green-500" />,
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      gradient: "from-green-50 to-white",
    },
    {
      icon: <MoneyIcon className="w-10 h-10 text-emerald-600" />,
      label: "Organizer Earnings",
      value: `Rs. ${stats.organizerEarnings.toLocaleString()}`,
      gradient: "from-emerald-50 to-white",
    },
    {
      icon: <TicketIcon className="w-10 h-10 text-blue-500" />,
      label: "Total Tickets Sold",
      value: stats.totalTicketsSold,
      gradient: "from-blue-50 to-white",
    },
    {
      icon: <CalendarPlusIcon className="w-10 h-10 text-purple-500" />,
      label: "Upcoming Events",
      value: stats.upcomingEventsCount,
      gradient: "from-purple-50 to-white",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

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

  return (
    <div className="space-y-6 p-4">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-2 px-3 py-4 rounded-2xl shadow bg-linear-to-tr ${stat.gradient} transition-all`}
          >
            {stat.icon}
            <div>
              <h2 className="text-2xl text-gray-700 font-bold">{stat.value}</h2>
              <p className="text-sm text-gray-700 ">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Status Breakdown — Donut + Legend */}
      {(() => {
        const statusItems = [
          {
            label: "Live",
            value: stats.events.live,
            hex: "#10b981",
            icon: <BroadcastIcon weight="fill" className="w-6 h-6" />,
          },
          {
            label: "On Sale",
            value: stats.events.on_sale,
            hex: "#8edb01",
            icon: <ShoppingCartIcon weight="fill" className="w-6 h-6" />,
          },
          // { label: "Draft", value: stats.events.draft, hex: "#94a3b8", icon: <NoteIcon weight="fill" className="w-6 h-6 },
          {
            label: "Pending",
            value: stats.events.pending,
            hex: "#fbbf24",
            icon: (
              <ClockCounterClockwiseIcon weight="fill" className="w-6 h-6" />
            ),
          },
          {
            label: "Approved",
            value: stats.events.approved,
            hex: "#3b82f6",
            icon: <ThumbsUpIcon weight="fill" className="w-6 h-6" />,
          },
          {
            label: "Rejected",
            value: stats.events.rejected,
            hex: "#f43f5e",
            icon: <ThumbsDownIcon weight="fill" className="w-6 h-6" />,
          },
          {
            label: "Completed",
            value: stats.events.completed,
            hex: "#254cda",
            icon: <CheckCircleIcon weight="fill" className="w-6 h-6" />,
          },
          {
            label: "Cancelled",
            value: stats.events.cancelled,
            hex: "#a1a1aa",
            icon: <XCircleIcon weight="fill" className="w-6 h-6" />,
          },
        ];

        const total = stats.events.total || 1; // avoid division by zero

        // Build conic-gradient stops
        let cumulativeDeg = 0;
        const conicStops = statusItems
          .filter((s) => s.value > 0)
          .map((s) => {
            const startDeg = cumulativeDeg;
            const span = (s.value / total) * 360;
            cumulativeDeg += span;
            return `${s.hex} ${startDeg}deg ${cumulativeDeg}deg`;
          })
          .join(", ");

        const donutBg =
          stats.events.total === 0
            ? "conic-gradient(#e5e7eb 0deg 360deg)"
            : `conic-gradient(${conicStops})`;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow px-8 pt-5 pb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-5">
              {t("dashboard.eventStatusOverview", "Event Status Overview")}
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="relative shrink-0 px-3">
                <div
                  className="w-32 h-32 rounded-full"
                  style={{ background: donutBg }}
                />
                {/* Center hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-gray-800">
                      {stats.events.total}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      Total
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 flex-1 w-full">
                {statusItems.map((s, i) => {
                  return (
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
                        <p className="text-sm text-gray-400 truncate">
                          {s.label}
                        </p>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                          {s.value}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Upcoming Events List */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          {t("dashboard.upcomingEvents", "Upcoming Events")} (
          {stats.upcomingEventsCount})
        </h3>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            {t("dashboard.noUpcomingEvents", "No upcoming events found.")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  address: event.venue_name || "", // Fallback to venue name or empty since API doesn't return address
                  price: 0, // Dashboard endpoint doesn't return price
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
