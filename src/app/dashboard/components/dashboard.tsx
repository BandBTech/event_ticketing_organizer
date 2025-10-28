"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { ActivityIcon, CalendarCheckIcon, CalendarPlusIcon, CalendarStarIcon, MoneyWavyIcon, TicketIcon } from "@phosphor-icons/react";
import Image from "next/image";

const data = [
  { name: "Oct 1", value: 186 },
  { name: "Oct 2", value: 305 },
  { name: "Oct 3", value: 237 },
  { name: "Oct 4", value: 73 },
  { name: "Oct 5", value: 209 },
  { name: "Yesterday", value: 214 },
  { name: "Today", value: 228 },
];

const activities = [
  {
    name: "Hola Spine",
    action: "bought 6 tickets",
    event: "Kathmandu Music Festival 2025",
    time: "2m ago",
    image: { src: "/john.jpg"},
  },
  {
    name: "Event Approved",
    action: "for Grand Event",
    event: "",
    time: "5m ago",
  },
  {
    name: "Pierre Ford",
    action: "bought 6 tickets",
    event: "Kathmandu Music Festival 2025",
    time: "15m ago",
     image: { src: "/john.jpg"},
  },
  {
    name: "Steve Ater",
    action: "bought 6 tickets",
    event: "Kathmandu Music Festival 2025",
    time: "1d ago",
     image: { src: "/john.jpg"},
  },
  {
    name: "Steve Ater",
    action: "invited you to a chat",
    event: "",
    time: "1d ago",
     image: { src: "/john.jpg"},
  },
];

export default function DashboardHomePage() {
  const stats = [
    {
      icon: <CalendarCheckIcon className="w-10 h-10 text-yellow-500" />,
      label: "Total Events Organized",
      value: "12",
      gradient: "from-yellow-50 to-white",
    },
    {
      icon: <MoneyWavyIcon className="w-10 h-10 text-green-500" />,
      label: "Total Revenue (All Time)",
      value: "$1,234,900",
      gradient: "from-green-50 to-white",
    },
    {
      icon: <TicketIcon className="w-10 h-10 text-blue-500" />,
      label: "Total Tickets Sold",
      value: "12,500",
      gradient: "from-blue-50 to-white",
    },
    {
      icon: <CalendarPlusIcon className="w-10 h-10 text-purple-500" />,
      label: "Upcoming Events",
      value: "2",
      gradient: "from-purple-50 to-white",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-gradient-to-tr ${stat.gradient} dark:from-gray-800 dark:to-gray-900 transition-all`}
          >
            {stat.icon}
            <div>
              <h2 className="text-2xl font-bold">{stat.value}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className=" flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-100">
            <CalendarStarIcon className=" flex  w-5 h-5" />  Kathmandu Music Festival 2025
            </h3>
            <select className="border border-gray-500 rounded-lg px-3 py-1 text-sm bg-transparent dark:border-gray-700">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <h4 className="text-lg font-medium mb-2">Ticket Sales</h4>
          <p className="text-sm text-gray-500 mb-4">Oct 1 – Oct 7</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
        >
          <h3 className="font-semibold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-blue-500" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="felx items-start p-3 border border-gray-200 rounded-xl bg-white dark:bg-gray-900 hover:shadow-md transition"
              >
  <div className="flex items-start gap-3">
          {/* User Image */}
          {a.image && (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={a.image.src}
                alt={a.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}

          {/* User Info */}
          <div>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <span className="font-semibold">{a.name}</span> {a.action}
            </p>
            {a.event && (
              <p className="text-xs text-gray-500 mt-1">{a.event}</p>
            )}
          </div>
                <p className="text-xs text-gray-400 whitespace-nowrap mt-1 w-12 text-left">
          {a.time}
        </p>
        </div>
      
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
