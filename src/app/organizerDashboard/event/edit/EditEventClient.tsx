"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import CreateEventsForm from "../../components/eventForm/createEventsForm";
import { eventService } from "@/services/eventService";
import { Suspense } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";


function EditEventContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const safeId = id || "";

  const { data: event, isLoading } = useQuery({
    queryKey: queryKeys.events.detail(safeId),
    queryFn: () => eventService.getEvent(safeId),
    enabled: !!id,
  });

  if (!id) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CreateEventsForm
      initialData={event}
      isEditing={true}
    />
  );
}

export default function EditEventPage() {
  return (
    <ProtectedRoute
      permission={[PERMISSIONS.EVENT_UPDATE]}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <EditEventContent />
      </Suspense>
    </ProtectedRoute>
  );
}
