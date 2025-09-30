"use client";

import { Image as ImageIcon, MapPinned, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CreateEventPage() {
  const [showPromo, setShowPromo] = useState(false);
  return (
    <div className="p-6 space-y-6">
      {/* Event details */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-600">Event details</h2>

          {/* Banner + Title + Tags */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Banner Image</label>
              <div className="border-2 border-dashed border-gray-300 flex flex-col items-center rounded-lg p-6 text-center text-gray-500 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <ImageIcon />
                <br />
                Upload banner image or drag & drop
                <span className="text-xs">
                  PNG/JPG file of 1820x1200px size up to 5MB
                </span>
                <br />
                <button className="border rounded-lg px-3 py-1 text-sm">
                  Browse File
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Event title</label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. Music, Concert, Festival"
                    className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium">Event description</label>
                <textarea
                  placeholder="Tell what makes your event special"
                  className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Venue & Schedule */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-600">
            Venue & Schedule
          </h2>
          <div className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Venue name</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Venue name"
              />
            </div>
            <div className="flex relative flex-col">
              <label className="text-sm font-medium">Venue address</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter venue location"
              />
              <MapPinned className="absolute right-3 top-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">
                Capacity <span className="opacity-20">(optional)</span>
              </label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Venue name"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="text-sm font-medium">Timezone</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Timezone"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="text-sm font-medium">Start date & time</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Venue name"
                type="datetime-local"
              />
            </div>{" "}
            <div className="flex flex-col">
              <label className="text-sm font-medium">End date & time</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Venue name"
                type="datetime-local"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticketing */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-600">Ticketing</h2>
          <div className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Tier Name</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter name of venue"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Price</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g. 100"
                type="number"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Quantity</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter number of quantity"
                type="number"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">GST(%)</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter GST in percentage"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Sales start</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                type="datetime-local"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Sales ends</label>
              <input
                className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                type="datetime-local"
              />
            </div>
          </div>
          <button className="flex items-center px-3 py-1 text-sm border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4" /> Add ticket tier
          </button>
        </div>
      </div>

      {/* Discounts & Promo Codes */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-600">
            Discounts & Promo Codes
          </h2>

          {showPromo && (
            <>
            <div className="grid md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 ">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Promo code</label>
                <input
                  className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g EARLYBIRD"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Discount Type</label>
                <input
                  className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Select Types"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Amount</label>
                <input
                  className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="500"
                  type="number"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Quantity</label>
                <input
                  className="w-full px-3 py-2 mt-1  border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="500"
                  type="number"
                />
              </div>
              <Trash2 
              onClick={() => setShowPromo(false)}
              className="absolute right-1/20 transform -translate-y-1/2 border rounded text-red-400 w-5 h-5 " />
            </div>
              <button
              className=" flex items-center px-3 py-1 text-sm border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" /> Add promo code
            </button>
            </>
          )}
          {!showPromo && (
            <button
              onClick={() => setShowPromo(true)}
              className=" flex items-center px-3 py-1 text-sm border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" /> Add promo code
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
          Cancel
        </button>
        <button className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700">
          Save as draft
        </button>
        <button className="flex items-center px-4 py-2 gap-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>
    </div>
  );
}
