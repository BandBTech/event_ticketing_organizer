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
import {
  ActivityIcon,
  CalendarCheckIcon,
  CalendarPlusIcon,
  CalendarStarIcon,
  MoneyWavyIcon,
  TicketIcon,
} from "@phosphor-icons/react/dist/ssr";
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
    image: { src: "/john.jpg" },
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
    image: { src: "/john.jpg" },
  },
  {
    name: "Steve Ater",
    action: "bought 6 tickets",
    event: "Kathmandu Music Festival 2025",
    time: "1d ago",
    image: { src: "/john.jpg" },
  },
  {
    name: "Steve Ater",
    action: "invited you to a chat",
    event: "",
    time: "1d ago",
    image: { src: "/john.jpg" },
  },
];

export default function DashboardHome() {
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-gradient-to-tr ${stat.gradient} transition-all`}
          >
            {stat.icon}
            <div>
              <h2 className="text-2xl text-gray-700 font-bold">{stat.value}</h2>
              <p className="text-sm text-gray-700 ">{stat.label}</p>
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
          className="md:col-span-2 bg-white  rounded-2xl shadow p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className=" flex items-center gap-1 font-semibold text-gray-700 ">
              <CalendarStarIcon className=" flex  w-5 h-5" /> Kathmandu Music
              Festival 2025
            </h3>
            <select className="border border-gray-500 text-gray-700 rounded-lg px-3 py-1 text-sm bg-transparent ">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <h4 className="text-lg text-gray-700 font-medium mb-2">
            Ticket Sales
          </h4>
          <p className="text-sm text-gray-500 mb-4">Oct 1 – Oct 7</p>

          <div className="h-64 text-gray-700">
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
          className="bg-white rounded-2xl text-gray-700 shadow p-6"
        >
          <h3 className="font-semibold text-gray-700  mb-4 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-blue-500" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="felx items-start p-3 border border-gray-200 rounded-xl bg-white  hover:shadow-md transition"
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
                        // Add unoptimized for static export if needed, or next-image-export-optimizer
                        unoptimized
                      />
                    </div>
                  )}

                  {/* User Info */}
                  <div>
                    <p className="text-sm text-gray-800 ">
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
