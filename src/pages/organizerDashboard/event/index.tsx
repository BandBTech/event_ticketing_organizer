import DashboardLayout from "@/components/layout/DashboardLayout";
import EventsList from "@/components/organizerDashboard/EventsList";
import { useAuthStore } from "@/store/authStore";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function EventsPage() {
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } = useAuthStore();
  const { t } = useTranslation();

  const renderContent = () => {
    if (isOrganizerRejected()) {
      return (
        <div className="p-6">
          <RejectionNotice />
        </div>
      );
    }

    if (isOrganizerPending()) {
      return (
        <div className="p-6">
          <PendingNotice />
        </div>
      );
    }

    if (isOrganizerInactive()) {
      return (
        <div className="p-6">
          <InactiveNotice />
        </div>
      );
    }

    return <EventsList />;
  };

  return (
    <>
      <Head>
        <title>{t("navigation.events", "Events")}</title>
      </Head>
      <DashboardLayout>
        {renderContent()}
      </DashboardLayout>
    </>
  );
}
