"use client";

import DashboardHomePage from "@/components/organizerDashboard/DashboardHome";
import { useAuthStore } from "@/store/authStore";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } =
    useAuthStore();
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

    return <DashboardHomePage />;
  };

  return (
    <>
      <Head>
        <title>{t("navigation.dashboard", "Dashboard")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute>
          <div className="mx-auto">{renderContent()}</div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
