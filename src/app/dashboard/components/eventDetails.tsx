"use client";

import Footer from "@/components/footer";
import {
  MapPin,
  Calendar,
  XCircle,
  PauseCircle,
  PencilLine,
  CircleDot,
} from "lucide-react";
import Image from "next/image";

type EventType = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: string;
  tickets: number;
  description: string;
  image: string;
  tags: string[];
  venue: string;
};

export default function EventDetailsPage({event}:{event: EventType}) {
  return (
    <>
      <div className="p-6 space-y-6">
        {/* Event Title + Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {event.name}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="bg-green-500 flex items-center gap-2 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                <CircleDot className="w-3 h-3" />
                {event.status}
              </span>
              <div className="flex items-center gap-1 dark:text-white">
                <Calendar size={14} /> {event.date} {event.time}
              </div>
              <div className="flex items-center gap-1 dark:text-white">
                <MapPin size={14} />{event.location}
              </div>
            </div>
          </div>

          <div className="flex gap-3 ">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
              <PauseCircle size={16} /> Pause Sales
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
              <PencilLine size={16} /> Edit Event
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-200 text-red-500 hover:bg-red-300">
              <XCircle size={16} /> Cancel
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left - Event Info */}
          {/* Banner */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden relative h-1/2">
              <Image
                src={event.image}
                alt="Event Banner"
                fill={true}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Description */}
            <div className="rounded-xl  p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold dark:text-black ">
                Event description
              </h3>
              <p className="text-gray-600">
              {event.description}
              </p>
              <div className="flex flex-wrap gap-2 ">
                <h3 className="w-full text-lg font-semibold dark:text-black mb-2">Tags</h3>
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Details */}
              <div className=" grid grid-cols-2 gap-4 dark:text-black">
                <div>
                  <h3 className="font-semibold">Venue</h3>
                  <p className="font-medium text-gray-500">
                    {event.venue}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold ">Location</h3>
                  <p className="font-medium text-gray-500">{event.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold ">Event Starts On</h3>
                  <p className="font-medium text-gray-500">
                    25-Sep-2025 9:00 AM
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold ">Event Ends On</h3>
                  <p className="font-medium text-gray-500">
                    {event.date} {event.time}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Ticket Sales Starts On</h3>
                  <p className="font-medium text-gray-500">
                    5-Sep-2025 9:00 AM
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Ticket Sales Ends On</h3>
                  <p className="font-medium text-gray-500">
                    25-Sep-2025 9:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Ticket Sales */}
          <div className="space-y-6 dark:text-black">
            {/* Ticket Tiers */}
            <div className="rounded-xl  bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">Ticket Tiers/Sales</h3>
              {[
                {
                  name: "General",
                  price: 2000,
                  sold: 800,
                  total: 2000,
                  labelClass: "text-gray-700",
                  barClass: "bg-gray-500",
                  cardClass: "bg-gray-50",
                },
                {
                  name: "Premium",
                  price: 3500,
                  sold: 350,
                  total: 1500,
                  labelClass: "text-amber-700",
                  barClass: "bg-amber-500",
                  cardClass: "bg-amber-50",
                },
                {
                  name: "VIP",
                  price: 5000,
                  sold: 800,
                  total: 1000,
                  labelClass: "text-orange-700",
                  barClass: "bg-orange-500",
                  cardClass: "bg-orange-50",
                },
                {
                  name: "VVIP",
                  price: 15000,
                  sold: 200,
                  total: 500,
                  labelClass: "text-purple-700",
                  barClass: "bg-purple-500",
                  cardClass: "bg-purple-50",
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`space-y-2 p-3 rounded-lg shadow-sm ${tier.cardClass}`}
                >
                  <div className="flex justify-between text-sm">
                    <p className={`font-semibold ${tier.labelClass}`}>
                      {tier.name}
                    </p>
                    <p className="text-gray-600"></p>
                    NPR {tier.price}/ticket <br />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${tier.barClass} h-2 rounded-full`}
                      style={{
                        width: `${(tier.sold / tier.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm">
                    {tier.sold}/{tier.total} sold
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-2 border-t-1 p-2">
                <div>
                  <p className="font-semibold">Total Sales</p>
                  <p className="font-semibold">2150/5000</p>
                </div>
                <div className="justify-items-end">
                  <p className="font-semibold">Total Revenue</p>
                  <p className="font-semibold">NPR 9,825,000</p>
                </div>
              </div>
            </div>

            {/* Promo Codes */}
            <div className="rounded-xl  bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">Promo/Discount Codes</h3>
              {[
                { code: "EARLYBIRD10", value: 200, used: 25, total: 100 },
                { code: "PROMO101", value: 1000, used: 20, total: 50 },
              ].map((promo) => (
                <div key={promo.code} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <p className="font-medium text-blue-500">{promo.code}</p>
                    <p>NPR {promo.value}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(promo.used / promo.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {promo.used}/{promo.total} used
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
