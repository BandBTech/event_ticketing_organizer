"use client";
import { motion } from "framer-motion";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";
import EventCard from "./EventCard";

export default function DashboardHome() {
  const { stats, upcomingEvents, isLoading, error } = useOrganizerDashboard();

  const statCards = [
    {
      icon: <CalendarCheckIcon className="w-10 h-10 text-yellow-500" />,
      label: "Total Events Organized",
      value: stats.totalEvents,
      gradient: "from-yellow-50 to-white",
    },
    {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-green-500" />,
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      gradient: "from-green-50 to-white",
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
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-linear-to-tr ${stat.gradient} transition-all`}
          >
            {stat.icon}
            <div>
              <h2 className="text-2xl text-gray-700 font-bold">{stat.value}</h2>
              <p className="text-sm text-gray-700 ">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Events List */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Upcoming Events
        </h3>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            No upcoming events found. Create your first event!
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
