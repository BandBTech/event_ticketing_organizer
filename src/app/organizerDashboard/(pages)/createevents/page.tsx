
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import CreateEventsForm from "../../components/createEventsForm";
import { eventService } from "@/services/eventService";
import { Suspense } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

function CreateEventsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isEditing = searchParams.get("edit") === "true";

  const { data: event, isLoading } = useQuery({
    queryKey: queryKeys.events.detail(id!),
    queryFn: () => eventService.getEvent(id!),
    enabled: !!id && isEditing,
  });

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If editing but no event found (and not loading), one might want to show error, 
  // but CreateEventsForm might handle undefined initialData by just showing empty form.
  // However, usually we want to ensure data is loaded if editing.

  return (
    <CreateEventsForm
      initialData={event}
      isEditing={isEditing}
    />
  );
}

export default function CreateEventsPage() {
  return (
    <ProtectedRoute
      permission={[PERMISSIONS.EVENT_CREATE, PERMISSIONS.EVENT_UPDATE]}
      requireAll={false}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <CreateEventsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
