"use client";

import { QrCodeIcon, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { eventService } from "@/services/eventService";
import EventCard from "@/components/organizerDashboard/EventCard";
import EventCardSkeleton from "@/components/organizerDashboard/EventCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

export default function StaffDashboardHome() {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["staff", "events", debouncedSearch],
    queryFn: () =>
      eventService.getEvents({
        limit: 100,
        search: debouncedSearch.trim() || undefined,
        sort_by: "title",
        sort_dir: "asc",
      }),
  });

  const liveEvents =
    eventsData?.events
      .filter((e) => {
        if (
          !["approved", "on_sale", "live", "sales_end", "scheduled"].includes(
            e.status,
          )
        )
          return false;
        if (e.end_date && Date.now() > new Date(e.end_date).getTime())
          return false;
        const scanStartTime =
          new Date(e.start_date).getTime() - 25 * 60 * 60 * 1000;
        return Date.now() >= scanStartTime;
      })
      .sort((a, b) => a.title.localeCompare(b.title)) || [];

  const filteredEvents = search.trim()
    ? liveEvents.filter((e) =>
        e.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : liveEvents;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("staffDashboard.welcome", "Welcome")}
        </h1>
        <p className="text-gray-500 mt-2">
          {t(
            "staffDashboard.selectEvent",
            "Select an event below to start scanning tickets.",
          )}
        </p>
      </div>

      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          placeholder={t("staffDashboard.searchEvents", "Search events...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <EventCardSkeleton count={8} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() =>
                router.push(`/staffDashboard/scanner?eventId=${event.id}`)
              }
              customActions={
                <div className="flex gap-2 max-md:flex-col flex-wrap w-full justify-between md:items-center">
                  <Button
                    className="flex-1 gap-2 h-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/staffDashboard/scanner?eventId=${event.id}`,
                      );
                    }}
                  >
                    <QrCodeIcon size={24} />
                    {t("staffDashboard.scan", "Scan Tickets")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/staffDashboard/manual-checkin?eventId=${event.id}`,
                      );
                    }}
                  >
                    {t("staffDashboard.manualCheckin", "Manual Check-in")}
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500">
            {search.trim()
              ? t("staffDashboard.noSearchResults", "No events match your search.")
              : t("staffDashboard.noEvents", "No ongoing events found.")}
          </p>
        </div>
      )}
    </div>
  );
}
