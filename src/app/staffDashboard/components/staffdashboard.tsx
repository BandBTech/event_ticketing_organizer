"use client";

import Image from "next/image";
import {
  MapPinIcon,
  CalendarBlankIcon,
  QrCodeIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { events } from "@/app/data/events";
import Link from "next/link";

export default function StaffDashboardHomePage() {
  const liveEvents = events.filter((e) => e.status === "LIVE");
  const upcomingEvents = events.filter(
    (e) => e.status === "UPCOMING" || e.status === "ON SALE"
  );

  return (
    <div className="p-6 space-y-6">
      {/* Live Events */}
      <section>
        <h2 className="text-xl text-gray-700 font-semibold mb-4 flex items-center gap-2">
          <span className="h-2 w-2  bg-green-500 rounded-full" /> Live Event
        </h2>

        <div className="flex flex-col text-gray-700 xl:flex-row gap-6">
          {liveEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white  shadow rounded-xl overflow-hidden flex flex-col xl:flex-row w-full"
            >
              {/* Event Image */}
              <Image
                src={event.image}
                alt={event.name}
                width={400}
                height={250}
                className="w-full xl:w-64 h-48 object-cover"
              />

              {/* Event Details */}
              <div className="p-4 flex flex-col  justify-between flex-1">
                <div className="space-y-2">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 text-gray-700">
                    {event.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100  rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Name */}
                  <h2 className="font-semibold  text-lg">{event.name}</h2>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <CalendarBlankIcon size={16} /> {event.date} {event.time}
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <MapPinIcon size={16} /> {event.location}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-3">
                <Link
                    href={`/organizerDashboard/pages/eventdetails/${event.id}`}
                    className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
                  >
                    View Detail <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                    <QrCodeIcon size={16} /> Start Ticket Scan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full" /> Upcoming Events
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 text-gray-700 xl:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white  shadow rounded-xl overflow-hidden"
            >
              <Image
                src={event.image}
                alt={event.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />

              <div className="p-4 space-y-2">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Name */}
                <h2 className="font-semibold text-lg">{event.name}</h2>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <CalendarBlankIcon size={16} /> {event.date} {event.time}
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <MapPinIcon size={16} /> {event.location}
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-3">
              
                  <Link
                    href={`/organizerDashboard/pages/eventdetails/${event.id}`}
                    className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
                  >
                    View Detail <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
