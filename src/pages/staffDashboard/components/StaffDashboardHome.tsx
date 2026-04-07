"use client";

import { QrCodeIcon, ListNumbers } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import EventCard from "@/components/organizerDashboard/EventCard";
import EventCardSkeleton from "@/components/organizerDashboard/EventCardSkeleton";
import { useLanguageStore } from "@/store/languageStore";

export default function StaffDashboardHome() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["staff", "events"],
    queryFn: () => eventService.getEvents({ limit: 50 }),
  });

  const liveEvents =
    eventsData?.events.filter((e) => {
      if (!["approved", "on_sale", "live"].includes(e.status)) return false;
      const scanStartTime =
        new Date(e.start_date).getTime() - 24 * 60 * 60 * 1000;
      return Date.now() >= scanStartTime;
    }) || [];

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

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <EventCardSkeleton count={8} />
        </div>
      ) : liveEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liveEvents.map((event) => (
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
            {t("staffDashboard.noEvents", "No ongoing events found.")}
          </p>
        </div>
      )}
    </div>
  );
}
