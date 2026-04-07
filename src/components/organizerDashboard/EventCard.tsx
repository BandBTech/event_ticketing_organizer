"use client";

import { ArrowRight, PencilLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { EventMinimal } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import {
  CalendarDotsIcon,
  MapPinAreaIcon,
} from "@phosphor-icons/react/dist/ssr";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { EventStatusBadge } from "./EventStatusBadge";
import { Badge } from "../ui/badge";
import { CrownIcon } from "@phosphor-icons/react";
import FeaturedBadge from "./FeaturedBadge";

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
  onClick?: () => void;
  customActions?: React.ReactNode;
}

export default function EventCard({
  event,
  onClick,
  customActions,
}: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const categories = parseCategories(event.category);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if text selection is happening
    if (window.getSelection()?.toString()) return;

    if (onClick) {
      onClick();
    } else {
      router.push(`/organizerDashboard/event/details?id=${event.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-xl bg-white/60 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-16/10">
        <Image
          src={event.banner_image || "/placeholder.png"}
          alt={event.title}
          fill={true}
          className="w-full h-full object-cover"
          unoptimized
        />
        {/* {event.status &&
        event.sales_status === "stopped" &&
        !["completed", "cancelled"].includes(event.status) ? (
          <SalesStatusBadge
            status={event.sales_status}
            className="absolute top-2 left-2"
          />
        ) : (
          event.status && (
            <EventStatusBadge
              status={event.status}
              className="absolute top-2 left-2 shadow-lg"
            />
          )
        )} */}
        {event.status && (
          <EventStatusBadge
            status={event.status}
            className="absolute top-2 left-2 shadow-lg"
          />
        )}
        {event.is_featured && (
          <div className="absolute top-2 right-2">
            <FeaturedBadge />
          </div>
        )}
      </div>

      <div className="p-4 space-y-1 flex flex-col flex-1">
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

        <h3
          title={event.title}
          className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2"
        >
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDotsIcon className="w-4 h-4" />
          {formatDateTime(event.start_date)}
        </div>
        {event.end_date && event.end_date !== event.start_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDotsIcon className="w-4 h-4" />
            {formatDateTime(event.end_date)}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinAreaIcon className="w-4 h-4" />
          {/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(event.address?.trim())
            ? event.venue_name
            : [event.venue_name, event.address].filter(Boolean).join(", ")}
        </div>

        <div className="mt-auto">
          <div className="my-4 border-t border-gray-300" />

          {customActions ? (
            customActions
          ) : (
            <div className="flex justify-between items-center">
              <Link
                href={`/organizerDashboard/event/details?id=${event.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
              >
                {t("common.viewDetail")} <ArrowRight className="w-4 h-4" />
              </Link>
              <PermissionGuard permission={PERMISSIONS.EVENT_UPDATE}>
                {(event.status === "pending" || event.status === "draft") && (
                  <Link
                    href={`/organizerDashboard/event/edit?id=${event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg"
                  >
                    <PencilLine className="w-4 h-4" />
                  </Link>
                )}
              </PermissionGuard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
