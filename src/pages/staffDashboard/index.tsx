"use client";

import StaffDashboardHome from "@/components/staffDashboard/StaffDashboardHome";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import Head from "next/head";

export default function StaffDashboardPage() {
  return (
    <>
      <Head>
        <title>Staff Dashboard | E-Ticket</title>
      </Head>
      <StaffDashboardLayout>
        <StaffDashboardHome />
      </StaffDashboardLayout>
    </>
  );
}
