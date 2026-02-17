

import StaffDashboardHome from "@/components/staffDashboard/StaffDashboardHome";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Head from "next/head";

export default function StaffDashboardPage() {
  return (
    <>
      <Head>
        <title>Staff Dashboard | E-Ticket</title>
      </Head>
      <DashboardLayout>
        <StaffDashboardHome />
      </DashboardLayout>
    </>
  );
}
