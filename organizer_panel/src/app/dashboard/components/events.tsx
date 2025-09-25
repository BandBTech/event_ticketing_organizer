"use client";

import { useState } from "react";
import { Calendar, MapPin, Search, Filter, ArrowRight, PencilLine, ArrowLeft } from "lucide-react";
import Image from "next/image";

const events = [
  {
    id: 1,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/kat.jpg",
    status: "ON SALE",
    tags: ["Music", "Concert", "Festival"],
  },
  {
    id: 2,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/nep.jpg",
    status: "SALE ON HOLD",
    tags: ["Music", "Concert", "Festival"],
  },
   {
    id: 3,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/kat.jpg",
    status: "SALE ON HOLD",
    tags: ["Music", "Concert", "Festival"],
  },
   {
    id: 4,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/nep.jpg",
    status: "SALE ON HOLD",
    tags: ["Music", "Concert", "Festival"],
  },
   {
    id: 5,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/kat.jpg",
    status: "SALE ON HOLD",
    tags: ["Music", "Concert", "Festival"],
  },
   {
    id: 6,
    title: "Kathmandu Music Festival 2025",
    date: "2025-08-12 09:00 AM",
    location: "Kathmandu, Nepal",
    image: "/nep.jpg",
    status: "SALE ON HOLD",
    tags: ["Music", "Concert", "Festival"],
  },
  // Add more events...
];

export default function Events() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex-1 px-6 py-4">
      {/* Page Header */}
      {/* <h2 className="text-2xl font-semibold mb-4">Events</h2> */}
      {/* Search + Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button className="ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter events
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-40">
              <Image
                src={event.image}
                alt={event.title}
                fill={true}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-2 left-2 text-xs font-semibold px-3 py-1 rounded-full text-white ${
                  event.status === "ON SALE"
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-yellow-500 to-amber-400"
                }`}
              >
                {event.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title}
              </h3>

              {/* Date & Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>

              {/* Actions */}
            <div className="my-4 border-t border-gray-300 dark:border-gray-700" />
              <div className="flex justify-between items-center mt-3">
                <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg ">
                  View Detail <ArrowRight className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg ">
                  <PencilLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
        <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <button className="px-3 py-1 rounded-full border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          3
        </button>
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
