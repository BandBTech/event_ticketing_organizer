import CreateEventsForm from "@/components/organizerDashboard/eventForm/CreateEventsForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function CreateEventPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("event.createNewEvent", "Create New Event")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute permission={[PERMISSIONS.EVENT_CREATE]}>
          <CreateEventsForm isEditing={false} />
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
