import { useEffect } from "react";
import { useRouter } from "next/router";
import StaffDashboardHome from "@/pages/staffDashboard/components/StaffDashboardHome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Head from "next/head";
import { useAuthStore } from "@/store/authStore";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, _authChecked } = useAuthStore();

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
        <title>Staff Dashboard | Timro-Ticket</title>
      </Head>
      <DashboardLayout>
        <StaffDashboardHome />
      </DashboardLayout>
    </>
  );
}
