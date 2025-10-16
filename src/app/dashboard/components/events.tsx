"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  PencilLine,
  ArrowLeft,
  CircleDot,
} from "lucide-react";
import Image from "next/image";
import { events } from "@/app/data/events";
import Link from "next/link";


export default function Events() {
  const [search, setSearch] = useState("");
  return (
    <div className="flex-1 px-6 py-4">
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden dark:bg-gray-500 "
          >
            {/* Image */}
            <div className="relative h-40">
              <Image
                src={event.image}
                alt={event.name}
                fill={true}
                className="w-full h-full object-cover"
              />
              <span
                className={`flex items-center gap-1 absolute top-2 left-2 text-xs font-semibold px-3 py-1 rounded-full text-white ${
                  event.status === "ON SALE"
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-yellow-500 to-amber-400"
                }`}
              >
                {event.status === "ON SALE" && (
                  <CircleDot className="w-3 h-3" />
                )}
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
                    className="text-xs bg-gray-100 px-2 py-1 rounded-lg dark:bg-gray-600 "
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {event.name}
              </h3>

              {/* Date & Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-900">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-900">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>

              {/* Actions */}
              <div className="my-4 border-t border-gray-300 dark:border-gray-900" />
              <div className="flex justify-between items-center mt-3">
             <Link
                    href={`/dashboard/pages/eventdetails/${event.id}`}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-900 dark:text-gray-900 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg dark:hover:bg-gray-400"
                  >
                    View Detail <ArrowRight className="w-4 h-4" />
                  </Link>
            
                <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-900 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400 hover:shadow-lg ">
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
