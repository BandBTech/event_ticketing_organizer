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

export default function EditEventPage() {
  const router = useRouter();
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
        <title>Edit Event | Organizer Dashboard</title>
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
          ) : (
            <CreateEventsForm initialData={event} isEditing={true} />
          )}
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
