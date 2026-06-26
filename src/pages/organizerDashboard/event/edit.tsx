import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { queryKeys } from "@/lib/queryKeys";
import CreateEventsForm from "@/components/organizerDashboard/eventForm/CreateEventsForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function EditEventPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const eventId = id as string;

  const { data: event, isLoading, isError } = useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventService.getEvent(eventId),
    enabled: router.isReady && !!eventId,
  });

  return (
    <>
      <Head>
        <title>{t("event.editEvent", "Edit Event")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute permission={[PERMISSIONS.EVENT_UPDATE]}>
          {!router.isReady || (isLoading && !event) ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : isError || !event ? (
            <div className="p-8 text-center text-red-500">
              {isError ? "Error loading event" : "Event not found"}
            </div>
          ) : !(
              event.status === "pending" ||
              event.status === "draft" ||
              event.status === "rejected" ||
              (process.env.NEXT_PUBLIC_ALLOW_EDIT_APPROVED_EVENTS === "true" &&
                [
                  "approved",
                  "scheduled",
                  "on_sale",
                  "hold",
                  "sales_upcoming",
                  "sales_end",
                ].includes(event.status))
            ) ? (
            <div className="p-8 text-center text-red-500 font-semibold">
              {t("event.error.editNotAllowed", "This event cannot be edited in its current status.")}
            </div>
          ) : (
            <CreateEventsForm initialData={event} isEditing={true} />
          )}
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
