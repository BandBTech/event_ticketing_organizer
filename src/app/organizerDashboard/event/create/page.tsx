"use client";

import CreateEventsForm from "../../components/eventForm/createEventsForm";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default function CreateEventsPage() {
  return (
    <ProtectedRoute
      permission={[PERMISSIONS.EVENT_CREATE]}
    >
      <CreateEventsForm
        isEditing={false}
      />
    </ProtectedRoute>
  );
}
