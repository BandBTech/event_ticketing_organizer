import { useEffect } from "react";
import { useRouter } from "next/router";
import StaffDashboardHome from "@/pages/staffDashboard/components/StaffDashboardHome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Head from "next/head";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, _authChecked } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!_authChecked) return;
    if (!user?.roles?.includes("staff")) {
      router.replace("/organizerDashboard");
    }
  }, [_authChecked, user, router]);

  // Don't render until auth is verified
  if (!_authChecked || !user?.roles?.includes("staff")) return null;

  return (
    <>
      <Head>
        <title>{t("staffDashboard.title", "Staff Dashboard")}</title>
      </Head>
      <DashboardLayout>
        <StaffDashboardHome />
      </DashboardLayout>
    </>
  );
}
