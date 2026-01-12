"use client";

import { ArrowRight, PencilLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EventMinimal } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import { CalendarDotsIcon, MapPinAreaIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { SalesStatusBadge } from "./SalesStatusBadge";

/**
 * Get badge color class based on event status
 */
function getStatusBadgeClass(status: string): string {
  const statusClasses: Record<string, string> = {
    approved: "bg-emerald-500 hover:bg-emerald-500",
    pending: "bg-amber-500 hover:bg-amber-500",
    cancelled: "bg-red-500 hover:bg-red-500",
    draft: "bg-gray-500 hover:bg-gray-500",
    live: "bg-green-500 hover:bg-green-500",
    ended: "bg-gray-500 hover:bg-gray-500",
    rejected: "bg-red-500 hover:bg-red-500",
  };
  return statusClasses[status] || "bg-gray-500 hover:bg-gray-500";
}

/**
 * Parse categories from API response (handles string or string[] format)
 */
function parseCategories(category: string | string[]): string[] {
  const rawCategories = Array.isArray(category)
    ? category
    : typeof category === "string"
      ? category.split(",")
      : [];

  return rawCategories
    .map((tag: string) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
    .filter(Boolean);
}

interface EventCardProps {
  event: EventMinimal;
}

export default function EventCard({ event }: EventCardProps) {
  const categories = parseCategories(event.category);

  return (
    <div className="rounded-xl bg-white/60 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-16/10">
        <Image
          src={event.banner_image || "/placeholder.png"}
          alt={event.title}
          fill={true}
          className="w-full h-full object-cover"
        />
        {/* Event Status Badge */}
        {event.status && (
          <Badge
            className={`absolute top-2 left-2 uppercase font-semibold shadow-lg ${getStatusBadgeClass(event.status)}`}
          >
            {event.status}
          </Badge>
        )}
        {/* Sales Status Badge */}
        {event.status === "approved" && (
          <SalesStatusBadge
            status={event.sales_status}
            className="absolute top-2 right-2"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-1 flex flex-col flex-1">
        {/* Tags */}
        {categories.length > 0 && (
          <div className="flex text-gray-700 flex-wrap gap-2">
            {categories.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-200 px-2 py-1 rounded-lg break-all"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {event.title}
        </h3>

        {/* Date & Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDotsIcon className="w-4 h-4" />
          {formatDateTime(event.start_date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinAreaIcon className="w-4 h-4" />
          {event.address || "Location TBA"}
        </div>

        {/* Actions */}
        <div className="mt-auto">
          <div className="my-4 border-t border-gray-300" />
          <div className="flex justify-between items-center">
            <Link
              href={`/organizerDashboard/eventdetails?id=${event.id}`}
              className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
            >
              View Detail <ArrowRight className="w-4 h-4" />
            </Link>
            <PermissionGuard permission={PERMISSIONS.EVENT_UPDATE}>
              {(event.status === "pending" || event.status === "draft") && (
                <Link
                  href={`/organizerDashboard/createevents?id=${event.id}&edit=true`}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg"
                >
                  <PencilLine className="w-4 h-4" />
                </Link>
              )}
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>
  );
}
