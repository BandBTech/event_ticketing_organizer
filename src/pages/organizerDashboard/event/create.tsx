import CreateEventsForm from "@/components/organizerDashboard/eventForm/CreateEventsForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import Head from "next/head";

export default function CreateEventPage() {
  return (
    <>
      <Head>
        <title>Create Event | Organizer Dashboard</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute permission={[PERMISSIONS.EVENT_CREATE]}>
          <CreateEventsForm isEditing={false} />
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
